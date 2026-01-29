-- =====================================================
-- Enhanced Analytics Migration
-- =====================================================
-- Description: Creates tables for detailed analytics tracking
--              including events, sessions, and engagement metrics
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create analytics_sessions table
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    country TEXT,
    city TEXT,
    referrer TEXT,
    traffic_source TEXT CHECK (traffic_source IN ('direct', 'search', 'social', 'referral', 'email', 'other')),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'scroll', 'time', 'exit', 'click')),
    event_data JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_post_id ON analytics_sessions(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_traffic_source ON analytics_sessions(traffic_source);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_device_type ON analytics_sessions(device_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_post_id ON analytics_events(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_post_timestamp ON analytics_events(post_id, timestamp);

-- Step 4: Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create triggers for updated_at
DROP TRIGGER IF EXISTS update_analytics_sessions_updated_at ON analytics_sessions;
CREATE TRIGGER update_analytics_sessions_updated_at
    BEFORE UPDATE ON analytics_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
DO $$
BEGIN
    -- Analytics sessions: Public insert, admin/editor read
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analytics_sessions' 
        AND policyname = 'Public can insert sessions'
    ) THEN
        CREATE POLICY "Public can insert sessions"
            ON analytics_sessions
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analytics_sessions' 
        AND policyname = 'Public can update own sessions'
    ) THEN
        CREATE POLICY "Public can update own sessions"
            ON analytics_sessions
            FOR UPDATE
            TO anon, authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analytics_sessions' 
        AND policyname = 'Admins can read all sessions'
    ) THEN
        CREATE POLICY "Admins can read all sessions"
            ON analytics_sessions
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

    -- Analytics events: Public insert, admin/editor read
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analytics_events' 
        AND policyname = 'Public can insert events'
    ) THEN
        CREATE POLICY "Public can insert events"
            ON analytics_events
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analytics_events' 
        AND policyname = 'Admins can read all events'
    ) THEN
        CREATE POLICY "Admins can read all events"
            ON analytics_events
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

-- Step 8: Add comments for documentation
COMMENT ON TABLE analytics_sessions IS 'Tracks user sessions with device, location, and traffic source data';
COMMENT ON TABLE analytics_events IS 'Tracks individual analytics events (page views, scroll depth, time on page)';

COMMENT ON COLUMN analytics_sessions.session_id IS 'Unique session identifier (generated client-side)';
COMMENT ON COLUMN analytics_sessions.traffic_source IS 'Categorized traffic source: direct, search, social, referral, email, other';
COMMENT ON COLUMN analytics_sessions.duration_seconds IS 'Total session duration in seconds';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of event: page_view, scroll, time, exit, click';
COMMENT ON COLUMN analytics_events.event_data IS 'Additional event data as JSON (e.g., scroll_depth, time_seconds)';

-- =====================================================
-- Migration Complete!
-- =====================================================






