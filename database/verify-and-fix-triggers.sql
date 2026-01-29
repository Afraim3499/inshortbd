-- =====================================================
-- Verify and Fix Missing Triggers
-- =====================================================
-- Run this to check what's missing and fix triggers
-- =====================================================

-- Step 1: Create the function (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create missing triggers for Newsletter tables

-- Trigger for newsletter_subscribers (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_newsletter_subscribers_updated_at'
    ) THEN
        CREATE TRIGGER update_newsletter_subscribers_updated_at
            BEFORE UPDATE ON newsletter_subscribers
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger: update_newsletter_subscribers_updated_at';
    ELSE
        RAISE NOTICE 'Trigger already exists: update_newsletter_subscribers_updated_at';
    END IF;
END $$;

-- Trigger for newsletter_campaigns (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_newsletter_campaigns_updated_at'
    ) THEN
        CREATE TRIGGER update_newsletter_campaigns_updated_at
            BEFORE UPDATE ON newsletter_campaigns
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger: update_newsletter_campaigns_updated_at';
    ELSE
        RAISE NOTICE 'Trigger already exists: update_newsletter_campaigns_updated_at';
    END IF;
END $$;

-- Step 3: Create missing triggers for Social Media tables

-- Trigger for social_accounts (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_social_accounts_updated_at'
    ) THEN
        CREATE TRIGGER update_social_accounts_updated_at
            BEFORE UPDATE ON social_accounts
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger: update_social_accounts_updated_at';
    ELSE
        RAISE NOTICE 'Trigger already exists: update_social_accounts_updated_at';
    END IF;
END $$;

-- Trigger for social_posts (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_social_posts_updated_at'
    ) THEN
        CREATE TRIGGER update_social_posts_updated_at
            BEFORE UPDATE ON social_posts
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created trigger: update_social_posts_updated_at';
    ELSE
        RAISE NOTICE 'Trigger already exists: update_social_posts_updated_at';
    END IF;
END $$;

-- Step 4: Verify everything is set up correctly

-- Check function exists
SELECT '✅ Function exists' as status, proname 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';

-- Check all triggers exist
SELECT 
    '✅ Trigger exists' as status,
    tgname as trigger_name,
    tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname IN (
    'update_newsletter_subscribers_updated_at',
    'update_newsletter_campaigns_updated_at',
    'update_social_accounts_updated_at',
    'update_social_posts_updated_at'
)
ORDER BY tgname;

-- Summary
SELECT 
    (SELECT COUNT(*) FROM pg_proc WHERE proname = 'update_updated_at_column') as functions_created,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname LIKE '%updated_at%') as triggers_created,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('newsletter_subscribers', 'newsletter_campaigns', 'newsletter_sends', 'social_accounts', 'social_posts')) as tables_created;






