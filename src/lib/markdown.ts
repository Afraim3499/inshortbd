import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'

export async function processHtmlContent(html: string) {
    const file = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeSlug)
        .use(rehypeStringify)
        .process(html)

    return String(file)
}
