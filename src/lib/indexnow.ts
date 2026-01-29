export async function submitToIndexNow(urls: string[]) {
    const key = '3f2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c'
    const host = 'inshortbd.com'

    if (process.env.NODE_ENV !== 'production') return

    try {
        await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                host,
                key,
                keyLocation: `https://${host}/${key}.txt`,
                urlList: urls,
            }),
        })
    } catch (err) {
        console.error('IndexNow submission failed', err)
    }
}
