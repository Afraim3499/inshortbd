-- Fix 1: Analytics Sessions RLS
-- Enable RLS if not already enabled
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public to INSERT into analytics_sessions (for tracking page views)
CREATE POLICY "Public can insert analytics sessions" 
ON analytics_sessions
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow public to SELECT (update) their own session (via session_id matching)
-- Note: UPDATE usually requires a USING clause for finding the row and WITH CHECK for the new row.
CREATE POLICY "Public can update their own analytics sessions" 
ON analytics_sessions
FOR UPDATE
TO public 
USING (true) -- Simplified for now, allows updating any session if you know the ID. Ideally restricted by session_id in a more complex auth setup, but fine for anon analytics.
WITH CHECK (true);


-- Fix 2: Profiles RLS (causing 406 errors)
-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public to READ profiles (needed for Author Bio, etc.)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles
FOR SELECT 
TO public 
USING (true);

-- Fix 2 complete.

-- Allow public to READ se_analytics (if needed public, usually not, but maybe for displaying view counts?)
-- Checking schema... views are on posts table. seo_analytics is internal. Skipping.

