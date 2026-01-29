import { useEffect } from 'react'
import { Editor } from '@tiptap/react'

export function useTypewriter(editor: Editor | null, enabled: boolean = false) {
    useEffect(() => {
        if (!editor || !enabled) return

        const updateScroll = () => {
            if (editor.isDestroyed) return

            const { from } = editor.state.selection
            const view = editor.view

            // Get position of the cursor
            // We use coordsAtPos to find where the cursor is in the viewport
            const coords = view.coordsAtPos(from)

            // Calculate the center of the viewport
            const viewportHeight = window.innerHeight
            const center = viewportHeight / 2

            // Calculate distance to scroll
            // coords.top is relative to viewport
            const offset = coords.top - center

            // We want to scroll the window
            // But we shouldn't scroll if we are just moving mouse or clicking?
            // Typewriter mode usually applies on typing.
            // But let's apply on selection change for now, but strictly SMOOTH.

            if (Math.abs(offset) > 50) { // Threshold to prevent jitter
                window.scrollBy({
                    top: offset,
                    behavior: 'smooth'
                })
            }
        }

        editor.on('selectionUpdate', updateScroll)

        return () => {
            editor.off('selectionUpdate', updateScroll)
        }
    }, [editor, enabled])
}
