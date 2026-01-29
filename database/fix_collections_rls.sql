-- Enable RLS on tables (if not already enabled)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_posts ENABLE ROW LEVEL SECURITY;

-- Policy for 'collections': Allow anyone to read (SELECT)
CREATE POLICY "Public collections are viewable by everyone" 
ON collections
FOR SELECT 
TO public 
USING (true);

-- Policy for 'collection_posts': Allow anyone to read (SELECT)
CREATE POLICY "Public collection posts are viewable by everyone" 
ON collection_posts
FOR SELECT 
TO public 
USING (true);

-- Optional: If you strictly want to restrict read access to only authorized users for 'draft' collections, you could add a condition,
-- but typically collections metadata is fine to be public, or you can add a 'public' boolean column later.
-- For now, this fixes the 404 error.
