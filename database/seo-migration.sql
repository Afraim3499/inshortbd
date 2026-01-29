-- =====================================================
-- SEO Analytics & Tracking Migration
-- =====================================================
-- Description: Creates tables for SEO score tracking,
--              keyword performance, and analytics
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Add SEO columns to posts table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'seo_score') THEN
        ALTER TABLE posts ADD COLUMN seo_score INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'readability_score') THEN
        ALTER TABLE posts ADD COLUMN readability_score INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'meta_description') THEN
        ALTER TABLE posts ADD COLUMN meta_description TEXT;
    END IF;
END $$;

-- Step 2: Create seo_analytics table for tracking scores over time
CREATE TABLE IF NOT EXISTS seo_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    seo_score INTEGER NOT NULL CHECK (seo_score >= 0 AND seo_score <= 100),
    readability_score INTEGER CHECK (readability_score >= 0 AND readability_score <= 100),
    word_count INTEGER,
    keyword_density DECIMAL(5,2),
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create keyword_tracking table
CREATE TABLE IF NOT EXISTS keyword_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    density DECIMAL(5,2) NOT NULL,
    position INTEGER,
    count INTEGER NOT NULL DEFAULT 0,
    tracked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_analytics_post_id ON seo_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_analyzed_at ON seo_analytics(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_seo_analytics_seo_score ON seo_analytics(seo_score);
CREATE INDEX IF NOT EXISTS idx_keyword_tracking_post_id ON keyword_tracking(post_id);
CREATE INDEX IF NOT EXISTS idx_keyword_tracking_keyword ON keyword_tracking(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_tracking_tracked_at ON keyword_tracking(tracked_at);
CREATE INDEX IF NOT EXISTS idx_posts_seo_score ON posts(seo_score) WHERE seo_score IS NOT NULL;

-- Step 5: Enable Row Level Security
ALTER TABLE seo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_tracking ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
DO $$
BEGIN
    -- SEO analytics: Only admins/editors
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'seo_analytics' 
        AND policyname = 'Admins can manage seo analytics'
    ) THEN
        CREATE POLICY "Admins can manage seo analytics"
            ON seo_analytics
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

    -- Keyword tracking: Only admins/editors
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'keyword_tracking' 
        AND policyname = 'Admins can manage keyword tracking'
    ) THEN
        CREATE POLICY "Admins can manage keyword tracking"
            ON keyword_tracking
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
END $$;

-- Step 7: Add comments for documentation
COMMENT ON TABLE seo_analytics IS 'Historical tracking of SEO scores for articles';
COMMENT ON TABLE keyword_tracking IS 'Keyword density and performance tracking';
COMMENT ON COLUMN posts.seo_score IS 'Current SEO score (0-100)';
COMMENT ON COLUMN posts.readability_score IS 'Current readability score (0-100)';
COMMENT ON COLUMN posts.meta_description IS 'SEO meta description';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('seo_analytics', 'keyword_tracking');

-- Check columns were added to posts
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('seo_score', 'readability_score', 'meta_description');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('seo_analytics', 'keyword_tracking', 'posts')
AND indexname LIKE '%seo%' OR indexname LIKE '%keyword%';






