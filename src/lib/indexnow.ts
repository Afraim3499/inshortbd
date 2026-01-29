export async function submitToIndexNow(urls: string[]) {
    const key = '48c742f25bad4614abac4edd413d4267'
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
