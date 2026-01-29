-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active ads (for the website)
CREATE POLICY "Public can view active ads" 
ON public.ads FOR SELECT 
USING (true);

-- Allow authenticated users (Admins) to do everything
CREATE POLICY "Admins can manage ads" 
ON public.ads FOR ALL 
USING (auth.role() = 'authenticated');
