-- =====================================================
-- Social Media Task Checklist System Migration
-- =====================================================
-- Description: Creates tables for social media task
--              tracking and employee KPI monitoring
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create social_tasks table
CREATE TABLE IF NOT EXISTS social_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'instagram', 'other')),
    task_title TEXT NOT NULL,
    task_description TEXT,
    post_text TEXT,
    article_url TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_by UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    scheduled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create social_task_completions table
CREATE TABLE IF NOT EXISTS social_task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES social_tasks(id) ON DELETE CASCADE,
    completed_by UUID NOT NULL REFERENCES profiles(id),
    completion_link TEXT NOT NULL,
    completion_notes TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_tasks_post_id ON social_tasks(post_id);
CREATE INDEX IF NOT EXISTS idx_social_tasks_assigned_to ON social_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_social_tasks_status ON social_tasks(status);
CREATE INDEX IF NOT EXISTS idx_social_tasks_platform ON social_tasks(platform);
CREATE INDEX IF NOT EXISTS idx_social_tasks_due_date ON social_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_tasks_scheduled_date ON social_tasks(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_task_completions_task_id ON social_task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_social_task_completions_completed_by ON social_task_completions(completed_by);
CREATE INDEX IF NOT EXISTS idx_social_task_completions_completed_at ON social_task_completions(completed_at);

-- Step 4: Create updated_at trigger function (if needed)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create triggers
DO $$
BEGIN
    -- Trigger for social_tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_social_tasks_updated_at'
    ) THEN
        CREATE TRIGGER update_social_tasks_updated_at
            BEFORE UPDATE ON social_tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Step 6: Add comments for documentation
COMMENT ON TABLE social_tasks IS 'Social media tasks for tracking employee posting assignments';
COMMENT ON TABLE social_task_completions IS 'Task completion tracking with links and verification for KPI monitoring';

-- Step 7: Enable Row Level Security
ALTER TABLE social_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_task_completions ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
DO $$
BEGIN
    -- Social tasks: Admins/editors can manage, assigned users can view/complete their tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_tasks' 
        AND policyname = 'Admins can manage all social tasks'
    ) THEN
        CREATE POLICY "Admins can manage all social tasks"
            ON social_tasks
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

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_tasks' 
        AND policyname = 'Users can view assigned tasks'
    ) THEN
        CREATE POLICY "Users can view assigned tasks"
            ON social_tasks
            FOR SELECT
            TO authenticated
            USING (
                assigned_to = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_tasks' 
        AND policyname = 'Users can update assigned tasks'
    ) THEN
        CREATE POLICY "Users can update assigned tasks"
            ON social_tasks
            FOR UPDATE
            TO authenticated
            USING (
                assigned_to = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    -- Task completions: Admins can view all, users can view/update their own
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_task_completions' 
        AND policyname = 'Admins can manage completions'
    ) THEN
        CREATE POLICY "Admins can manage completions"
            ON social_task_completions
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

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_task_completions' 
        AND policyname = 'Users can create completions'
    ) THEN
        CREATE POLICY "Users can create completions"
            ON social_task_completions
            FOR INSERT
            TO authenticated
            WITH CHECK (completed_by = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'social_task_completions' 
        AND policyname = 'Users can view own completions'
    ) THEN
        CREATE POLICY "Users can view own completions"
            ON social_task_completions
            FOR SELECT
            TO authenticated
            USING (
                completed_by = auth.uid()
                OR EXISTS (
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
AND table_name IN ('social_tasks', 'social_task_completions');

-- Check indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('social_tasks', 'social_task_completions');






