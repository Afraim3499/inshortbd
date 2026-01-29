-- =====================================================
-- Newsletter System Migration Script (Safe Version)
-- =====================================================
-- Description: Creates tables for newsletter subscribers
--              and campaigns management
-- This version avoids DROP statements that trigger warnings
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    unsubscribe_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create newsletter_campaigns table
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('article', 'campaign', 'welcome')),
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create newsletter_sends table (track individual sends)
CREATE TABLE IF NOT EXISTS newsletter_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'clicked', 'bounced', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_post_id ON newsletter_campaigns(post_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_id ON newsletter_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_subscriber_id ON newsletter_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_status ON newsletter_sends(status);

-- Step 5: Create updated_at trigger function
-- CREATE OR REPLACE is safe - it creates if not exists, replaces if exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create triggers (only if they don't exist)
DO $$
BEGIN
    -- Trigger for newsletter_subscribers
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_newsletter_subscribers_updated_at'
    ) THEN
        CREATE TRIGGER update_newsletter_subscribers_updated_at
            BEFORE UPDATE ON newsletter_subscribers
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger for newsletter_campaigns
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_newsletter_campaigns_updated_at'
    ) THEN
        CREATE TRIGGER update_newsletter_campaigns_updated_at
            BEFORE UPDATE ON newsletter_campaigns
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Step 7: Add comments for documentation
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscriber list with subscription status';
COMMENT ON TABLE newsletter_campaigns IS 'Newsletter campaigns and automated article emails';
COMMENT ON TABLE newsletter_sends IS 'Individual email sends for tracking opens and clicks';

-- Step 8: Enable Row Level Security (RLS)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies (only if they don't exist)
DO $$
BEGIN
    -- Subscribers: Public can insert (signup), admins can read
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'newsletter_subscribers' 
        AND policyname = 'Public can subscribe to newsletter'
    ) THEN
        CREATE POLICY "Public can subscribe to newsletter"
            ON newsletter_subscribers
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'newsletter_subscribers' 
        AND policyname = 'Admins can view subscribers'
    ) THEN
        CREATE POLICY "Admins can view subscribers"
            ON newsletter_subscribers
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    -- Campaigns: Only admins/editors
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'newsletter_campaigns' 
        AND policyname = 'Admins can manage campaigns'
    ) THEN
        CREATE POLICY "Admins can manage campaigns"
            ON newsletter_campaigns
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    -- Sends: Only admins/editors
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'newsletter_sends' 
        AND policyname = 'Admins can view sends'
    ) THEN
        CREATE POLICY "Admins can view sends"
            ON newsletter_sends
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;
END $$;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('newsletter_subscribers', 'newsletter_campaigns', 'newsletter_sends');

-- Check indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('newsletter_subscribers', 'newsletter_campaigns', 'newsletter_sends');

