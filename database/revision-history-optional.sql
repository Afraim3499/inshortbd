-- =====================================================
-- Optional: Revision History Table (Phase 8)
-- =====================================================
-- Description: Creates a table to store revision history
--              for posts. This is optional and can be
--              implemented post-launch when needed.
-- =====================================================

-- Uncomment below to create revision history table

/*
-- Create post_revisions table
CREATE TABLE IF NOT EXISTS post_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT,
    content JSONB,
    category TEXT,
    featured_image_url TEXT,
    tags TEXT[],
    author_id UUID REFERENCES auth.users(id),
    revision_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Ensure revision number is sequential per post
    UNIQUE(post_id, revision_number)
);

-- Create indexes
CREATE INDEX idx_post_revisions_post_id ON post_revisions(post_id);
CREATE INDEX idx_post_revisions_created_at ON post_revisions(created_at DESC);

-- Enable RLS
ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins and editors can view revisions
CREATE POLICY "Users can view revisions of their own posts or if admin"
    ON post_revisions FOR SELECT
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

-- RLS Policy: Only admins and editors can create revisions
CREATE POLICY "Admins and editors can create revisions"
    ON post_revisions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

COMMENT ON TABLE post_revisions IS 'Stores revision history for posts';
*/

-- =====================================================
-- Note: Revision history is optional and can be
-- implemented later when the feature is needed.
-- =====================================================






