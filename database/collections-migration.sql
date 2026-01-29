-- =====================================================
-- Collections Migration
-- =====================================================
-- Description: Adds collections and collection_posts
--              tables for grouping articles into
--              collections and series
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    featured_image_url TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create collection_posts junction table
CREATE TABLE IF NOT EXISTS collection_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(collection_id, post_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_created_by ON collections(created_by);
CREATE INDEX IF NOT EXISTS idx_collection_posts_collection_id ON collection_posts(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_posts_post_id ON collection_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_collection_posts_order ON collection_posts(collection_id, order_index);

-- Step 4: Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger for collections updated_at
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_posts ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
DO $$
BEGIN
    -- Collections: Public read (for published collections), authenticated create/edit
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Public can read collections'
    ) THEN
        CREATE POLICY "Public can read collections"
            ON collections
            FOR SELECT
            TO anon, authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Authenticated users can create collections'
    ) THEN
        CREATE POLICY "Authenticated users can create collections"
            ON collections
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Users can update own collections or admins all'
    ) THEN
        CREATE POLICY "Users can update own collections or admins all"
            ON collections
            FOR UPDATE
            TO authenticated
            USING (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collections' 
        AND policyname = 'Users can delete own collections or admins all'
    ) THEN
        CREATE POLICY "Users can delete own collections or admins all"
            ON collections
            FOR DELETE
            TO authenticated
            USING (
                auth.uid() = created_by OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;

    -- Collection Posts: Public read, authenticated manage
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collection_posts' 
        AND policyname = 'Public can read collection posts'
    ) THEN
        CREATE POLICY "Public can read collection posts"
            ON collection_posts
            FOR SELECT
            TO anon, authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'collection_posts' 
        AND policyname = 'Admins and editors can manage collection posts'
    ) THEN
        CREATE POLICY "Admins and editors can manage collection posts"
            ON collection_posts
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role IN ('admin', 'editor')
                )
            );
    END IF;
END $$;

-- Step 8: Add comments for documentation
COMMENT ON TABLE collections IS 'Article collections and series metadata';
COMMENT ON TABLE collection_posts IS 'Junction table linking posts to collections with ordering';

COMMENT ON COLUMN collections.slug IS 'URL-friendly identifier for collection pages';
COMMENT ON COLUMN collection_posts.order_index IS 'Order of post within collection (for series)';

-- =====================================================
-- Migration Complete!
-- =====================================================






