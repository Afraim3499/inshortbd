'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface TiptapRendererProps {
    content: any
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
    // Move usage of hooks to top level (Rules of Hooks)
    // We cannot return early before useEditor.
    // Instead we handle null content by passing empty object or handling inside.
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:underline cursor-pointer',
                },
            }),
        ],
        content: content || {}, // Fallback to empty
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-p:font-serif prose-p:text-gray-700 focus:outline-none',
            },
        },
    })

    useEffect(() => {
        if (editor && content) {
            if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
                editor.commands.setContent(content)
            }
        }
    }, [content, editor])

    if (!content) return null

    return <EditorContent editor={editor} />
}
