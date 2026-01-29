'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { TaskCreator } from './task-creator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'

interface TaskCreatorDialogProps {
  postId: string
  postTitle: string
  postSlug: string
}

export function TaskCreatorDialog({ postId, postTitle, postSlug }: TaskCreatorDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Create Social Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Social Media Task</DialogTitle>
          <DialogDescription>
            Create a task for sharing this article on social media platforms
          </DialogDescription>
        </DialogHeader>
        <TaskCreator
          postId={postId}
          postTitle={postTitle}
          postSlug={postSlug}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}






