'use server'

import { updateAssignment } from './update'

export async function updateAssignmentStatus(
  assignmentId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
): Promise<{ success: boolean; error?: string }> {
  return updateAssignment(assignmentId, { status })
}






