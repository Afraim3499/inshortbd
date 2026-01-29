# Social Media Task Checklist System - Migration Guide

## Overview

This migration creates the Social Media Task Checklist System for tracking employee social media posting tasks and monitoring KPIs.

## Database Tables

### 1. `social_tasks`
Main table for tracking social media posting tasks.

**Columns:**
- `id` - UUID primary key
- `post_id` - Reference to the article post
- `platform` - Platform type (twitter, facebook, linkedin, instagram, other)
- `task_title` - Title of the task
- `task_description` - Optional description
- `post_text` - Optional suggested post text
- `article_url` - URL to the article
- `assigned_to` - User ID of assigned employee (optional)
- `assigned_by` - User ID who created the task
- `status` - pending, in_progress, completed, cancelled
- `priority` - low, medium, high, urgent
- `due_date` - Optional due date
- `scheduled_date` - Optional scheduled date
- `created_at`, `updated_at` - Timestamps

### 2. `social_task_completions`
Tracks task completions with proof links for KPI monitoring.

**Columns:**
- `id` - UUID primary key
- `task_id` - Reference to the task
- `completed_by` - User ID who completed the task
- `completion_link` - URL proof of completion (required)
- `completion_notes` - Optional notes
- `completed_at` - Timestamp
- `verification_status` - pending, verified, rejected
- `verified_by` - User ID who verified (optional)
- `verified_at` - Verification timestamp (optional)
- `created_at` - Timestamp

## Migration Steps

1. Run the migration script in Supabase SQL Editor:
   ```
   database/social-task-checklist-migration.sql
   ```

2. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('social_tasks', 'social_task_completions');
   ```

3. Check indexes:
   ```sql
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename IN ('social_tasks', 'social_task_completions');
   ```

## Features

### Task Management
- Create tasks from articles
- Assign tasks to employees
- Set due dates and priorities
- Track completion with proof links

### KPI Tracking
- Total tasks per employee
- Completion rate
- Average completion time
- Platform breakdown
- Performance analytics

### Admin Pages
- `/admin/social/tasks` - Task list with filters
- `/admin/social/tasks/board` - Kanban board view
- `/admin/social/tasks/performance` - Employee performance dashboard
- `/admin/social/tasks/history` - Completion history

## Usage

### Creating a Task from Editor

After publishing an article, you can create social media tasks using the "Create Social Task" button in the editor.

### Completing a Task

1. View assigned tasks in `/admin/social/tasks`
2. Click "Mark as Complete"
3. Paste the URL of your social media post as proof
4. Add optional notes
5. Submit

The system tracks completion time and links for KPI monitoring.

## Security

- Row Level Security (RLS) is enabled
- Admins and editors can manage all tasks
- Users can view and complete assigned tasks
- Completion links are required for accountability

## Next Steps

1. Run the migration script
2. Test task creation from the editor
3. View tasks in the admin dashboard
4. Monitor employee performance in the KPI dashboard






