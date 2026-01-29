
import { NextResponse } from 'next/server'
import { JSDOM } from 'jsdom'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    try {
        // Add protocol if missing
        const targetUrl = url.startsWith('http') ? url : `https://${url}`

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Inshort-CMS-Bot/1.0',
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            throw new Error('Failed to fetch page')
        }

        const html = await response.text()
        const dom = new JSDOM(html)
        const doc = dom.window.document

        // Extract Metadata
        const title =
            doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
            doc.querySelector('title')?.textContent ||
            ''

        const description =
            doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
            doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
            ''

        const image =
            doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
            ''

        const siteName =
            doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
            new URL(targetUrl).hostname

        return NextResponse.json({
            success: 1, // Tiptap specific format
            link: targetUrl,
            meta: {
                title,
                description,
                image: {
                    url: image
                },
                siteName
            }
        })

    } catch (error) {
        console.error('Link Preview Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch link preview' },
            { status: 500 }
        )
    }
}
