'use client'

import { useState, useEffect } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { Editor } from '@tiptap/react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface LinkSelectorProps {
    editor: Editor
    disabled?: boolean
}

export function LinkSelector({ editor, disabled }: LinkSelectorProps) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState('')

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen && editor) {
            const previousUrl = editor.getAttributes('link').href
            setUrl(previousUrl || '')
        }
    }

    const handleSave = () => {
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className={cn(
                        'h-8 w-8 p-0',
                        editor.isActive('link') && 'bg-accent/20 text-accent'
                    )}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Insert Link</DialogTitle>
                    <DialogDescription>
                        Enter the URL for the selected text.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSave()
                                }
                            }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
