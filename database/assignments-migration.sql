-- =====================================================
-- Content Assignments Migration
-- =====================================================
-- Description: Adds content assignments table for
--              tracking article assignments with deadlines
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create content_assignments table
CREATE TABLE IF NOT EXISTS content_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id)
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_assignments_post_id ON content_assignments(post_id);
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_to ON content_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_assignments_deadline ON content_assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_content_assignments_status ON content_assignments(status);
CREATE INDEX IF NOT EXISTS idx_content_assignments_priority ON content_assignments(priority);

-- Step 3: Create updated_at trigger
DROP TRIGGER IF EXISTS update_content_assignments_updated_at ON content_assignments;
CREATE TRIGGER update_content_assignments_updated_at
    BEFORE UPDATE ON content_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Enable RLS
ALTER TABLE content_assignments ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DO $$
BEGIN
    -- Users can read assignments assigned to them or admins all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_assignments' 
        AND policyname = 'Users can read own assignments or admins all'
    ) THEN
        CREATE POLICY "Users can read own assignments or admins all"
            ON content_assignments
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

    -- Admins and editors can create assignments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_assignments' 
        AND policyname = 'Admins can create assignments'
    ) THEN
        CREATE POLICY "Admins can create assignments"
            ON content_assignments
            FOR INSERT
            TO authenticated
            WITH CHECK (
                auth.uid() = assigned_by AND
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    -- Users can update assignments assigned to them or admins all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_assignments' 
        AND policyname = 'Users can update own assignments or admins all'
    ) THEN
        CREATE POLICY "Users can update own assignments or admins all"
            ON content_assignments
            FOR UPDATE
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

    -- Admins and editors can delete assignments
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'content_assignments' 
        AND policyname = 'Admins can delete assignments'
    ) THEN
        CREATE POLICY "Admins can delete assignments"
            ON content_assignments
            FOR DELETE
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

-- Step 6: Add comments for documentation
COMMENT ON TABLE content_assignments IS 'Article assignments with deadlines and priority tracking';
COMMENT ON COLUMN content_assignments.deadline IS 'Assignment deadline timestamp';
COMMENT ON COLUMN content_assignments.status IS 'Assignment status: pending, in_progress, completed, overdue';
COMMENT ON COLUMN content_assignments.priority IS 'Assignment priority: low, medium, high';

-- =====================================================
-- Migration Complete!
-- =====================================================






