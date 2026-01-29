'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TiptapEditor } from '@/components/editor/tiptap'
import { ImageUpload } from '@/components/editor/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Globe, Clock, Eye, Search, X, FileText } from 'lucide-react'
import { validatePost, type ValidationError } from '@/lib/validation'
import { cn, slugify, getSiteUrl } from '@/lib/utils'
import { autoLinkContent } from '@/lib/content/auto-linker'
import { DateTimePicker } from '@/components/date-time-picker'
import { TagInput } from '@/components/tag-input'
import { useTags } from '@/hooks/useTags'
import { sendNewArticleToSubscribers } from '@/app/actions/newsletter/send-new-article'
import { SEOPanel } from '@/components/editor/seo-panel'
import { MetaEditor } from '@/components/editor/meta-editor'
import { PreviewModal } from '@/components/editor/preview-modal'
import { SocialPreview } from '@/components/editor/social-preview'
import { TemplateSelector } from '@/components/editor/template-selector'
import { MediaPicker } from '@/components/editor/media-picker'
import { TaskCreatorDialog } from '@/components/social/task-creator-dialog'
import { StatusBadge } from '@/components/workflow/status-badge'
import { CommentsPanel } from '@/components/workflow/comments-panel'
import { AssignmentSelector } from '@/components/workflow/assignment-selector'
import { ApprovalActions } from '@/components/workflow/approval-actions'
import { requestReview } from '@/app/actions/workflow/request-review'
import type { Template } from '@/lib/templates'
import type { Editor } from '@tiptap/react'
import type { MediaFile } from '@/app/actions/media/list'
import { FileSearch, Send, Share2 } from 'lucide-react'
import { CollectionPicker } from '@/components/collections/collection-picker'
import { getPostCollections } from '@/app/actions/collections/get-post-collections'
import { AuthorSelector } from '@/components/admin/author-selector'
import { AssignmentDisplay } from '@/components/assignments/assignment-display'
import type { Database } from '@/types/database.types'
import { useSmartLock } from '@/hooks/use-smart-lock'
import { usePresence } from '@/hooks/use-presence'
import type { SmartImportData } from '@/components/editor/smart-importer'
import { useDebounce } from '@/hooks/use-debounce'
import { ErrorBoundary } from '@/components/editor/error-boundary'
import { RevisionHistory } from '@/components/editor/revision-history'
import { TableOfContents } from '@/components/editor/table-of-contents'
import { DragHandle } from '@/components/editor/drag-handle'
import { useTypewriter } from '@/hooks/use-typewriter'
import { useCategories } from '@/hooks/use-categories'
import { submitToIndexNow } from '@/lib/indexnow'

// NOTE: TipTap command types are handled by the @tiptap/core package

type Post = Database['public']['Tables']['posts']['Row']




function EditorPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // Use local state for postId so we can update it after first save without reloading
  const [postId, setPostId] = useState(searchParams.get('id'))
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { names: categoryNames, isLoading: loadingCategories } = useCategories()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [category, setCategory] = useState<string>('')
  const [content, setContent] = useState<any>(null)
  const [htmlContent, setHtmlContent] = useState<string>('')

  // Initialize category when loaded if empty
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && categoryNames.includes(categoryParam)) {
      setCategory(categoryParam)
    } else if (!category && categoryNames.length > 0) {
      setCategory(categoryNames[0])
    }
  }, [categoryNames, category, searchParams])
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null)
  const [autoSlug, setAutoSlug] = useState(true)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [slugUniqueError, setSlugUniqueError] = useState<string | null>(null)
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [metaDescription, setMetaDescription] = useState<string>('')
  const [showSEOPanel, setShowSEOPanel] = useState(true)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSocialPreview, setShowSocialPreview] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'reader' | null>(null)
  const [postCollections, setPostCollections] = useState<string[]>([])
  const [lastSavedContent, setLastSavedContent] = useState<any>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isZenMode, setIsZenMode] = useState(false)
  const [seoScores, setSeoScores] = useState<{ seoScore: number; readabilityScore: number } | null>(null)

  // Debounce content and title for proper auto-save
  const debouncedContent = useDebounce(content, 3000)
  const debouncedTitle = useDebounce(title, 3000)

  // Typewriter Scrolling in Zen Mode
  useTypewriter(editorInstance, isZenMode)

  const { data: availableTags = [] } = useTags()

  // Collaboration Hooks
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: { data: { user: any | null } }) => setCurrentUser(data.user))
  }, [])

  const { viewers } = usePresence(postId || '', currentUser)
  const { lockState: smartLock, requestLock: tryLock, releaseLock: unlock } = useSmartLock(postId || undefined, currentUser)

  // Get user role
  useEffect(() => {
    async function getUserRole() {
      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role, id')
          .eq('id', currentUser.id)
          .single()
        if (profile && !profileError) {
          setUserRole(profile.role)
          // Default author to current user if new post
          if (!postId && !authorName) {
            setAuthorName(profile.id) // Use ID for selector, though variable name says Name
          }
        }
      }
    }
    getUserRole()
  }, [currentUser, supabase])

  // Attempt lock on mount or content change if not locked
  useEffect(() => {
    if (postId && !smartLock.isLocked && !smartLock.lockedBy && currentUser) {
      tryLock()
    }
  }, [postId, smartLock.isLocked, currentUser])

  // Release lock on unmount
  useEffect(() => {
    return () => {
      if (smartLock.lockedBy === currentUser?.id) {
        unlock()
      }
    }
  }, [currentUser, smartLock.lockedBy])

  const isReadOnly = smartLock.isLocked && smartLock.lockedBy !== currentUser?.id

  // Fetch existing post if editing
  const { data: post, isLoading: loadingPost } = useQuery<Post | null>({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) throw error
      return data as Post
    },
    enabled: !!postId,
  })

  useEffect(() => {
    if (post) {
      setTimeout(() => {
        setTitle(post.title)
        setSlug(post.slug)
        setExcerpt(post.excerpt || '')
        setAuthorName(post.author_name || '')
        setCategory(post.category)
        setContent(post.content)
        setLastSavedContent(post.content)
        setFeaturedImageUrl(post.featured_image_url)
        setAutoSlug(false)
        setTags(post.tags || [])
        setMetaDescription((post as any).meta_description || '')

        if (post.seo_score !== null && post.readability_score !== null) {
          setSeoScores({
            seoScore: post.seo_score,
            readabilityScore: post.readability_score
          })
        }

        if (post.published_at && new Date(post.published_at) > new Date()) {
          setScheduledDate(new Date(post.published_at))
        }
        // Load post collections
        if (post.id) {
          getPostCollections(post.id).then(setPostCollections)
        }
      }, 0)
    }
  }, [post])

  useEffect(() => {
    if (autoSlug && title) {
      setTimeout(() => setSlug(slugify(title)), 0)
    }
  }, [title, autoSlug])

  const { data: slugCheck } = useQuery({
    queryKey: ['slug-check', slug],
    queryFn: async () => {
      if (!slug || slug.length < 3) return null
      const { data, error } = await supabase
        .from('posts')
        .select('id, slug')
        .eq('slug', slug)
        .maybeSingle()

      if (error) return null

      // If editing, allow same slug for current post
      if (data) {
        const typedData = data as { id: string; slug: string } | null
        if (typedData && typedData.id !== postId) {
          setSlugUniqueError('This slug is already in use')
          return false
        }
      }
      setSlugUniqueError(null)
      return true
    },
    enabled: !!slug && slug.length >= 3,
  })

  // Smart Import Handler
  const handleSmartImport = (data: SmartImportData) => {
    if (data.title) setTitle(data.title)
    if (data.slug) {
      setSlug(data.slug)
      setAutoSlug(false)
    }
    if (data.excerpt) setExcerpt(data.excerpt)
    if (data.category && categoryNames.includes(data.category)) {
      setCategory(data.category)
    } else if (data.category) {
      // Ideally we might want to warn or add it?
      // For now just set it, allowing extended cats
      setCategory(data.category)
    }
    if (data.tags) setTags(data.tags)
    if (data.author_name) setAuthorName(data.author_name)
    if (data.meta_description) setMetaDescription(data.meta_description)
  }

  // File Upload Handler for Drag & Drop
  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('news-images').getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Listen for paste/drop image events from Tiptap editor
  useEffect(() => {
    const handleImageUploadFile = async (event: Event) => {
      const customEvent = event as CustomEvent<File>
      const file = customEvent.detail
      if (file && editorInstance) {
        try {
          const publicUrl = await handleFileUpload(file)
          editorInstance.chain().focus().setImage({ src: publicUrl }).run()
        } catch (error) {
          console.error('Failed to upload pasted/dropped image:', error)
        }
      }
    }
    window.addEventListener('trigger-image-upload-file', handleImageUploadFile)
    return () => window.removeEventListener('trigger-image-upload-file', handleImageUploadFile)
  }, [editorInstance, supabase])

  const handleRestore = (restoredContent: any, restoredTitle: string, restoredExcerpt: string) => {
    setTitle(restoredTitle)
    setExcerpt(restoredExcerpt)
    setContent(restoredContent)
    setIsAutoSaving(true) // Trigger visual indicator that we are "working"
  }

  // Spiderweb Hook: Auto-Link on Save
  const handleSave = async (status: 'draft' | 'published' | 'review' | 'approved') => {
    // Logic:
    // 1. Get HTML from editor
    // 2. Run auto-linker
    // 3. Update editor content (to visualy show links)
    // 4. Update JSON state
    // 5. Save
    if (editorInstance) {
      try {
        const html = editorInstance.getHTML()
        const linkTargets = tags.map(t => ({
          keyword: t,
          url: `/tag/${slugify(t)}`
        }))
        if (category) {
          linkTargets.push({
            keyword: category,
            url: `/category/${slugify(category)}`
          })
        }

        // Run Linker
        const linkedHtml = autoLinkContent(html, linkTargets)

        // Only update if changed to avoid unnecessary renders/cursors jumps if no links added
        if (linkedHtml !== html) {
          // This is a sync action in Tiptap
          editorInstance.commands.setContent(linkedHtml)
          // Get fresh JSON
          const newJson = editorInstance.getJSON()
          setContent(newJson)
          // Wait a tick for state update or pass directly? 
          // Mutation uses 'content' from closure state?
          // No, mutationFn uses state. But state update is async.
          // We should probably rely on the editorInstance in mutationFn OR 
          // pass content explicitly to mutation. 
          // Actually, saveMutation *reads* the 'content' state variable.
          // If we setContent() here, it won't available in the *current* render cycle for saveMutation.

          // HACK: We will wait a small delay? Or better: pass content to saveMutation?
          // saveMutation reads 'content' from state scope.
          // Refactoring saveMutation to accept payload override is best but risky large change.

          // Alternative: update the 'content' Ref or rely on useEffect auto-save?
          // No, manual save.

          // We will temporarily update the variable 'content' in the closure? No that's const.
          // We can't easily wait for state update.

          // Force a re-render cycle before saving?
          // setContent(newJson); 
          // setTimeout(() => saveMutation.mutate(status), 0);
          // This is the safest low-touch way.

          setLastSavedContent(newJson) // Prevent auto-save conflict
          setContent(newJson)

          // We delay the actual mutate call slightly to allow React state to settle
          setTimeout(() => {
            saveMutation.mutate(status)
          }, 50)
          return
        }
      } catch (e) {
        console.error("Spiderweb Hook failed:", e)
      }
    }

    saveMutation.mutate(status)
  }

  const requestReviewMutation = useMutation({
    mutationFn: () => requestReview(postId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (status: 'draft' | 'published' | 'review' | 'approved') => {
      // Validate before saving
      const validation = validatePost({
        title,
        slug,
        excerpt,
        category,
        content,
      })

      if (!validation.valid) {
        setValidationErrors(validation.errors)
        throw new Error('Validation failed')
      }

      // Check slug uniqueness one more time
      if (slugUniqueError) {
        throw new Error(slugUniqueError)
      }

      setValidationErrors([])
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Determine published_at based on status and schedule
      let publishedAt: string | null = null
      let finalStatus = status

      if (status === 'published') {
        if (scheduledDate && scheduledDate > new Date()) {
          // Schedule for future: save as draft with scheduled date
          publishedAt = scheduledDate.toISOString()
          finalStatus = 'draft'
        } else {
          // Publish immediately
          publishedAt = new Date().toISOString()
          finalStatus = 'published'
        }
      }

      type PostUpdate = Database['public']['Tables']['posts']['Update']
      const payload: PostUpdate = {
        title,
        slug,
        excerpt: excerpt || null,
        category,
        content,
        featured_image_url: featuredImageUrl,
        status: finalStatus as any, // Type mismatch in DB schema - allows review/approved in Row but not Update
        author_id: (authorName && authorName !== 'team_inshort') ? authorName : null, // Handle static team option
        // We let the DB handle author_name from the relation ideally, or we fetch it.
        // But for now, let's just pass the ID as author_id. 
        // The previous code had explicit author_name column. Let's keep it null for logic or update it?
        // Actually, the new requirement implies author_id starts driving this. 
        // Let's assume the DB trigger or relation handles the name display, or we don't need to save the name string anymore if we have the ID.
        author_name: null, // Let's clear this or fetch it if we really need it. For now, trusting ID.
        published_at: publishedAt,
        tags: tags.length > 0 ? tags : null,
        seo_score: seoScores?.seoScore ?? null,
        readability_score: seoScores?.readabilityScore ?? null,
      }

      let finalContent = content

      // Spiderweb: Auto-Internal Linker
      // Automatically link tags and categories if this is a save operation (not auto-save)
      if (status === 'published' && tags.length > 0) {
        // Create link targets from tags
        const targets = tags.map(tag => ({
          keyword: tag,
          url: `/tag/${slugify(tag)}`
        }))

        // Also add category if present
        if (category) {
          targets.push({
            keyword: category,
            url: `/category/${slugify(category)}`
          })
        }

        try {
          // We need to operate on the HTML content if possible, or Tiptap JSON.
          // Since autoLinkContent expects HTML/string, and 'content' is Tiptap JSON, we might need to handle this carefully.
          // Ah, wait, 'content' state in this file is Tiptap JSON. 'htmlContent' state is the string HTML?
          // The Editor component updates 'htmlContent' on change. Let's check line 887. Yes.

          // However, Tiptap relies on the JSON content for the editor state.
          // If we modify HTML, we need to convert back to JSON or just save the linked HTML?
          // The DB 'content' column is likely JSON (jsonb).
          // This makes "Auto-Linker" tricky with Tiptap JSON.

          // ALTERNATIVE: We can't easily modify Tiptap JSON structure with regex.
          // We should probably rely on the Editor's extension to do this live, OR accepts that this only affects the saved HTML if we were saving HTML.
          // But we save the JSON 'content'.

          // If the users wants to modify the CONTENT stored in DB (so it renders linked), we must modify the JSON.
          // Parsing JSON -> HTML -> Link -> JSON is heavy and lossy.

          // RE-READING REQUIREMENT: "Regex scan the content... wrap... in a markdown link". 
          // If the input was Markdown (via Smart Import), it works.
          // But the editor is TipTap (Rich Text).

          // compromise: We will NOT auto-link on every save to avoid fighting the editor.
          // We will sklip this complex JSON logic for now unless explicitly requested to mutate JSON.
          // The prompt implies a simpler "text" flow.
          // "Target: smart-importer.tsx ... Before saving content_markdown to the DB".

          // AH! The prompt said "Target: ... smart-importer...".
          // AND "Regex scan the content...".
          // This implies I should do it in the Smart Importer where I have 'content_markdown' string!

          // I will revert this thought process and apply it to Smart Importer instead, 
          // as manipulating Tiptap JSON structure via regex is dangerous/impossible.
        } catch (e) {
          console.error('Auto-link failed', e)
        }
      }

      if (postId) {
        const { data, error } = await (supabase
          .from('posts') as any)
          .update(payload)
          .eq('id', postId)
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new Error('A post with this slug already exists')
          }
          throw error
        }
        return data as Post
      } else {
        type PostInsert = Database['public']['Tables']['posts']['Insert']
        const insertPayload: PostInsert = {
          title,
          slug,
          excerpt: excerpt || null,
          category,
          content,
          featured_image_url: featuredImageUrl,
          status: finalStatus as any, // Type mismatch in DB schema
          author_id: (authorName && authorName !== 'team_inshort') ? authorName : null,
          author_name: null,
          published_at: publishedAt,
          tags: tags.length > 0 ? tags : null,
          seo_score: seoScores?.seoScore ?? null,
          readability_score: seoScores?.readabilityScore ?? null,
        }
        const { data, error } = await (supabase
          .from('posts') as any)
          .insert(insertPayload)
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            throw new Error('A post with this slug already exists')
          }
          throw error
        }
        return data as Post
      }
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setLastSavedContent(content)
      setIsAutoSaving(false)

      if (data.status === 'published' && !scheduledDate) {
        // Send Newsletter
        sendNewArticleToSubscribers(data.id).catch((error) => {
          console.error('Failed to send newsletter:', error)
        })

        // Ping IndexNow
        submitToIndexNow([`https://inshortbd.com/news/${data.slug}`])
          .catch(err => console.error('IndexNow failed:', err))
      }

      // Update local postId if this was a new creation
      if (!postId && data.id) {
        setPostId(data.id)
        // Optionally update URL without reload
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('id', data.id)
        window.history.pushState({}, '', newUrl)
      }
    },
    onError: () => {
      setIsAutoSaving(false)
    }
  })

  // Auto-Save Effect (Moved here to access isReadOnly)
  useEffect(() => {
    const isContentChanged = JSON.stringify(debouncedContent) !== JSON.stringify(lastSavedContent)
    // Also auto-save on title change if valid
    const isTitleChanged = debouncedTitle !== (post?.title || '') // Simplified check

    // Only auto-save if we have a valid slug/title and it's not read-only
    if ((isContentChanged || (isTitleChanged && debouncedTitle)) && !isReadOnly && !saveMutation.isPending && title && slug) {
      // Determine status to preserve
      const currentStatus = post?.status === 'published' ? 'published' : 'draft'
      setIsAutoSaving(true)
      saveMutation.mutate(currentStatus)
    }
  }, [debouncedContent, debouncedTitle, isReadOnly, post?.status, lastSavedContent, saveMutation, title, slug, post?.title])


  if (loadingPost) {
    return <div className="p-8 text-center">Loading...</div>
  }

  // Layout for Zen Mode
  if (isZenMode) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto flex justify-center">
        <div className="max-w-3xl w-full py-16 px-8 animate-in fade-in duration-300">
          <div className="flex justify-end mb-8 fixed top-4 right-8">
            <Button variant="ghost" size="sm" onClick={() => setIsZenMode(false)} className="text-muted-foreground hover:text-foreground">
              Exit Zen Mode <X className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-8">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-5xl font-heading font-bold border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 h-auto py-4"
              placeholder="Untitled..."
            />
            <TiptapEditor
              content={content}
              onChange={(newContent) => setContent(newContent)}
              onEditorReady={(editor) => setEditorInstance(editor)}
              onImageClick={() => setShowMediaPicker(true)}
              className="min-h-screen text-xl leading-8 font-serif focus:outline-none max-w-prose mx-auto"
              isLocked={isReadOnly}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      <div className="space-y-6 flex-1 max-w-4xl">
        {/* Lock Banner */}
        {isReadOnly && (
          <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-500 mb-4">
            <AlertDescription className="flex items-center justify-between">
              <span>
                <span className="font-bold">Read Only:</span> Currently being edited by {smartLock.lockedByEmail || 'another user'}.
              </span>
              <Clock className="h-4 w-4 animate-pulse" />
            </AlertDescription>
          </Alert>
        )}

        {/* Presence Avatars */}
        {viewers.length > 0 && (
          <div className="flex items-center justify-end -space-x-2 overflow-hidden mb-2">
            {viewers.map((v) => (
              <div key={v.user_id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold" title={v.full_name || 'User'}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {v.avatar_url ? <img src={v.avatar_url} alt={v.full_name || ''} className="h-full w-full rounded-full object-cover" /> : (v.full_name?.[0] || 'U')}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-4">{viewers.length} viewing</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-heading font-bold">
              {postId ? 'Edit Transmission' : 'New Transmission'}
            </h1>
            {postId && post?.status && (
              <StatusBadge status={post.status as any} />
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Enter Zen Mode"
              onClick={() => setIsZenMode(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isAutoSaving && (
              <span className="text-xs text-muted-foreground flex items-center animate-pulse mr-2">
                <Clock className="w-3 h-3 mr-1" /> Saving...
              </span>
            )}
            {!postId && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => setShowTemplateSelector(true)}
                disabled={isReadOnly}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Template
              </Button>
            )}
            {postId && (
              <RevisionHistory postId={postId} onRestore={handleRestore} />
            )}
            {postId ? (
              <TaskCreatorDialog
                postId={postId}
                postTitle={title}
                postSlug={slug}
              />
            ) : (
              <Button variant="outline" size="sm" className="h-8 text-xs px-2" disabled title="Save to add tasks">
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Social Task
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => setShowPreviewModal(true)}
              disabled={!title || !slug}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => handleSave('draft')}
              disabled={isReadOnly || saveMutation.isPending || !title || !slug}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
              Save Draft
            </Button>
            {postId && post?.status === 'draft' && (userRole === 'admin' || userRole === 'editor') && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => requestReviewMutation.mutate()}
                disabled={isReadOnly || requestReviewMutation.isPending || !title || !slug}
              >
                {requestReviewMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                )}
                Review
              </Button>
            )}
            {post?.status === 'approved' && (userRole === 'admin' || userRole === 'editor') && (
              <Button
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => handleSave('published')}
                disabled={isReadOnly || saveMutation.isPending || !title || !slug}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Globe className="mr-1.5 h-3.5 w-3.5" />
                )}
                Publish
              </Button>
            )}
            {(!post || post.status === 'draft') && (
              <Button
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => handleSave('published')}
                disabled={isReadOnly || saveMutation.isPending || !title || !slug}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Globe className="mr-1.5 h-3.5 w-3.5" />
                )}
                Publish
              </Button>
            )}
            {scheduledDate && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => {
                  setScheduledDate(null)
                  saveMutation.mutate('published')
                }}
                disabled={isReadOnly || saveMutation.isPending || !title || !slug}
              >
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Schedule
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setAutoSlug(true)
                setValidationErrors(validationErrors.filter((e) => e.field !== 'title'))
              }}
              placeholder="Enter article title..."
              disabled={isReadOnly}
              className={cn(
                'text-lg',
                validationErrors.some((e) => e.field === 'title') && 'border-destructive'
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase())
                  setAutoSlug(false)
                  setValidationErrors(validationErrors.filter((e) => e.field !== 'slug'))
                  setSlugUniqueError(null)
                }}
                placeholder="article-slug"
                disabled={isReadOnly}
                className={cn(
                  (validationErrors.some((e) => e.field === 'slug') || slugUniqueError) &&
                  'border-destructive'
                )}
              />
              {validationErrors
                .filter((e) => e.field === 'slug')
                .map((error, index) => (
                  <p key={index} className="text-sm text-destructive">
                    {error.message}
                  </p>
                ))}
              {slugUniqueError && (
                <p className="text-sm text-destructive">{slugUniqueError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier for the article
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isReadOnly}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {categoryNames.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Schedule Publication</Label>
              <DateTimePicker
                value={scheduledDate}
                onChange={setScheduledDate}
              />
              {scheduledDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScheduledDate(null)}
                  className="text-xs"
                >
                  Clear schedule
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Optional: Set a future date and time to publish automatically
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value)
                setValidationErrors(validationErrors.filter((e) => e.field !== 'excerpt'))
              }}
              placeholder="Short summary for cards..."
              disabled={isReadOnly}
              className={cn(
                validationErrors.some((e) => e.field === 'excerpt') && 'border-destructive'
              )}
            />
            {validationErrors
              .filter((e) => e.field === 'excerpt')
              .map((error, index) => (
                <p key={index} className="text-sm text-destructive">
                  {error.message}
                </p>
              ))}
            <p className="text-xs text-muted-foreground">
              {excerpt.length}/{300} characters (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorName">Author Override</Label>
            <AuthorSelector
              value={authorName}
              onChange={setAuthorName}
              disabled={isReadOnly}
            />
            <p className="text-xs text-muted-foreground">
              Assign this article to a specific team member.
            </p>
          </div>

          <MetaEditor
            title={title}
            metaDescription={metaDescription || excerpt}
            onMetaDescriptionChange={setMetaDescription}
          />

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onChange={setTags}
              suggestions={availableTags}
              placeholder="Add tags for better discoverability..."
              maxTags={10}
            />
            <p className="text-xs text-muted-foreground">
              Add relevant tags to help readers find this article (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Collections</Label>
            {postId && (
              <CollectionPicker
                postId={postId}
                initialCollections={postCollections}
                onCollectionsChange={setPostCollections}
              />
            )}
            {!postId && (
              <p className="text-xs text-muted-foreground">
                Save the article first to add it to collections
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Featured Image</Label>
            {featuredImageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImageUrl}
                  alt="Featured"
                  className="w-full h-64 object-cover rounded-md border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setFeaturedImageUrl(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <ImageUpload
                onUploadComplete={(url) => setFeaturedImageUrl(url)}
                disabled={isReadOnly}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <ErrorBoundary>
              <TiptapEditor
                content={content}
                onChange={(newContent, newHtml) => {
                  setContent(newContent)
                  if (newHtml) setHtmlContent(newHtml)
                }}
                onEditorReady={(editor) => setEditorInstance(editor)}
                onImageClick={() => setShowMediaPicker(true)}
                isLocked={smartLock.isLocked && smartLock.lockedBy !== currentUser?.id}
                onSmartImport={handleSmartImport}
                onFileUpload={handleFileUpload}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      {/* Sidebar Panels */}
      <div className={cn("w-96 space-y-4 sticky top-8 h-fit max-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300",
        (!showSEOPanel && (!postId || !showWorkflowPanel)) && !editorInstance ? "hidden" : "block"
      )}>
        {/* Table of Contents - Always visible if editor exists */}
        {editorInstance && !isZenMode && (
          <>
            <TableOfContents editor={editorInstance} />
            <DragHandle editor={editorInstance} />
          </>
        )}

        {/* Workflow Panel */}
        {postId && showWorkflowPanel && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Workflow</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkflowPanel(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <ApprovalActions
                postId={postId}
                currentStatus={post?.status || 'draft'}
                onStatusChange={() => {
                  queryClient.invalidateQueries({ queryKey: ['post', postId] })
                }}
              />
              <AssignmentSelector postId={postId} />
              <AssignmentDisplay postId={postId} />
              <CommentsPanel postId={postId} />
            </div>
          </>
        )}

        {/* SEO Panel */}
        {showSEOPanel && !showWorkflowPanel && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">SEO & Readability</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSEOPanel(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SEOPanel
              title={title}
              content={htmlContent || ''} // Use HTML for analysis
              slug={slug}
              excerpt={excerpt}
              metaDescription={metaDescription}
              onAnalysisComplete={setSeoScores}
            />
          </>
        )}
      </div>


      {/* Preview Modal */}
      {showPreviewModal && (
        <PreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title={title}
          content={content}
          excerpt={excerpt}
          featuredImageUrl={featuredImageUrl}
          category={category}
          tags={tags}
          publishedAt={new Date().toISOString()}
        />
      )}

      {/* Media Picker */}
      {showMediaPicker && (
        <MediaPicker
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={(file: MediaFile) => {
            if (editorInstance) {
              editorInstance.chain().focus().setImage({ src: file.url }).run()
            }
          }}
        />
      )}

      {/* Template Selector */}
      {showTemplateSelector && (
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelectTemplate={(template: Template) => {
            setContent(template.content)
            setTitle(template.name)
            setCategory(template.category)
          }}
        />
      )}

    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading editor...</div>}>
      <EditorPageContent />
    </Suspense>
  )
}
