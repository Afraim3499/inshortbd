'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Youtube from '@tiptap/extension-youtube'
import { Toolbar } from './toolbar'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { SmartImportData } from './smart-importer'
import { SlashCommand } from './slash-command'
import { EditorBubbleMenu } from './bubble-menu'
import { Extension } from '@tiptap/core'
import { Callout } from './extensions/callout'
import { Tweet } from './extensions/tweet'
import { LinkPreview } from './extensions/link-preview'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

interface TiptapEditorProps {
  content: any
  onChange: (content: any, html?: string) => void
  className?: string
  onEditorReady?: (editor: Editor) => void
  onImageClick?: () => void
  isLocked?: boolean
  onSmartImport?: (data: SmartImportData) => void
  onFileUpload?: (file: File) => Promise<string>
}

// Custom extension to trigger image upload placeholder logic
const ImagePlaceholder = Extension.create({
  name: 'imagePlaceholder',
  addCommands() {
    return {
      setImageUploadPlaceholder: () => () => {
        // Dispatch a custom event that the parent can listen to or find button
        // For now, we will assume the onImageClick prop is passed to the context or triggered via DOM.
        // This is a bit hacky but avoids deep refactoring for now.
        const event = new CustomEvent('trigger-image-upload')
        window.dispatchEvent(event)
        return true
      },
    }
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imagePlaceholder: {
      setImageUploadPlaceholder: () => ReturnType
    }
  }
}

export function TiptapEditor({ content, onChange, className, onEditorReady, onImageClick, isLocked, onSmartImport, onFileUpload }: TiptapEditorProps) {
  useEffect(() => {
    // Listen for custom upload trigger from Slash Command
    const handleUploadTrigger = () => {
      if (onImageClick) onImageClick();
    }
    window.addEventListener('trigger-image-upload', handleUploadTrigger)
    return () => window.removeEventListener('trigger-image-upload', handleUploadTrigger)
  }, [onImageClick])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false, // DISABLED: Forces Supabase upload instead of DB bloat
        HTMLAttributes: {
          class: 'rounded-lg border border-border shadow-sm max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing or type "/" for commands...',
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-border my-4 overflow-hidden rounded-md',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-muted/50 border border-border p-2 text-left font-bold',
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        }
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg overflow-hidden border border-border my-4',
        }
      }),
      LinkPreview,
      SlashCommand,
      ImagePlaceholder,
      Callout,
      Tweet,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML())
    },
    editable: !isLocked,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-zinc max-w-none focus:outline-none min-h-[400px] p-4',
          className
        ),
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            // Trigger image upload logic
            event.preventDefault()
            const customEvent = new CustomEvent('trigger-image-upload-file', { detail: file })
            window.dispatchEvent(customEvent)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        // Intercept image pastes to force Supabase upload instead of Base64 embedding
        const items = event.clipboardData?.items
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) {
                // Trigger upload via custom event (same as drop handler)
                const customEvent = new CustomEvent('trigger-image-upload-file', { detail: file })
                window.dispatchEvent(customEvent)
              }
              return true
            }
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getJSON()
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden relative group">
      <Toolbar editor={editor} onImageClick={onImageClick} isLocked={isLocked} onSmartImport={onSmartImport} />
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
