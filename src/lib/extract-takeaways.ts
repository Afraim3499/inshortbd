export function extractTakeawaysFromContent(content: string | object | null | undefined, limit = 3): string[] {
    if (!content) return []

    try {
        // 1. Handle Tiptap JSON
        if (typeof content === 'object' && content !== null) {
            const jsonContent = content as any
            // Look for the first bulletList in the document (traversal)
            // Simple traversal logic: Check top level, then children
            const bulletList = jsonContent.content?.find((node: any) => node.type === 'bulletList')

            // If not at top level, maybe deep? For performance we only check top level for typical "Above Fold" usage

            if (bulletList && bulletList.content) {
                return bulletList.content
                    .slice(0, limit)
                    .map((listItem: any) => {
                        const paragraph = listItem.content?.[0]
                        if (paragraph && paragraph.content) {
                            return paragraph.content.map((textNode: any) => textNode.text || '').join('')
                        }
                        return ''
                    })
                    .filter((text: string) => text.trim().length > 10)
            }
            return []
        }

        // 2. Handle HTML String (Legacy/Imported)
        if (typeof content === 'string') {
            const htmlContent = content
            // Basic regex extraction matches first <ul> block
            const ulMatch = htmlContent.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i)

            if (ulMatch && ulMatch[1]) {
                const listItems = ulMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi)

                if (listItems && listItems.length > 0) {
                    return listItems
                        .slice(0, limit)
                        .map(item => {
                            // Strip HTML tags
                            return item.replace(/<[^>]*>/g, '').trim()
                        })
                        .filter(text => text.length > 10)
                }
            }
        }

        return []
    } catch (error) {
        console.warn('Error extracting takeaways:', error)
        return []
    }
}
