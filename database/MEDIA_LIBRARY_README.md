# Media Library Migration Guide

## Overview

This migration adds centralized media management to Inshort platform, including:
- Database table for media file metadata
- Full-text search capabilities
- Tag and category organization
- Image optimization support

## Migration Steps

1. **Run the migration script in Supabase SQL Editor:**
   ```
   database/media-library-migration.sql
   ```

2. **Verify the migration:**
   ```sql
   -- Check table was created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'media_files';

   -- Check indexes were created
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename = 'media_files';
   ```

## What's Added

### New Table

#### `media_files`
Centralized storage for all media file metadata.

**Columns:**
- `id` - UUID primary key
- `file_path` - Path in Supabase Storage bucket (news-images)
- `file_name` - Original filename
- `mime_type` - File MIME type
- `file_size` - File size in bytes
- `width` - Image width (pixels)
- `height` - Image height (pixels)
- `alt_text` - Alt text for accessibility and SEO
- `caption` - Image caption
- `credit` - Photo credit
- `uploaded_by` - Reference to user who uploaded
- `tags` - Array of tags for organization
- `category` - Optional category
- `uploaded_at` - Upload timestamp
- `updated_at` - Last update timestamp
- `created_at` - Record creation time

## Indexes

All necessary indexes are created for optimal query performance:
- User lookups (`uploaded_by`)
- Date sorting (`uploaded_at DESC`)
- Category filtering
- Tag search (GIN index)
- File name search
- Full-text search (filename, alt_text, caption, credit)

## RLS Policies

- **Authenticated users can insert** - Anyone logged in can upload
- **Authenticated users can read** - All logged-in users can view media
- **Users can update own or admins all** - Uploaders can edit their files, admins/editors can edit all
- **Users can delete own or admins all** - Uploaders can delete their files, only admins can delete all

## Usage

After migration:
1. Upload images via Media Library page (`/admin/media`)
2. Images are automatically optimized (client-side resizing)
3. Metadata (alt text, tags, etc.) is stored in database
4. Use Media Picker in editor to insert images from library
5. Search and filter by category, tags, or text

## Storage

- Files are stored in Supabase Storage bucket: `news-images`
- Metadata is stored in database table: `media_files`
- Images are optimized before upload (max 1920px width)

---

**Migration Created:** December 2024  
**Status:** Ready to deploy







