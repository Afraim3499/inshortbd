
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = searchParams.get('page') || '1'
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

    if (!UNSPLASH_ACCESS_KEY) {
        return NextResponse.json(
            { error: 'Unsplash API key not configured' },
            { status: 500 }
        )
    }

    if (!query) {
        return NextResponse.json({ results: [] })
    }

    try {
        const res = await fetch(
            `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(
                query
            )}&per_page=24&orientation=landscape`,
            {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
            }
        )

        if (!res.ok) {
            if (res.status === 403 || res.status === 401) {
                return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 })
            }
            return NextResponse.json(
                { error: 'Failed to fetch from Unsplash' },
                { status: res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Unsplash Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
