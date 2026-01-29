-- =====================================================
-- Database Migration Script for Inshort Platform
-- =====================================================
-- Description: Adds tags column to posts table and sets up
--              required indexes for optimal performance
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Add tags column to posts table
-- This column stores an array of tags (text[]) for each post
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS tags text[];

-- Step 2: Add comment for documentation
COMMENT ON COLUMN posts.tags IS 'Array of tags for content categorization and discovery';

-- Step 3: Create index for tag-based queries (GIN index for array searches)
-- This index allows efficient queries like: WHERE 'tag' = ANY(tags)
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);

-- Step 4: Create index for scheduled posts queries
-- This helps with the editorial calendar and auto-publishing
CREATE INDEX IF NOT EXISTS idx_posts_scheduled 
ON posts (published_at, status) 
WHERE status = 'draft' AND published_at IS NOT NULL;

-- Step 5: Create index for category archives (if not exists)
CREATE INDEX IF NOT EXISTS idx_posts_category_status 
ON posts (category, status, published_at DESC)
WHERE status = 'published';

-- Step 6: Create index for tag archive pages
CREATE INDEX IF NOT EXISTS idx_posts_tags_status 
ON posts USING GIN (tags)
WHERE status = 'published';

-- Step 7: Optimize search queries
-- Full-text search index for title and excerpt
CREATE INDEX IF NOT EXISTS idx_posts_search 
ON posts USING GIN (
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(excerpt, ''))
)
WHERE status = 'published';

-- =====================================================
-- Optional: Add constraints and defaults
-- =====================================================

-- Set default empty array if needed
ALTER TABLE posts 
ALTER COLUMN tags SET DEFAULT '{}'::text[];

-- =====================================================
-- Verification Queries (Run these to verify migration)
-- =====================================================

-- Check if tags column exists
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'posts' 
  AND column_name = 'tags';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'posts'
  AND (indexname LIKE '%tags%' OR indexname LIKE '%scheduled%');

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next Steps:
-- 1. Verify the column was added successfully
-- 2. Update your TypeScript types (already done in codebase)
-- 3. Test tag creation in the editor
-- 4. Test tag filtering in search
-- =====================================================







