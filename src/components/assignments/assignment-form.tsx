'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateTimePicker } from '@/components/date-time-picker'
import { createAssignment } from '@/app/actions/assignments/create'
import { updateAssignment } from '@/app/actions/assignments/update'
import { Loader2 } from 'lucide-react'
import type { Assignment } from '@/app/actions/assignments/get'

interface AssignmentFormProps {
  postId: string
  assignment?: Assignment | null
  assignedToOptions: Array<{ id: string; name: string }>
  onSuccess: () => void
  onCancel?: () => void
}

export function AssignmentForm({
  postId,
  assignment,
  assignedToOptions,
  onSuccess,
  onCancel,
}: AssignmentFormProps) {
  const [assignedTo, setAssignedTo] = useState(assignment?.assigned_to || '')
  const [deadline, setDeadline] = useState<Date | null>(
    assignment?.deadline ? new Date(assignment.deadline) : null
  )
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    assignment?.priority || 'medium'
  )
  const [notes, setNotes] = useState(assignment?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!assignedTo) {
      setError('Please select an assignee')
      return
    }

    if (!deadline) {
      setError('Please set a deadline')
      return
    }

    setIsSubmitting(true)

    try {
      if (assignment) {
        const result = await updateAssignment(assignment.id, {
          deadline,
          priority,
          notes: notes || undefined,
        })

        if (result.success) {
          onSuccess()
        } else {
          setError(result.error || 'Failed to update assignment')
        }
      } else {
        const result = await createAssignment({
          post_id: postId,
          assigned_to: assignedTo,
          deadline,
          priority,
          notes: notes || undefined,
        })

        if (result.success) {
          onSuccess()
        } else {
          setError(result.error || 'Failed to create assignment')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assigned-to">বরাদ্দ করুন *</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger
            id="assigned-to"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          >
            <SelectValue placeholder="ব্যক্তি নির্বাচন করুন..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {assignedToOptions.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>ডেডলাইন *</Label>
        <DateTimePicker
          value={deadline}
          onChange={setDeadline}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">অগ্রাধিকার</Label>
        <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
          <SelectTrigger
            id="priority"
            className="bg-zinc-800 border-zinc-700 text-zinc-50"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="low">নিম্ন</SelectItem>
            <SelectItem value="medium">মাঝারি</SelectItem>
            <SelectItem value="high">উচ্চ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">নোট (ঐচ্ছিক)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="অতিরিক্ত নোট বা নির্দেশনা যোগ করুন..."
          className="min-h-[100px] bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500"
        />
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-zinc-800 border-zinc-700 text-zinc-50 hover:bg-zinc-700"
          >
            বাতিল
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !assignedTo || !deadline}
          className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              সংরক্ষণ করা হচ্ছে...
            </>
          ) : assignment ? (
            'অ্যাসাইনমেন্ট আপডেট করুন'
          ) : (
            'অ্যাসাইনমেন্ট তৈরি করুন'
          )}
        </Button>
      </div>
    </form>
  )
}





