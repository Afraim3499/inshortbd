import { BubbleMenu, type Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Link,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface EditorBubbleMenuProps {
    editor: Editor
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
    const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false)

    if (!editor) {
        return null
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: 'top' }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md z-50"
        >
            <div className="flex p-1">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground',
                        editor.isActive('bold') && 'bg-accent text-accent-foreground'
                    )}
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground',
                        editor.isActive('italic') && 'bg-accent text-accent-foreground'
                    )}
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground',
                        editor.isActive('strike') && 'bg-accent text-accent-foreground'
                    )}
                >
                    <Strikethrough className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground',
                        editor.isActive('code') && 'bg-accent text-accent-foreground'
                    )}
                >
                    <Code className="h-4 w-4" />
                </button>
                <div className="mx-1 w-px bg-border" />
                <button
                    onClick={setLink}
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground',
                        editor.isActive('link') && 'bg-accent text-accent-foreground'
                    )}
                >
                    <Link className="h-4 w-4" />
                </button>
            </div>
        </BubbleMenu>
    )
}
