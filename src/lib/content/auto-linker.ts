/**
 * Auto-Linker Utility
 * Automatically links keywords in content to their corresponding tag/category pages.
 * Constraint: Links first occurrence only, avoids existing links.
 */

interface LinkTarget {
    keyword: string
    url: string
}

export function autoLinkContent(htmlContent: string, targets: LinkTarget[]): string {
    if (!htmlContent || targets.length === 0) return htmlContent

    let processedHtml = htmlContent

    // Sort targets by length (descending) to match longest phrases first (e.g. "World War" before "World")
    const sortedTargets = [...targets].sort((a, b) => b.keyword.length - a.keyword.length)

    sortedTargets.forEach(({ keyword, url }) => {
        // Regex explanation:
        // (?<!href=["'][^"']*) -> Negative lookbehind: ensure we are not inside an href attribute
        // (?![^<]*<\/a>)       -> Negative lookahead: ensure we are not inside an existing <a> tag
        // \b(${escapeRegExp(keyword)})\b -> Match the keyword as a whole word
        // 'i' flag for case-insensitive

        // Note: Parsing HTML with Regex is fragile. 
        // A safer but heavier approach is DOM parsing. For 2026 "Spiderweb" speed, we use a robust regex for basic text.
        // We only want to replace the FIRST occurrence in the text body.

        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // This regex attempts to find the keyword outside of tags.
        // However, JS regex lookbehind support varies. 
        // A simpler approach for the "first occurrence" safety:
        // 1. We match text nodes.
        // 2. We replace only the first match that isn't already linked.

        // Simplified Logic: 
        // We will trust the editor content is simple HTML.
        // We use a regex that matches the word, ensuring it's not followed closely by </a> without an opening <a>.

        // Actually, since we are using TipTap (HTML), valid text is between > and <.
        // Let's rely on a simpler 'replace first' strategy that tries to respect HTML tags.

        const regex = new RegExp(`(>)([^<]*?)(\\b${escapedKeyword}\\b)([^<]*?)(<)`, 'i');

        // We need to loop this regex to find a valid match that isn't inside a link?
        // Actually, handling this perfectly safely in pure Regex is hard. 
        // Given the constraints and urgency, we will use a DOM-aware replacement if possible, 
        // but since this is server/client hybrid, let's use a robust string replacement on text nodes.

        // Strategy: Split by HTML tags, process text parts.
        // This effectively ignores tags.

        // But we need to replace ONLY the first occurrence globally? Or first per keyword? "Wrap the first occurrence only".

        // Let's try a specific replace that targets text not inside <a>.
        // Since we can't easily track "inside <a>" with simple regex split, 
        // we will assume the content provided is coming from TipTap and is well-formed.

        // For now, let's skip complex "inside <a>" detection for the MVP and generic replacement, 
        // BUT checking for <a ...> ... </a> proximity.

        // Refined Plan: 
        // We construct a regex that ignores matches if they are inside <a> tags.
        // (?!<a[^>]*?>) checks ahead? No.

        // Alternate 2026 Strategy:
        // Use a placeholder protection.
        // 1. Mask all <a>...</a> blocks.
        // 2. Perform replacement on remaining text.
        // 3. Unmask.

        const linkMatches: string[] = []
        const protectedHtml = processedHtml.replace(/<a\b[^>]*>.*?<\/a>/gi, (match) => {
            linkMatches.push(match)
            return `<!--LINK_PROTECT_${linkMatches.length - 1}-->`
        })

        // Now safe to replace first occurrence in text
        // We match the keyword ensuring it has word boundaries
        const searchRegex = new RegExp(`\\b(${escapedKeyword})\\b`, 'i')

        if (searchRegex.test(protectedHtml)) {
            // Replace only the first occurrence
            const linkedHtml = protectedHtml.replace(searchRegex, `<a href="${url}" class="text-accent underline hover:text-accent/80">$1</a>`)

            // Restore links
            processedHtml = linkedHtml.replace(/<!--LINK_PROTECT_(\d+)-->/g, (_, index) => linkMatches[parseInt(index)])
        } else {
            // Restore original if no match
            processedHtml = processedHtml.replace(/<!--LINK_PROTECT_(\d+)-->/g, (_, index) => linkMatches[parseInt(index)])
        }
    })

    return processedHtml
}
