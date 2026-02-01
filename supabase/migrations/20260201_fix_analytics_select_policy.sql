-- Fix RLS: Allow public SELECT on analytics_sessions
-- Required because the API uses .insert().select() which fails without SELECT permissions

CREATE POLICY "Allow public read access for analytics_sessions"
ON public.analytics_sessions
FOR SELECT
TO public
USING (true);

-- Ensure permission is granted
GRANT SELECT ON public.analytics_sessions TO anon;
GRANT SELECT ON public.analytics_sessions TO authenticated;
GRANT SELECT ON public.analytics_sessions TO service_role;
