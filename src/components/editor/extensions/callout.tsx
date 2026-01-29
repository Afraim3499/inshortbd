import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes, Node } from '@tiptap/core'
import { AlertCircle, CheckCircle, Info, XCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle,
    error: XCircle,
    tip: Lightbulb,
}

const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    tip: 'bg-purple-50 border-purple-200 text-purple-900',
}

const CalloutComponent = ({ node, updateAttributes }: any) => {
    const type = (node.attrs.type || 'info') as keyof typeof icons
    const Icon = icons[type]

    return (
        <NodeViewWrapper className="my-4">
            <div className={cn("flex items-start gap-3 p-4 rounded-lg border", styles[type])}>
                <div className="mt-1 select-none">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <NodeViewContent className="[&>p]:m-0 [&>p]:leading-relaxed" />
                </div>
                <div className="select-none flex gap-1 bg-white/50 rounded p-0.5">
                    {Object.keys(icons).map((t) => (
                        <button
                            key={t}
                            onClick={() => updateAttributes({ type: t })}
                            className={cn("w-4 h-4 rounded-full border transition-colors",
                                t === type ? "border-black/20 scale-110 shadow-sm" : "border-transparent opacity-50 hover:opacity-100",
                                styles[t as keyof typeof styles]
                            )}
                            title={t}
                        />
                    ))}
                </div>
            </div>
        </NodeViewWrapper>
    )
}

export const Callout = Node.create({
    name: 'callout',
    group: 'block',
    content: 'paragraph+',

    addAttributes() {
        return {
            type: {
                default: 'info',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="callout"]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]
    },

    addNodeView() {
        return ReactNodeViewRenderer(CalloutComponent)
    },
})
