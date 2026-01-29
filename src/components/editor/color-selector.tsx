'use client'

import { Editor } from '@tiptap/react'
import { Palette, Check } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface ColorSelectorProps {
    editor: Editor
    disabled?: boolean
}

// Predefined color palette
const COLORS = [
    { name: 'Default', color: 'inherit', class: 'bg-black dark:bg-white border' },
    { name: 'Gray', color: '#6b7280', class: 'bg-gray-500' },
    { name: 'Red', color: '#ef4444', class: 'bg-red-500' },
    { name: 'Orange', color: '#f97316', class: 'bg-orange-500' },
    { name: 'Amber', color: '#f59e0b', class: 'bg-amber-500' },
    { name: 'Yellow', color: '#eab308', class: 'bg-yellow-500' },
    { name: 'Green', color: '#22c55e', class: 'bg-green-500' },
    { name: 'Teal', color: '#14b8a6', class: 'bg-teal-500' },
    { name: 'Blue', color: '#3b82f6', class: 'bg-blue-500' },
    { name: 'Indigo', color: '#6366f1', class: 'bg-indigo-500' },
    { name: 'Purple', color: '#a855f7', class: 'bg-purple-500' },
    { name: 'Pink', color: '#ec4899', class: 'bg-pink-500' },
]

export function ColorSelector({ editor, disabled }: ColorSelectorProps) {
    const activeColor = editor.getAttributes('textStyle').color || 'inherit'

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                >
                    <Palette className="h-4 w-4" style={{ color: activeColor !== 'inherit' ? activeColor : undefined }} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2">
                <div className="grid grid-cols-4 gap-1">
                    {COLORS.map(({ name, color, class: colorClass }) => (
                        <DropdownMenuItem
                            key={name}
                            asChild
                            className="p-1 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                            onClick={() => {
                                if (color === 'inherit') {
                                    editor.chain().focus().unsetColor().run()
                                } else {
                                    editor.chain().focus().setColor(color).run()
                                }
                            }}
                        >
                            <div className="flex items-center justify-center h-8 w-8 rounded-md hover:ring-2 ring-offset-1 ring-offset-background transition-all" title={name}>
                                <div className={`h-6 w-6 rounded-full ${colorClass} flex items-center justify-center`}>
                                    {activeColor === color && (
                                        <Check className="h-3 w-3 text-white drop-shadow-md" />
                                    )}
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
