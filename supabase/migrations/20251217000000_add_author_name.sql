-- Add author_name column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS author_name text;

-- Comment to document purpose
COMMENT ON COLUMN posts.author_name IS 'Manual override for author display name. If null, use profile name.';
