import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import {
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    MessageSquareQuote,
    ImageIcon,
    Table,
    Youtube,
    Minus,
    CheckSquare,
    AlertCircle,
    Twitter,
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]
        if (item) {
            props.command(item)
        }
    }

    useEffect(() => {
        setTimeout(() => setSelectedIndex(0), 0)
    }, [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
                return true
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length)
                return true
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex)
                return true
            }
            return false
        },
    }))

    return (
        <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md transition-all">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        key={index}
                        className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none ${index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                        onClick={() => selectItem(index)}
                    >
                        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-muted bg-background">
                            {item.icon}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-medium leading-none mb-1">{item.title}</span>
                            <span className="text-xs text-muted-foreground leading-none">{item.description}</span>
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No results</div>
            )}
        </div>
    )
})

CommandList.displayName = 'CommandList'

const renderItems = () => {
    let component: ReactRenderer | null = null
    let popup: any | null = null

    return {
        onStart: (props: any) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            })

            if (!props.clientRect) {
                return
            }

            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
            })
        },

        onUpdate: (props: any) => {
            component?.updateProps(props)

            if (!props.clientRect) {
                return
            }

            popup[0].setProps({
                getReferenceClientRect: props.clientRect,
            })
        },

        onKeyDown: (props: any) => {
            if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
            }

            return (component?.ref as any)?.onKeyDown(props)
        },

        onExit: () => {
            popup[0].destroy()
            component?.destroy()
        },
    }
}

const Commands = Extension.create({
    name: 'slash-command',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range })
                },
            },
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ]
    },
})

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Text',
            description: 'Start writing with plain text.',
            searchTerms: ['p', 'paragraph'],
            icon: <span className="text-[10px]">T</span>,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run()
            },
        },
        {
            title: 'Heading 1',
            description: 'Big section heading.',
            searchTerms: ['title', 'big', 'large'],
            icon: <Heading1 className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
            },
        },
        {
            title: 'Heading 2',
            description: 'Medium section heading.',
            searchTerms: ['subtitle', 'medium'],
            icon: <Heading2 className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
            },
        },
        {
            title: 'Heading 3',
            description: 'Small section heading.',
            searchTerms: ['subtitle', 'small'],
            icon: <Heading3 className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
            },
        },
        {
            title: 'Bullet List',
            description: 'Create a simple bullet list.',
            searchTerms: ['unordered', 'point'],
            icon: <List className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
            },
        },
        {
            title: 'Numbered List',
            description: 'Create a list with numbering.',
            searchTerms: ['ordered'],
            icon: <ListOrdered className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
            },
        },
        {
            title: 'Quote',
            description: 'Capture a quote.',
            searchTerms: ['blockquote'],
            icon: <MessageSquareQuote className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
            },
        },
        {
            title: 'Horizontal Rule',
            description: 'A visual divider.',
            searchTerms: ['line', 'break', 'divider'],
            icon: <Minus className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run()
            },
        },
        {
            title: 'Image',
            description: 'Upload an image from your computer.',
            searchTerms: ['photo', 'picture', 'media'],
            icon: <ImageIcon className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run()
                // We will trigger the onImageClick handler passed to the editor
                // Since we can't easily access props here, we might need a custom event or a different approach
                // For now, let's just insert a placeholder or try to find the button
                const imageButton = document.querySelector('button[aria-label="Insert Image"]') as HTMLButtonElement | null;
                if (imageButton) {
                    imageButton.click();
                } else {
                    // Fallback: Trigger a custom event that TiptapEditor listens to?
                    // Or simpler: access a global or context if possible.
                    // Actually, the best way is to pass the handler via editor options if possible.
                    // But for now, let's simulate the click on the toolbar image button if available, 
                    // or we can just leave it as handled by the 'Image' command if we integrate MediaPicker directly here.

                    // Simulating click on the hidden file input or the toolbar button is the easiest integration without refactoring everything.
                    // Let's assume the toolbar image button has a distinct class or we find it.
                    // Better yet:
                    // We can define a custom extension command that calls the external handler.
                    editor.commands.setImageUploadPlaceholder()
                }
            },
        },
        {
            title: 'Table',
            description: 'Insert a table.',
            searchTerms: ['grid', 'spreadsheet'],
            icon: <Table className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            },
        },
        {
            title: 'YouTube',
            description: 'Embed a video.',
            searchTerms: ['video', 'embed'],
            icon: <Youtube className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                const url = prompt('Enter YouTube URL:')
                if (url) {
                    editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run()
                }
            },
        },
        {
            title: 'Callout / Alert',
            description: 'Add a colored information box.',
            searchTerms: ['alert', 'box', 'info', 'warning', 'tip'],
            icon: <AlertCircle className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).insertContent({ type: 'callout', attrs: { type: 'info' } }).run()
            },
        },
        {
            title: 'Tweet',
            description: 'Embed a tweet from X.',
            searchTerms: ['twitter', 'x', 'social'],
            icon: <Twitter className="h-3 w-3" />,
            command: ({ editor, range }: any) => {
                const url = prompt('Enter Tweet URL:')
                if (url) {
                    editor.chain().focus().deleteRange(range).setTweet({ src: url }).run()
                }
            },
        },
    ].filter((item) => {
        if (typeof query === 'string' && query.length > 0) {
            const search = query.toLowerCase()
            return (
                item.title.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search) ||
                (item.searchTerms && item.searchTerms.some((term: string) => term.includes(search)))
            )
        }
        return true
    })
}

export const SlashCommand = Commands.configure({
    suggestion: {
        items: getSuggestionItems,
        render: renderItems,
    },
})
