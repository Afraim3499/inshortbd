-- =====================================================
-- Final Migration Verification
-- =====================================================
-- Run this to verify everything is set up correctly
-- =====================================================

-- 1. Check all tables exist
SELECT 'Tables' as check_type, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'newsletter_subscribers', 
    'newsletter_campaigns', 
    'newsletter_sends',
    'social_accounts',
    'social_posts'
);

-- 2. List all tables with details
SELECT 
    'Table Details' as check_type,
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name 
     AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
    'newsletter_subscribers', 
    'newsletter_campaigns', 
    'newsletter_sends',
    'social_accounts',
    'social_posts'
)
ORDER BY table_name;

-- 3. Check function exists and works
SELECT 
    'Function' as check_type,
    proname as function_name,
    CASE 
        WHEN proname = 'update_updated_at_column' THEN '✅ Ready'
        ELSE '❌ Missing'
    END as status
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- 4. Check all triggers exist
SELECT 
    'Triggers' as check_type,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    '✅ Active' as status
FROM pg_trigger 
WHERE tgname IN (
    'update_newsletter_subscribers_updated_at',
    'update_newsletter_campaigns_updated_at',
    'update_social_accounts_updated_at',
    'update_social_posts_updated_at'
)
ORDER BY tgname;

-- 5. Check Row Level Security is enabled
SELECT 
    'RLS Status' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'newsletter_subscribers', 
    'newsletter_campaigns', 
    'newsletter_sends',
    'social_accounts',
    'social_posts'
)
ORDER BY tablename;

-- 6. Summary
SELECT 
    'SUMMARY' as check_type,
    (SELECT COUNT(*) 
     FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('newsletter_subscribers', 'newsletter_campaigns', 'newsletter_sends', 'social_accounts', 'social_posts')) as tables_ready,
    (SELECT COUNT(*) 
     FROM pg_proc 
     WHERE proname = 'update_updated_at_column') as functions_ready,
    (SELECT COUNT(*) 
     FROM pg_trigger 
     WHERE tgname LIKE '%updated_at%') as triggers_ready,
    CASE 
        WHEN (SELECT COUNT(*) 
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name IN ('newsletter_subscribers', 'newsletter_campaigns', 'newsletter_sends', 'social_accounts', 'social_posts')) = 5
        AND (SELECT COUNT(*) FROM pg_proc WHERE proname = 'update_updated_at_column') >= 1
        AND (SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE '%updated_at%') >= 4
        THEN '✅ ALL SYSTEMS READY - Migrations Complete!'
        ELSE '⚠️ Some items may be missing'
    END as overall_status;

