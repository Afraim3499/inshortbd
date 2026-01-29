-- =====================================================
-- Simple Migration Verification
-- =====================================================
-- Quick check to confirm everything is working
-- =====================================================

-- Check 1: All 5 tables exist?
SELECT 
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All 5 tables created'
        ELSE '❌ Missing tables (expected 5, found ' || COUNT(*) || ')'
    END as tables_status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'newsletter_subscribers', 
    'newsletter_campaigns', 
    'newsletter_sends',
    'social_accounts',
    'social_posts'
);

-- Check 2: Function exists?
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ Function exists (' || COUNT(*) || ' found)'
        ELSE '❌ Function missing'
    END as function_status,
    proname as function_name
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- Check 3: All triggers exist?
SELECT 
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ All triggers created (' || COUNT(*) || ' found)'
        ELSE '❌ Missing triggers (expected 4+, found ' || COUNT(*) || ')'
    END as triggers_status,
    COUNT(*) as trigger_count
FROM pg_trigger 
WHERE tgname IN (
    'update_newsletter_subscribers_updated_at',
    'update_newsletter_campaigns_updated_at',
    'update_social_accounts_updated_at',
    'update_social_posts_updated_at'
);

-- Check 4: Final Status
SELECT 
    CASE 
        WHEN 
            (SELECT COUNT(*) FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('newsletter_subscribers', 'newsletter_campaigns', 'newsletter_sends', 'social_accounts', 'social_posts')) = 5
            AND (SELECT COUNT(*) FROM pg_proc WHERE proname = 'update_updated_at_column') >= 1
            AND (SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE '%updated_at%') >= 4
        THEN '✅✅✅ ALL SYSTEMS READY! Migrations Complete!'
        ELSE '⚠️ Check individual statuses above'
    END as FINAL_STATUS;






