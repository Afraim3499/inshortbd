'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { templates, type Template, getTemplateCategories } from '@/lib/templates'
import { Search, FileText, Zap, PenTool, Brain, MessageSquare, TrendingUp, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

const categoryIcons = {
  Standard: FileText,
  'Breaking News': Zap,
  Feature: PenTool,
  Analysis: Brain,
  Interview: MessageSquare,
  Finance: TrendingUp,
  List: List,
  Opinion: Brain,
}

export function TemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Template['category'] | 'All'>('All')

  const categories = ['All', ...getTemplateCategories()] as const

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSelect = (template: Template) => {
    onSelectTemplate(template)
    onClose()
    setSearchQuery('')
    setSelectedCategory('All')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Content Template</DialogTitle>
          <DialogDescription>
            Choose a template to pre-fill your article structure. You can customize it after loading.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => {
              const Icon = category === 'All' ? FileText : categoryIcons[category]
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category}
                </Button>
              )
            })}
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto">
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => {
                  const Icon = categoryIcons[template.category]
                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-accent hover:shadow-md',
                        'flex flex-col'
                      )}
                      onClick={() => handleSelect(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-accent" />
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {template.category}
                          </span>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(template)
                          }}
                        >
                          Use This Template
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No templates found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}






