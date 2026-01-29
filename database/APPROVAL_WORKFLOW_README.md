# Approval Workflow Migration Guide

## Overview

This migration adds a comprehensive approval workflow system to Inshort platform, including:
- Extended status workflow stages
- Threaded comments for collaboration
- Reviewer assignment system
- Email notifications

## Migration Steps

1. **Run the migration script in Supabase SQL Editor:**
   ```
   database/approval-workflow-migration.sql
   ```

2. **Verify the migration:**
   ```sql
   -- Check status constraint was updated
   SELECT conname, pg_get_constraintdef(oid) 
   FROM pg_constraint 
   WHERE conrelid = 'posts'::regclass 
   AND conname = 'posts_status_check';

   -- Check tables were created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('post_comments', 'post_assignments');

   -- Check indexes were created
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename IN ('post_comments', 'post_assignments');
   ```

## What's Added

### Updated Table

#### `posts`
- **Status Column Extended:** Now includes workflow stages:
  - `draft` - Initial draft state
  - `review` - Submitted for review
  - `approved` - Approved and ready to publish
  - `published` - Live on site
  - `archived` - Archived state

### New Tables

#### `post_comments`
Threaded comments for review collaboration.

**Columns:**
- `id` - UUID primary key
- `post_id` - Reference to posts table
- `user_id` - Reference to profiles (comment author)
- `content` - Comment text
- `parent_id` - For threaded replies (NULL for top-level)
- `created_at` - Comment timestamp
- `updated_at` - Last update timestamp

#### `post_assignments`
Assign reviewers and editors to posts.

**Columns:**
- `id` - UUID primary key
- `post_id` - Reference to posts table
- `assigned_to` - Reference to profiles (assigned reviewer)
- `assigned_by` - Reference to profiles (who made assignment)
- `role` - Role type: 'reviewer', 'editor', or 'approver'
- `created_at` - Assignment timestamp

## Indexes

All necessary indexes are created for optimal query performance:
- Comments by post_id
- Comments by user_id
- Comments by parent_id (for threading)
- Comments by created_at (for sorting)
- Assignments by post_id
- Assignments by assigned_to
- Assignments by assigned_by

## RLS Policies

- **Comments:** Authenticated users can read, create own, update/delete own or admins/editors can manage all
- **Assignments:** Admins/editors can manage, users can view own assignments

## Workflow Process

1. **Draft** → Author creates content
2. **Review** → Author requests review
3. **Review** → Reviewers comment and review
4. **Approved** → Reviewer approves (ready to publish)
5. **Published** → Author publishes approved content

   OR

4. **Draft** → Reviewer rejects (with feedback)

## Email Notifications

The workflow system sends email notifications for:
- Review requests
- Assignment notifications
- Approval notifications
- Rejection notifications (with feedback)

## Usage

After migration:
1. Authors create drafts
2. Request review moves post to 'review' status
3. Assign reviewers via workflow panel
4. Reviewers add comments and approve/reject
5. Approved posts can be published

---

**Migration Created:** December 2024  
**Status:** Ready to deploy







