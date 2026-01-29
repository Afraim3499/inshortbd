-- =====================================================
-- Comments System Migration (Custom)
-- =====================================================
-- Description: Adds custom comments system with
--              threading, moderation, and spam filtering
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status);

-- Step 3: Create updated_at trigger
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DO $$
BEGIN
    -- Public can read approved comments only
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Public can read approved comments'
    ) THEN
        CREATE POLICY "Public can read approved comments"
            ON comments
            FOR SELECT
            TO anon, authenticated
            USING (status = 'approved');
    END IF;

    -- Authenticated users can create comments (pending by default)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Authenticated users can create comments'
    ) THEN
        CREATE POLICY "Authenticated users can create comments"
            ON comments
            FOR INSERT
            TO authenticated
            WITH CHECK (
                auth.uid() = user_id AND
                status = 'pending'
            );
    END IF;

    -- Users can update own comments (only if pending)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Users can update own pending comments'
    ) THEN
        CREATE POLICY "Users can update own pending comments"
            ON comments
            FOR UPDATE
            TO authenticated
            USING (
                auth.uid() = user_id AND
                status = 'pending'
            )
            WITH CHECK (
                auth.uid() = user_id
            );
    END IF;

    -- Admins and editors can moderate all comments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Admins can moderate comments'
    ) THEN
        CREATE POLICY "Admins can moderate comments"
            ON comments
            FOR UPDATE
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    -- Users can delete own comments or admins all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'comments' 
        AND policyname = 'Users can delete own comments or admins all'
    ) THEN
        CREATE POLICY "Users can delete own comments or admins all"
            ON comments
            FOR DELETE
            TO authenticated
            USING (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;
END $$;

-- Step 6: Add comments for documentation
COMMENT ON TABLE comments IS 'Reader comments on articles with moderation workflow';
COMMENT ON COLUMN comments.status IS 'Comment moderation status: pending, approved, rejected, spam';
COMMENT ON COLUMN comments.parent_id IS 'Parent comment ID for threaded replies';

-- =====================================================
-- Migration Complete!
-- =====================================================






