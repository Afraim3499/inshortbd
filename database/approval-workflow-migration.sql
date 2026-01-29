-- =====================================================
-- Approval Workflow Migration
-- =====================================================
-- Description: Adds approval workflow system with status
--              transitions, comments, and assignments
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Update posts status column constraint to include workflow stages
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
    
    -- Add new constraint with workflow stages
    ALTER TABLE posts ADD CONSTRAINT posts_status_check 
        CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived'));
END $$;

-- Step 2: Create post_comments table for review comments
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create post_assignments table for assigning reviewers
CREATE TABLE IF NOT EXISTS post_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'reviewer' CHECK (role IN ('reviewer', 'editor', 'approver')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, assigned_to)
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_assignments_post_id ON post_assignments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_assignments_assigned_to ON post_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_post_assignments_assigned_by ON post_assignments(assigned_by);

-- Step 5: Create function to update updated_at column (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create triggers for updated_at
DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at
    BEFORE UPDATE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Enable Row Level Security
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_assignments ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
DO $$
BEGIN
    -- Post comments: Authenticated users can read, admins/editors can manage
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_comments' 
        AND policyname = 'Authenticated users can read comments'
    ) THEN
        CREATE POLICY "Authenticated users can read comments"
            ON post_comments
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_comments' 
        AND policyname = 'Users can create comments'
    ) THEN
        CREATE POLICY "Users can create comments"
            ON post_comments
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_comments' 
        AND policyname = 'Users can update own comments or admins all'
    ) THEN
        CREATE POLICY "Users can update own comments or admins all"
            ON post_comments
            FOR UPDATE
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

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_comments' 
        AND policyname = 'Users can delete own comments or admins all'
    ) THEN
        CREATE POLICY "Users can delete own comments or admins all"
            ON post_comments
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

    -- Post assignments: Admins/editors can manage
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_assignments' 
        AND policyname = 'Admins and editors can manage assignments'
    ) THEN
        CREATE POLICY "Admins and editors can manage assignments"
            ON post_assignments
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

    -- Users can view assignments for posts they're assigned to
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_assignments' 
        AND policyname = 'Users can view own assignments'
    ) THEN
        CREATE POLICY "Users can view own assignments"
            ON post_assignments
            FOR SELECT
            TO authenticated
            USING (
                auth.uid() = assigned_to OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;
END $$;

-- Step 9: Add comments for documentation
COMMENT ON TABLE post_comments IS 'Threaded comments on posts for review and collaboration';
COMMENT ON TABLE post_assignments IS 'Assign reviewers and editors to posts for approval workflow';
COMMENT ON COLUMN post_comments.parent_id IS 'Parent comment ID for threaded comments (NULL for top-level)';
COMMENT ON COLUMN post_assignments.role IS 'Role of the assigned user: reviewer, editor, or approver';

-- =====================================================
-- Migration Complete!
-- =====================================================






