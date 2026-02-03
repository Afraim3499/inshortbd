-- =====================================================
-- Fix Collections Schema
-- =====================================================
-- Description: Aligns the collections table with app code
--              1. Adds created_by column if missing
--              2. Renames cover_image_url to featured_image_url
-- =====================================================

DO $$
BEGIN
    -- 1. Handle 'created_by' column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'collections' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE collections 
        ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE CASCADE;
        
        -- Optional: Backfill with a default user if needed, or leave null for now
        -- UPDATE collections SET created_by = (SELECT id FROM profiles LIMIT 1) WHERE created_by IS NULL;
    END IF;

    -- 2. Handle 'cover_image_url' -> 'featured_image_url' rename
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'collections' 
        AND column_name = 'cover_image_url'
    ) THEN
        ALTER TABLE collections 
        RENAME COLUMN cover_image_url TO featured_image_url;
    ELSIF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'collections' 
        AND column_name = 'featured_image_url'
    ) THEN
        ALTER TABLE collections 
        ADD COLUMN featured_image_url TEXT;
    END IF;

END $$;
