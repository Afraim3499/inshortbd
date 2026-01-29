-- =====================================================
-- Migration Verification Script
-- =====================================================
-- Run this script AFTER running migration.sql to verify
-- everything was created successfully
-- =====================================================

-- =====================================================
-- 1. Verify Tags Column Exists
-- =====================================================
SELECT 
    column_name, 
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'posts' 
  AND column_name = 'tags';

-- Expected Result: Should show one row with:
-- - column_name: tags
-- - data_type: ARRAY
-- - udt_name: _text (text array)

-- =====================================================
-- 2. Verify All Indexes Were Created
-- =====================================================
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'posts'
  AND (
    indexname LIKE '%tags%' 
    OR indexname LIKE '%scheduled%'
    OR indexname LIKE '%search%'
    OR indexname LIKE '%category%'
  )
ORDER BY indexname;

-- Expected Results: Should show 5 indexes:
-- 1. idx_posts_tags (GIN index on tags)
-- 2. idx_posts_scheduled (for scheduled posts)
-- 3. idx_posts_category_status (for category archives)
-- 4. idx_posts_tags_status (GIN index on tags where published)
-- 5. idx_posts_search (full-text search index)

-- =====================================================
-- 3. Verify Column Comment Was Added
-- =====================================================
SELECT 
    obj_description(c.oid, 'pg_class') AS table_comment,
    col_description(c.oid, a.attnum) AS column_comment
FROM pg_class c
JOIN pg_attribute a ON a.attrelid = c.oid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'posts'
  AND a.attname = 'tags';

-- Expected Result: Should show a comment on the tags column

-- =====================================================
-- 4. Test Tag Column Functionality
-- =====================================================

-- Test: Insert a test post with tags (optional - only if you want to test)
-- Uncomment below to test:
/*
INSERT INTO posts (
    title,
    slug,
    category,
    status,
    tags,
    author_id
) VALUES (
    'Test Post with Tags',
    'test-post-with-tags',
    'Tech',
    'draft',
    ARRAY['test', 'migration', 'verification'],
    (SELECT id FROM auth.users LIMIT 1)
) RETURNING id, title, tags;

-- Clean up test post
-- DELETE FROM posts WHERE slug = 'test-post-with-tags';
*/

-- =====================================================
-- 5. Check Existing Posts (to see tags column)
-- =====================================================
SELECT 
    id,
    title,
    slug,
    status,
    tags,
    CASE 
        WHEN tags IS NULL THEN 'NULL (no tags)'
        WHEN array_length(tags, 1) IS NULL THEN 'Empty array'
        ELSE 'Has ' || array_length(tags, 1) || ' tag(s)'
    END AS tags_status
FROM posts
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- Verification Summary
-- =====================================================
-- ✅ If all queries above return expected results:
--    Your migration was successful!
--
-- ❌ If any queries fail or return unexpected results:
--    1. Check the error messages in Supabase
--    2. Verify you have proper permissions
--    3. Try running migration.sql again (it's safe - uses IF NOT EXISTS)
-- =====================================================






