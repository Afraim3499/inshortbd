'use client'

import { Editor } from '@tiptap/react'
import { Bold, Italic, Heading1, Heading2, Quote, Link, List, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LinkSelector } from './link-selector'
import { SmartImporter, type SmartImportData } from './smart-importer'
import { ColorSelector } from './color-selector'

interface ToolbarProps {
  editor: Editor | null
  onImageClick?: () => void
  isLocked?: boolean
  onSmartImport?: (data: SmartImportData) => void
}

export function Toolbar({ editor, onImageClick, isLocked, onSmartImport }: ToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-border p-2 flex items-center gap-1 flex-wrap bg-card/50">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          'h-8 w-8 p-0',
          editor.isActive('bold') && 'bg-accent/20 text-accent'
        )}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          'h-8 w-8 p-0',
          editor.isActive('italic') && 'bg-accent/20 text-accent'
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'h-8 w-8 p-0',
          editor.isActive('heading', { level: 1 }) && 'bg-accent/20 text-accent'
        )}
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'h-8 w-8 p-0',
          editor.isActive('heading', { level: 2 }) && 'bg-accent/20 text-accent'
        )}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'h-8 w-8 p-0',
          editor.isActive('bulletList') && 'bg-accent/20 text-accent'
        )}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          'h-8 w-8 p-0',
          editor.isActive('blockquote') && 'bg-accent/20 text-accent'
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <ColorSelector editor={editor} disabled={isLocked} />

      <LinkSelector editor={editor} disabled={isLocked} />

      <div className="w-px h-6 bg-border mx-1" />

      <SmartImporter editor={editor} disabled={isLocked} onSmartImport={onSmartImport} />

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onImageClick}
        className="h-8 w-8 p-0"
        disabled={isLocked}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

