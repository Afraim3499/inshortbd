-- Fix: Add RLS policies for site_config table
-- This allows admins/editors to read and update site configuration

-- Enable RLS on site_config if not already enabled
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read site config" ON public.site_config;
DROP POLICY IF EXISTS "Admins can update site config" ON public.site_config;
DROP POLICY IF EXISTS "Admins can insert site config" ON public.site_config;

-- Allow public read access (site config is public data like hero post, breaking news, etc.)
CREATE POLICY "Public can read site config"
  ON public.site_config
  FOR SELECT
  USING (true);

-- Allow admins/editors to update site config
CREATE POLICY "Admins can update site config"
  ON public.site_config
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_editor());

-- Allow admins/editors to insert site config (in case it doesn't exist)
CREATE POLICY "Admins can insert site config"
  ON public.site_config
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_editor());
