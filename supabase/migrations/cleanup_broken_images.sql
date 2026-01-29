-- Cleanup Script for Broken Featured Images in Posts
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Step 1: AUDIT - Find posts with potentially broken featured_image_url
-- These patterns indicate randomly generated filenames (likely failed uploads)
SELECT 
    id,
    title,
    featured_image_url,
    created_at
FROM posts
WHERE 
    featured_image_url IS NOT NULL
    AND (
        -- Random numeric filenames like "0.8923981204811747.jpg"
        featured_image_url ~ '^https?://.*[0-9]+\.[0-9]{10,}\.jpg$'
        OR featured_image_url ~ '^https?://.*[0-9]+\.[0-9]{10,}\.png$'
        -- Or filenames that are just numbers
        OR featured_image_url ~ '/[0-9]+(\.[0-9]+)?\.jpg$'
        OR featured_image_url ~ '/[0-9]+(\.[0-9]+)?\.png$'
    )
ORDER BY created_at DESC;

-- Step 2: CLEANUP - Set broken images to NULL (uncomment to run)
-- This will make articles use the fallback placeholder image
/*
UPDATE posts
SET featured_image_url = NULL
WHERE 
    featured_image_url IS NOT NULL
    AND (
        featured_image_url ~ '^https?://.*[0-9]+\.[0-9]{10,}\.jpg$'
        OR featured_image_url ~ '^https?://.*[0-9]+\.[0-9]{10,}\.png$'
        OR featured_image_url ~ '/[0-9]+(\.[0-9]+)?\.jpg$'
        OR featured_image_url ~ '/[0-9]+(\.[0-9]+)?\.png$'
    );
*/

-- Step 3: Verify cleanup (run after Step 2)
-- SELECT COUNT(*) as remaining_broken FROM posts WHERE featured_image_url ~ '[0-9]+\.[0-9]{10,}';
