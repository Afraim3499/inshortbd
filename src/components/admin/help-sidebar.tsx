'use client'

import { Search, BookOpen, Video, Keyboard, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface HelpSection {
  id: string
  title: string
  category: 'getting-started' | 'editing' | 'analytics' | 'settings'
  items: {
    title: string
    description: string
    link?: string
  }[]
}

const helpContent: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    category: 'getting-started',
    items: [
      {
        title: 'Welcome to Inshort',
        description: 'Learn the basics of the admin dashboard and how to navigate the platform.',
      },
      {
        title: 'Creating Your First Article',
        description: 'Step-by-step guide to writing and publishing your first news article.',
      },
      {
        title: 'Understanding Status Workflow',
        description: 'Learn about draft → review → approved → published workflow.',
      },
    ],
  },
  {
    id: 'editing',
    title: 'Editing & Content',
    category: 'editing',
    items: [
      {
        title: 'Using The Editor',
        description: 'Master the rich text editor with formatting, images, and more.',
      },
      {
        title: 'Media Library',
        description: 'Upload, organize, and manage images in your media library.',
      },
      {
        title: 'Content Templates',
        description: 'Use pre-built templates to speed up your content creation.',
      },
      {
        title: 'SEO Optimization',
        description: 'Optimize your articles for search engines with built-in SEO tools.',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    category: 'analytics',
    items: [
      {
        title: 'Understanding Analytics',
        description: 'Track views, engagement, and traffic sources for your articles.',
      },
      {
        title: 'Exporting Reports',
        description: 'Generate CSV or PDF reports of your analytics data.',
      },
      {
        title: 'Campaign Tracking',
        description: 'Track marketing campaigns with UTM parameters.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Management',
    category: 'settings',
    items: [
      {
        title: 'Traffic Control',
        description: 'Set the hero article and manage breaking news banners.',
      },
      {
        title: 'Newsletter Management',
        description: 'Manage subscribers and send email campaigns.',
      },
      {
        title: 'Social Media Tasks',
        description: 'Create and track social media posting tasks.',
      },
    ],
  },
]

interface HelpSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpSidebar({ open, onOpenChange }: HelpSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredContent = useMemo(() => {
    if (!searchQuery && !selectedCategory) return helpContent

    return helpContent
      .filter((section) => !selectedCategory || section.category === selectedCategory)
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            !searchQuery ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.items.length > 0)
  }, [searchQuery, selectedCategory])

  const categories = [
    { id: null, name: 'All' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'editing', name: 'Editing' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'settings', name: 'Settings' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] bg-zinc-900 border-zinc-800 text-zinc-50 flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Help & Documentation
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id || 'all'}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {filteredContent.length === 0 ? (
              <div className="text-center text-zinc-400 py-8">
                No help topics found. Try a different search term.
              </div>
            ) : (
              filteredContent.map((section) => (
                <div key={section.id}>
                  <h3 className="text-lg font-semibold mb-3 text-zinc-50">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                      >
                        <h4 className="font-medium text-zinc-50 mb-1">{item.title}</h4>
                        <p className="text-sm text-zinc-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="border-t border-zinc-800 pt-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="h-4 w-4 text-zinc-400" />
            <h4 className="text-sm font-medium text-zinc-50">Keyboard Shortcuts</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <div>
              <kbd className="px-2 py-1 bg-zinc-800 rounded">Ctrl+K</kbd>
              <span className="ml-2">Search</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-zinc-800 rounded">Esc</kbd>
              <span className="ml-2">Close dialogs</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}






