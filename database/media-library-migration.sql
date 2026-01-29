-- =====================================================
-- Media Library Migration
-- =====================================================
-- Description: Creates table for centralized media management
--              with metadata storage for images and files
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create media_files table
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    credit TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[],
    category TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_at ON media_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON media_files(category);
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_files_file_name ON media_files(file_name);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_media_files_search ON media_files USING GIN(
    to_tsvector('english', 
        COALESCE(file_name, '') || ' ' || 
        COALESCE(alt_text, '') || ' ' || 
        COALESCE(caption, '') || ' ' || 
        COALESCE(credit, '')
    )
);

-- Step 3: Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable Row Level Security
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
DO $$
BEGIN
    -- Public can insert (for uploads)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_files' 
        AND policyname = 'Authenticated users can insert media'
    ) THEN
        CREATE POLICY "Authenticated users can insert media"
            ON media_files
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;

    -- Authenticated users can read all media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_files' 
        AND policyname = 'Authenticated users can read media'
    ) THEN
        CREATE POLICY "Authenticated users can read media"
            ON media_files
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    -- Users can update their own uploads, admins/editors can update all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_files' 
        AND policyname = 'Users can update own or admins all media'
    ) THEN
        CREATE POLICY "Users can update own or admins all media"
            ON media_files
            FOR UPDATE
            TO authenticated
            USING (
                uploaded_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    -- Users can delete their own uploads, admins can delete all
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'media_files' 
        AND policyname = 'Users can delete own or admins all media'
    ) THEN
        CREATE POLICY "Users can delete own or admins all media"
            ON media_files
            FOR DELETE
            TO authenticated
            USING (
                uploaded_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
    END IF;
END $$;

-- Step 7: Add comments for documentation
COMMENT ON TABLE media_files IS 'Centralized media library for all uploaded images and files';
COMMENT ON COLUMN media_files.file_path IS 'Path in Supabase Storage bucket (news-images)';
COMMENT ON COLUMN media_files.alt_text IS 'Alt text for accessibility and SEO';
COMMENT ON COLUMN media_files.tags IS 'Array of tags for organization and search';
COMMENT ON COLUMN media_files.category IS 'Optional category for organization';

-- =====================================================
-- Migration Complete!
-- =====================================================






