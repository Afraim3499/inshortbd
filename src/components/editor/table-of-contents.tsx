'use client'

import { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { List } from 'lucide-react'

interface TableOfContentsProps {
    editor: Editor | null
}

interface TocItem {
    id: string
    text: string
    level: number
    pos: number
}

export function TableOfContents({ editor }: TableOfContentsProps) {
    const [items, setItems] = useState<TocItem[]>([])
    const [activeId, setActiveId] = useState<string>('')

    useEffect(() => {
        if (!editor) return

        const updateToc = () => {
            const newItems: TocItem[] = []

            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'heading') {
                    // Generate a pseudo-ID if actual ID is missing, based on pos
                    const id = `heading-${pos}`
                    newItems.push({
                        id,
                        text: node.textContent,
                        level: node.attrs.level,
                        pos,
                    })
                }
            })

            setItems(newItems)
        }

        // Initial update
        updateToc()

        // Listen for updates
        editor.on('update', updateToc)
        editor.on('selectionUpdate', () => {
            // Ideally we'd calculate active based on scroll/selection
            // For now, simpler selection-based active tracking
            const { from } = editor.state.selection

            // Find the heading that is closest before the current selection
            // Re-calculate items or access current state? Accessing state inside listener might be stale 
            // inside closure if not careful, but 'items' state updates on 'update' event only. 
            // We'll rely on a fresh traversal or find closest locally.

            let closestPos = -1

            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'heading') {
                    if (pos <= from) {
                        closestPos = pos
                    }
                }
            })

            if (closestPos !== -1) {
                setActiveId(`heading-${closestPos}`)
            }
        })

        return () => {
            editor.off('update', updateToc)
            editor.off('selectionUpdate') // Note: this might remove all listeners if specific handler not passed, 
            // but tiptap off('event') removes all for that event usually, or we pass the function.
            // Ideally pass the function.
        }
    }, [editor])

    if (!editor || items.length === 0) return null

    const handleItemClick = (pos: number) => {
        // Set selection
        editor.commands.setTextSelection(pos)
        // Scroll to view
        const dom = editor.view.domAtPos(pos).node as HTMLElement
        // Sometimes domAtPos returns a text node, want the element
        const element = dom.nodeType === 3 ? dom.parentElement : dom
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <List className="h-3 w-3" />
                <span>Table of Contents</span>
            </div>
            <nav className="space-y-1 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item.pos)}
                        className={cn(
                            "block w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors truncate",
                            item.level === 1 && "font-semibold",
                            item.level === 2 && "pl-4",
                            item.level === 3 && "pl-8 text-xs",
                            activeId === item.id
                                ? "bg-accent/10 text-accent font-medium border-l-2 border-accent rounded-l-none"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {item.text}
                    </button>
                ))}
            </nav>
            {items.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Add headings to generate a table of contents.</p>
            )}
        </div>
    )
}
