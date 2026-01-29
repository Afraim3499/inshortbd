'use client'

interface CitationProps {
    source: string
    url: string
    children: React.ReactNode
}

export function Citation({ source, url, children }: CitationProps) {
    return (
        <blockquote
            className="border-l-4 border-primary pl-6 my-6 italic text-lg text-foreground/90"
            cite={url}
        >
            <p>{children}</p>
            <footer className="mt-2 text-sm text-muted-foreground not-italic">
                — <cite><a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{source}</a></cite>
            </footer>
        </blockquote>
    )
}
