-- =====================================================
-- QUICK VERIFICATION - Run this to verify migration
-- =====================================================
-- Copy and paste this into Supabase SQL Editor
-- =====================================================

-- Check 1: Does tags column exist?
SELECT 
    '✅ Tags column exists' as status,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'tags';

-- Check 2: Are indexes created?
SELECT 
    '✅ Index created' as status,
    indexname as index_name
FROM pg_indexes
WHERE tablename = 'posts'
  AND (indexname LIKE '%tags%' OR indexname LIKE '%scheduled%')
ORDER BY indexname;

-- Check 3: Can we query posts with tags?
SELECT 
    '✅ Posts table accessible' as status,
    COUNT(*) as total_posts,
    COUNT(tags) as posts_with_tags,
    COUNT(*) - COUNT(tags) as posts_without_tags
FROM posts;

-- =====================================================
-- If all three queries return results, migration succeeded! ✅
-- =====================================================






