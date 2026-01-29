'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HelpSidebar } from '@/components/admin/help-sidebar'
import { cn } from '@/lib/utils'

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg',
          'bg-zinc-900 border-zinc-800 hover:bg-zinc-800',
          'text-zinc-50 hover:text-zinc-50'
        )}
        aria-label="Open help"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      <HelpSidebar open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}






