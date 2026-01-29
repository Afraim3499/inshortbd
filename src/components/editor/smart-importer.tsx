'use client'

import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'
import { Editor } from '@tiptap/react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export interface SmartImportData {
    title?: string
    slug?: string
    excerpt?: string
    category?: string
    tags?: string[]
    meta_description?: string
    author_name?: string
    content_markdown: string
}

interface SmartImporterProps {
    editor: Editor
    disabled?: boolean
    onSmartImport?: (data: SmartImportData) => void
}

export function SmartImporter({ editor, disabled, onSmartImport }: SmartImporterProps) {
    const [open, setOpen] = useState(false)
    const [inputContent, setInputContent] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Helper to parse "Title: Value" format with support for inline keys
    const parseStructuredText = (text: string): Partial<SmartImportData> | null => {
        let processedText = text

        // 1. Pre-process: Ensure known keys are on their own lines (handle inline keys like "Title: ... Slug: ...")
        const validKeys = ['Title', 'Slug', 'Category', 'Excerpt', 'Author', 'Tags', 'Meta Tags', 'Meta Description', 'Article Content', 'Schedule Publication']
        validKeys.forEach(key => {
            // Replace " Key:" with "\nKey:" (ignoring case)
            // Use lookbehind-ish strategy: match start of line or whitespace before the key
            const regex = new RegExp(`(^|\\s+)(${key}:)`, 'gi')
            processedText = processedText.replace(regex, '\n$2')
        })

        const lines = processedText.split('\n')
        const data: any = {}

        // Mappings for user keys to internal keys (English + Bangla)
        const keyMap: Record<string, string> = {
            // English keys
            'title': 'title',
            'slug': 'slug',
            'category': 'category',
            'excerpt': 'excerpt',
            'tags': 'tags',
            'author': 'author_name',
            'author name': 'author_name',
            'meta_description': 'meta_description',
            'meta description': 'meta_description',
            'article content': 'content_markdown',
            'article_content': 'content_markdown',
            'content': 'content_markdown',
            // Bangla keys
            'শিরোনাম': 'title',
            'স্লাগ': 'slug',
            'লিংক': 'slug',
            'ক্যাটাগরি': 'category',
            'বিভাগ': 'category',
            'বিবরণ': 'excerpt',
            'সারাংশ': 'excerpt',
            'লেখক': 'author_name',
            'ট্যাগ': 'tags',
            'ট্যাগস': 'tags',
            'বিষয়বস্তু': 'content_markdown',
            'মেটা বিবরণ': 'meta_description',
        }

        let hasStructuredData = false
        const contentBuffer: string[] = []
        let isReadingContent = false

        for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine && !isReadingContent) continue

            if (isReadingContent) {
                contentBuffer.push(line)
                continue
            }

            // Check if this line STARTS strictly with "Article Content:"
            if (trimmedLine.match(/^Article Content:/i)) {
                isReadingContent = true
                hasStructuredData = true
                const contentPart = trimmedLine.replace(/^Article Content:\s*/i, '')
                if (contentPart) contentBuffer.push(contentPart)
                continue
            }

            // Check for Key: Value pattern (Unicode-aware for Bangla)
            const match = line.match(/^([\p{L}\s_]+):\s*(.+)$/u)
            if (match) {
                const rawKey = match[1].trim().toLowerCase()
                const value = match[2].trim()

                const mappedKey = keyMap[rawKey]
                if (mappedKey) {
                    hasStructuredData = true
                    if (mappedKey === 'tags') {
                        data[mappedKey] = value.split(',').map((t: string) => t.trim()).filter(Boolean)
                    } else if (mappedKey !== 'content_markdown') {
                        data[mappedKey] = value
                    }
                    continue
                }
            }
        }

        if (hasStructuredData) {
            data.content_markdown = contentBuffer.join('\n').trim()
            return data
        }
        return null
    }

    // Spiderweb: Auto-Linker Integration
    // Modified to run on the markdown string before parsing
    const processContentWithLinks = (markdown: string, tags: string[], category?: string) => {
        // Create link targets
        const targets = tags.map(tag => ({
            keyword: tag,
            // Use markdown link format since we are processing markdown
            url: `/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`
        }))

        if (category) {
            targets.push({
                keyword: category,
                url: `/category/${category.toLowerCase().replace(/\s+/g, '-')}`
            })
        }

        // Simple Markdown Replace (First occurrence only functionality)
        // We use a simplified version of the utility's logic but adapted for Markdown string
        let processed = markdown

        targets.forEach(({ keyword, url }) => {
            // Regex to find word not inside [] or () (link boundaries)
            // This is basic and assumes standard markdown.

            const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Look for keyword not preceded by [
            const regex = new RegExp(`(?<!\\[)${escaped}(?![\\]\\(])`, 'i');

            // We only replace the first one
            processed = processed.replace(regex, `[${keyword}](${url})`)
        })

        return processed
    }

    // Helper functions defined above

    const handleImport = async () => {
        if (!inputContent.trim()) return

        try {
            setIsLoading(true)
            const { marked } = await import('marked')

            // 1. Try to parse as JSON first (Smart Import)
            try {
                // Strip code blocks if present (e.g. user pasted a markdown code block)
                let jsonContent = inputContent.trim()
                // 1. Robust JSON Extraction
                // Find the first '{' and the last '}' to ignore trailing markdown/garbage
                const firstBrace = jsonContent.indexOf('{')
                const lastBrace = jsonContent.lastIndexOf('}')

                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonContent = jsonContent.substring(firstBrace, lastBrace + 1)
                } else {
                    // Try to match code block if direct brace search failed (fallback)
                    const codeBlockMatch = jsonContent.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
                    if (codeBlockMatch) {
                        jsonContent = codeBlockMatch[1]
                    }
                }

                // NEW: Sanitize JSON strings (escape literal newlines)
                // This handles the user's case where "content_markdown": "line1\nline2" is pasted as literal newlines
                let sanitized = ''
                let inString = false
                let isEscaped = false

                for (let i = 0; i < jsonContent.length; i++) {
                    const char = jsonContent[i]

                    if (inString) {
                        if (char === '\n') {
                            sanitized += '\\n'
                        } else if (char === '\r') {
                            // Ignore carriage returns
                        } else {
                            sanitized += char
                        }
                    } else {
                        sanitized += char
                    }

                    // Toggle string state
                    if (char === '"' && !isEscaped) {
                        inString = !inString
                    }

                    // Handle escape sequence
                    if (char === '\\' && !isEscaped) {
                        isEscaped = true
                    } else {
                        isEscaped = false
                    }
                }
                jsonContent = sanitized

                // Attempt to repair common JSON errors (like missing values in the user's screenshot: "tags": ,)
                // 1. Replace empty values between colon and comma with null
                jsonContent = jsonContent.replace(/:\s*,/g, ': null,')
                // 2. Replace empty values between colon and closing brace with null
                jsonContent = jsonContent.replace(/:\s*}/g, ': null}')

                // 3. Robust JSON Parsing (Loose mode)
                let jsonData: any = null

                try {
                    jsonData = JSON.parse(jsonContent)
                } catch (e) {
                    // Fallback: Use Function constructor for loose JS object parsing
                    try {
                        // 1. Strip known non-JS artifacts first
                        const fixed = jsonContent
                            .replace(/\[cite_start\]/gi, '')
                            .replace(/([,{]\s*)\[.*?\](\s*")/g, '$1$2')

                        // 2. Use Function constructor to parse loose JSON (single quotes, unquoted keys, etc.)
                        // This acts as a standard JS parser.
                        const looseParse = new Function('return ' + fixed)
                        jsonData = looseParse()
                    } catch (finalError) {
                        // Only warn if it looks like JSON
                        if (jsonContent.trim().startsWith('{') || jsonContent.trim().startsWith('[')) {
                            console.warn('Loose parsing failed:', finalError)
                        }
                        throw e
                    }
                }

                // Check if it looks like our schema (check for ANY valid key)
                const validKeys = ['title', 'slug', 'excerpt', 'category', 'author', 'author_name', 'tags', 'meta_description', 'content_markdown']
                const hasValidKey = validKeys.some(key => key in jsonData)

                if (hasValidKey) {
                    // It's a Smart Import!
                    if (onSmartImport) {
                        onSmartImport(jsonData)
                        // Also set editor content if present
                        if (jsonData.content_markdown) {
                            // Apply Spiderweb Auto-Linking
                            const linkedMarkdown = processContentWithLinks(
                                jsonData.content_markdown,
                                jsonData.tags || [],
                                jsonData.category
                            )
                            const html = await marked.parse(linkedMarkdown)
                            editor.commands.setContent(html, true)
                        }
                        setOpen(false)
                        setInputContent('')
                        return
                    }
                }
            } catch (e) {
                // If the content *looks* like JSON (starts with {), but failed to parse, warn the user!
                const trimmed = inputContent.trim()
                if (trimmed.startsWith('{') || trimmed.startsWith('```json')) {
                    console.error('JSON Parse Error:', e)
                    alert('Invalid JSON format. Please check for syntax errors.')
                    setIsLoading(false)
                    return
                }
                // Not JSON, continue to Structured Text fallback
            }

            // 2. Try Structured Text (Key: Value)
            const structuredData = parseStructuredText(inputContent)
            if (structuredData) {
                if (onSmartImport) {
                    onSmartImport(structuredData as SmartImportData)
                    if (structuredData.content_markdown) {
                        const linkedMarkdown = processContentWithLinks(
                            structuredData.content_markdown,
                            structuredData.tags || [],
                            structuredData.category
                        )
                        const html = await marked.parse(linkedMarkdown)
                        editor.commands.setContent(html, true)
                    }
                    setOpen(false)
                    setInputContent('')
                    return
                }
            }

            // 3. Fallback: Treat as raw Markdown
            // (Assuming no tags/category available in raw mode, or simplistic check?)
            // We can't link without tags.
            const html = await marked.parse(inputContent)
            editor.commands.setContent(html, true)
            setOpen(false)
            setInputContent('')

        } catch (error) {
            console.error('Failed to import:', error)
            alert('Failed to import content. Please checks logs.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="h-8 w-auto px-2 text-xs gap-2 border-dashed border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-500"
                >
                    <Sparkles className="h-4 w-4" />
                    Smart Import
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Smart Import
                    </DialogTitle>
                    <DialogDescription>
                        Paste <strong>JSON</strong> or simple <strong>&quot;Key: Value&quot;</strong> text to auto-fill fields.
                        <br />
                        <span className="text-xs text-muted-foreground mt-1 block">
                            Supported keys: Title, Slug, Category, Excerpt, Author, Tags.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="markdown">Paste Content</Label>
                        <Textarea
                            id="markdown"
                            value={inputContent}
                            onChange={(e) => setInputContent(e.target.value)}
                            placeholder={'Title: My Article\nCategory: News\nTags: tech, ai\n\nContent goes here...'}
                            className="min-h-[400px] font-mono text-xs leading-normal"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!inputContent.trim() || isLoading}>
                        {isLoading ? 'Processing...' : 'Auto-Import'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
