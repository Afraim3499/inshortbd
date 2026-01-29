# Database Migration Guide

## Overview

This directory contains SQL migration scripts for Inshort platform database schema updates.

## Required Migration: Tags Column

### File: `migration.sql`

This migration adds the `tags` column to the `posts` table, which is required for the tags system to function.

### How to Run

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Copy and Paste**
   - Open `database/migration.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

3. **Execute**
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for confirmation

4. **Verify**
   - The script includes verification queries at the end
   - Check that the `tags` column appears in the results

### What This Migration Does

- ✅ Adds `tags text[]` column to `posts` table
- ✅ Creates GIN indexes for efficient tag queries
- ✅ Creates indexes for scheduled posts
- ✅ Creates indexes for category and tag archives
- ✅ Creates full-text search indexes
- ✅ Sets default empty array for tags

### Required Before

This migration must be run before:
- Using tags in the editor
- Accessing tag archive pages
- Filtering by tags in search

---

## Optional Migration: Revision History

### File: `revision-history-optional.sql`

This migration creates the revision history table for tracking post changes. This is **optional** and can be implemented later.

### Status: Not Required for Launch

The revision history feature is planned for Phase 8 but is not required for production launch. You can implement it later when needed.

### How to Use (When Ready)

1. Uncomment the SQL statements in the file
2. Run in Supabase SQL Editor
3. Update TypeScript types accordingly

---

## Migration Checklist

- [ ] Run `migration.sql` in Supabase SQL Editor
- [ ] Verify tags column was created
- [ ] Verify indexes were created
- [ ] Test tag creation in editor
- [ ] Test tag filtering in search
- [ ] Test tag archive pages

---

## Troubleshooting

### Error: Column already exists
- This is fine! The migration uses `IF NOT EXISTS` so it's safe to run multiple times
- Continue with verification queries

### Error: Permission denied
- Ensure you're running as the database owner or have proper permissions
- Check your Supabase project access level

### Tags not working after migration
- Verify the column exists using the verification queries
- Check TypeScript types match the schema
- Clear browser cache and restart dev server

---

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify your database connection
3. Ensure RLS policies allow necessary operations

---

*Last Updated: December 2024*







