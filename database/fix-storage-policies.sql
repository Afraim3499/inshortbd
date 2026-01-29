-- Fix Storage Policies for 'news-images' bucket

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts (clean slate for this bucket)
DROP POLICY IF EXISTS "Give public access to news-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to news-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to news-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to news-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;

-- 3. Create new policies

-- Policy 1: Public Read Access (Everyone can view images)
CREATE POLICY "Give public access to news-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

-- Policy 2: Authenticated Uploads (Logged in users can upload)
CREATE POLICY "Allow authenticated uploads to news-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'news-images');

-- Policy 3: Authenticated Updates (Users can update their own files)
CREATE POLICY "Allow authenticated updates to news-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'news-images' AND owner = auth.uid());

-- Policy 4: Authenticated Deletes (Users can delete their own files)
CREATE POLICY "Allow authenticated deletes to news-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'news-images' AND owner = auth.uid());
