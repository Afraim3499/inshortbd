-- Add key_takeaways column to posts table
-- This column will store the extracted key points for AI summaries and 'Above the Fold' display
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS key_takeaways text[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN posts.key_takeaways IS 'Array of key takeaway strings for AI summaries and article header display';
