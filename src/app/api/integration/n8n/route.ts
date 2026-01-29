import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// Use Edge Runtime for speed if possible, but 'marked' might need Node.
// Let's stick to Node.js runtime for compatibility with parsing libraries if needed.
// Actually, 'marked' works in Edge. But 'tiptap' might depend on DOM-like structures.
export const dynamic = 'force-dynamic'

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') + '-' + Math.random().toString(36).substring(2, 7)
}

export async function POST(req: NextRequest) {
    // 1. Security Check
    const apiKey = req.headers.get('x-api-key')
    const secret = process.env.N8N_WEBHOOK_SECRET

    if (!secret) {
        return NextResponse.json({ error: 'Server misconfiguration: N8N_WEBHOOK_SECRET not set' }, { status: 500 })
    }

    if (apiKey !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Body Parsing
    let body
    try {
        body = await req.json()
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { posts } = body

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
        return NextResponse.json({ error: 'No posts provided in "posts" array' }, { status: 400 })
    }

    // 3. Supabase Admin Client (Service Role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Server misconfiguration: Supabase Service Role Key missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // 4. Import & Process Content
    // Dynamic imports for performance
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

    for (const post of posts) {
        if (!post.title) {
            errors.push('Skipping post missing title')
            continue
        }

        const slug = slugify(post.title)
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

        // We use a specific ADMIN user ID if available, otherwise we might leave author_id null
        // or look for the first admin user.
        // For now, let's look for a user with email 'admin@inshortbd.com' or similar, 
        // OR just pass a specific ID in the body if desired.
        // Better: Search for the first 'admin' role user.

        // This query might be slow if many users, but usually few admins.
        const author_id = null
        // Optimisation: We could cache this or pass it in env, but let's just query once per batch.
        // Actually, let's check input body for author_id, else default to null (System User)

        validPosts.push({
            title: post.title,
            slug: slug,
            excerpt: post.excerpt || null,
            category: post.category || 'Uncategorized',
            content: contentJson,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: post.tags || []
            // author_id intentionally left null or managed by DB default if not provided
        })
    }

    // 5. Insert
    if (validPosts.length > 0) {
        const { error } = await supabase.from('posts').insert(validPosts)
        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
    }

    revalidatePath('/admin/desk')
    revalidatePath('/admin/posts')

    return NextResponse.json({
        success: true,
        count: validPosts.length,
        errors: errors.length > 0 ? errors : undefined
    })
}
