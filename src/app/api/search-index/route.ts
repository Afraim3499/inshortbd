import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    const supabase = await createClient()

    // Fetch all published posts with minimal fields for search index
    // Limit to 1000 or paginate if needed, for "Zero Latency" usually < 5MB JSON is fine.
    const { data: posts, error } = await (supabase
        .from('posts') as any)
        .select('id, title, slug, excerpt, category, published_at, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1000)

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch search index' }, { status: 500 })
    }

    return NextResponse.json(posts)
}
