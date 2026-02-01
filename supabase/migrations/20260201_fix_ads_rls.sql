-- Create ads table and fix RLS policies
-- The table was missing, causing "relation ads does not exist" errors.

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    image_url text NOT NULL,
    target_url text NOT NULL,
    placement text NOT NULL, -- e.g. 'homepage_sidebar', 'article_inline'
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access (SELECT)
-- This allows anyone (logged in or not) to see the ads
DROP POLICY IF EXISTS "Allow public read access for ads" ON public.ads;
CREATE POLICY "Allow public read access for ads"
ON public.ads
FOR SELECT
TO public
USING (true);

-- 4. Grant permissions
GRANT SELECT ON public.ads TO anon;
GRANT SELECT ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;

-- 5. Insert some sample data so the Ads don't look broken immediately (Optional, but helpful)
INSERT INTO public.ads (title, image_url, target_url, placement, active)
SELECT 'Sample Ad', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60', 'https://example.com', 'article_sidebar', true
WHERE NOT EXISTS (SELECT 1 FROM public.ads);
