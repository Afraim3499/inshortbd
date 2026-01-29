import { createClient } from '@/utils/supabase/server'
import { getSiteUrl } from '@/lib/env'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.INDEX_NOW_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const supabase = await createClient()
        const siteUrl = getSiteUrl()

        // 1. Fetch posts published in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: posts } = await supabase
            .from('posts')
            .select('slug')
            .eq('status', 'published')
            .gte('published_at', oneDayAgo)

        if (!posts || posts.length === 0) {
            return NextResponse.json({ success: true, message: 'No new posts to index' })
        }

        const urlsToIndex = posts.map((post: { slug: string }) => `${siteUrl}/news/${post.slug}`)

        // 2. Submit to IndexNow (Bing, Yandex, etc.)
        // https://www.bing.com/indexnow
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                host: 'inshortbd.com',
                key: '44ec99a4236d47e9869fcd852bf964ce',
                keyLocation: `https://inshortbd.com/44ec99a4236d47e9869fcd852bf964ce.txt`,
                urlList: urlsToIndex
            })
        })

        if (!response.ok) {
            console.error('IndexNow submission failed', await response.text())
            return NextResponse.json({ success: false, error: 'IndexNow submission failed' }, { status: 502 })
        }

        // 3. Ping Google's PubSubHubbub Hub (WebSub) to notify of feed update
        const webSubParams = new URLSearchParams()
        webSubParams.append('hub.mode', 'publish')
        webSubParams.append('hub.url', `${siteUrl}/feed.xml`)

        const webSubResponse = await fetch('https://pubsubhubbub.appspot.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: webSubParams,
        })

        if (!webSubResponse.ok) {
            console.error('WebSub ping failed', await webSubResponse.text())
        }

        return NextResponse.json({
            success: true,
            message: `Submitted ${urlsToIndex.length} URLs to IndexNow & Pinged WebSub Hub`,
            urls: urlsToIndex,
            webSubStatus: webSubResponse.status
        })
    } catch (error) {
        console.error('Cron error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
