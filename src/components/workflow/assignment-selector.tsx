'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPostAssignments, type PostAssignment } from '@/app/actions/workflow/get-assignments'
import { assignReviewer } from '@/app/actions/workflow/assign-reviewer'
import { unassignReviewer } from '@/app/actions/workflow/unassign-reviewer'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, UserPlus, Loader2, Users } from 'lucide-react'

interface AssignmentSelectorProps {
  postId: string
}

export function AssignmentSelector({ postId }: AssignmentSelectorProps) {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [users, setUsers] = useState<Array<{ id: string; full_name: string | null }>>([])
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['post-assignments', postId],
    queryFn: () => getPostAssignments(postId),
  })

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['admin', 'editor'])
        .order('full_name')

      if (data) {
        setUsers(data)
      }
    }
    fetchUsers()
  }, [supabase])

  const handleAssign = async () => {
    if (!selectedUser) return

    const result = await assignReviewer(postId, selectedUser, 'reviewer')
    if (result.success) {
      setSelectedUser('')
      queryClient.invalidateQueries({ queryKey: ['post-assignments', postId] })
    } else {
      alert(result.error || 'Failed to assign reviewer')
    }
  }

  const handleUnassign = async (assignedTo: string) => {
    const result = await unassignReviewer(postId, assignedTo)
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ['post-assignments', postId] })
    } else {
      alert(result.error || 'Failed to unassign reviewer')
    }
  }

  const assignedUserIds = new Set(assignments.map((a) => a.assigned_to))
  const availableUsers = users.filter((u) => !assignedUserIds.has(u.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assign Reviewers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Assignments */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviewers assigned</p>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">
                    {assignment.assigned_to_profile?.full_name || 'Unknown User'}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {assignment.role}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnassign(assignment.assigned_to)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Assign New Reviewer */}
        <div className="flex gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select reviewer..." />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || 'Unknown User'}
                </SelectItem>
              ))}
              {availableUsers.length === 0 && (
                <SelectItem value="" disabled>
                  No available users
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleAssign} disabled={!selectedUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}






