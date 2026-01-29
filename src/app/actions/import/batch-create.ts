'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'

export interface BatchImportPost {
    title: string
    excerpt?: string
    category: string
    content_markdown?: string
    // Optional fields if we expand
    slug?: string
    tags?: string[]
    author_name?: string
    meta_description?: string
}

interface BatchImportResult {
    success: boolean
    count?: number
    errors?: string[]
}



export async function batchCreatePosts(posts: BatchImportPost[]): Promise<BatchImportResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, errors: ['Not authenticated'] }
    }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
        return { success: false, errors: ['No valid posts provided'] }
    }

    const { marked } = await import('marked')
    const { generateJSON } = await import('@tiptap/html')
    const { default: Document } = await import('@tiptap/extension-document')
    const { default: Paragraph } = await import('@tiptap/extension-paragraph')
    const { default: Text } = await import('@tiptap/extension-text')
    const { default: Heading } = await import('@tiptap/extension-heading')
    const { default: Bold } = await import('@tiptap/extension-bold')
    const { default: Italic } = await import('@tiptap/extension-italic')
    const { default: ListItem } = await import('@tiptap/extension-list-item')
    const { default: BulletList } = await import('@tiptap/extension-bullet-list')
    const { default: OrderedList } = await import('@tiptap/extension-ordered-list')

    const validPosts = []
    const errors = []

    // 1. Prepare Data
    for (const post of posts) {
        if (!post.title) {
            errors.push(`Skipping post missing title`)
            continue
        }

        // Auto-generate slug
        const slug = slugify(post.title) + '-' + Math.random().toString(36).substring(2, 7)

        let contentJson = null
        if (post.content_markdown) {
            try {
                const html = await marked.parse(post.content_markdown)
                if (html) {
                    contentJson = generateJSON(html as string, [
                        Document,
                        Paragraph,
                        Text,
                        Heading,
                        Bold,
                        Italic,
                        ListItem,
                        BulletList,
                        OrderedList
                    ])
                }
            } catch (e) {
                console.error('Error parsing markdown:', e)
                // Fallback to basic paragraph if parsing fails
                contentJson = {
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: post.content_markdown }]
                        }
                    ]
                }
            }
        }

        validPosts.push({
            title: post.title,
            slug: slug,
            excerpt: post.excerpt || null,
            category: post.category || 'Uncategorized',
            content: contentJson,
            status: 'draft',
            author_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Map missing fields
            author_name: post.author_name || null,
            tags: post.tags || [],
            meta_description: post.meta_description || null
        })
    }

    if (validPosts.length === 0) {
        return { success: false, errors: ['No valid posts found', ...errors] }
    }

    // 2. Insert Batch
    // Supabase allows bulk insert
    const { error } = await supabase
        .from('posts')
        .insert(validPosts)

    if (error) {
        console.error('Batch insert failed:', error)
        return { success: false, errors: [error.message, ...errors] }
    }

    revalidatePath('/admin/desk')
    revalidatePath('/admin/posts')

    return { success: true, count: validPosts.length }
}
