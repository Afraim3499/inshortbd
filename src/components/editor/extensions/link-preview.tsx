
import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'

export interface LinkPreviewOptions {
    HTMLAttributes: Record<string, any>
}

export const LinkPreview = Node.create<LinkPreviewOptions>({
    name: 'linkPreview',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            url: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="link-preview"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'link-preview' })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(LinkPreviewComponent)
    },

    addCommands() {
        return {
            setLinkPreview:
                (options: { url: string }) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        })
                    },
        }
    },

    addInputRules() {
        return [
            // Match a URL on a new line to auto-convert
            nodeInputRule({
                find: /^\$link\s(https?:\/\/[^\s]+)$/i, // Trigger with "$link <url>" for now to avoid conflicts
                type: this.type,
                getAttributes: (match) => {
                    return { url: match[1] }
                },
            })
        ]
    }
})

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        linkPreview: {
            setLinkPreview: (options: { url: string }) => ReturnType
        }
    }
}

function LinkPreviewComponent(props: any) {
    const url = props.node.attrs.url
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (!url) return
            try {
                setLoading(true)
                const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const json = await res.json()
                setData(json.meta)
            } catch (err) {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [url])

    return (
        <NodeViewWrapper className="my-4 not-prose">
            <div className="border border-border rounded-lg overflow-hidden bg-card transition-all hover:bg-muted/30 max-w-2xl">
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex no-underline text-foreground">
                    {loading ? (
                        <div className="p-4 flex items-center gap-3 w-full">
                            <div className="h-12 w-12 bg-muted animate-pulse rounded-md" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                                <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                            </div>
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="p-4 flex items-center gap-3 w-full">
                            <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
                                <ExternalLink className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium break-all">{url}</p>
                                <p className="text-xs text-muted-foreground">Preview unavailable</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {data.image?.url && (
                                <div className="w-32 sm:w-48 shrink-0 relative hidden sm:block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={data.image.url}
                                        alt=""
                                        className="h-full w-full object-cover absolute inset-0"
                                    />
                                </div>
                            )}
                            <div className="p-4 flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="font-semibold text-sm sm:text-base truncate mb-1" title={data.title}>{data.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{data.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {data.image?.url && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={`https://www.google.com/s2/favicons?domain=${url}`} alt="" className="h-3 w-3" />
                                    )}
                                    <span>{data.siteName || new URL(url).hostname}</span>
                                </div>
                            </div>
                        </>
                    )}
                </a>
            </div>
        </NodeViewWrapper>
    )
}
