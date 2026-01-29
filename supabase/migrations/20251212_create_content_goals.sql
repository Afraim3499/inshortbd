-- Create a table to store content goals
CREATE TABLE IF NOT EXISTS public.content_goals (
    category TEXT PRIMARY KEY,
    target_count INTEGER NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.content_goals ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read goals
CREATE POLICY "Allow public read access" ON public.content_goals
    FOR SELECT USING (true);

-- Allow authenticated editors/admins to update goals
CREATE POLICY "Allow editors to update goals" ON public.content_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

-- Insert default values from our constants if they don't exist
INSERT INTO public.content_goals (category, target_count)
VALUES 
    ('Politics', 15),
    ('Tech', 12),
    ('Culture', 10),
    ('Business', 10),
    ('World', 8)
ON CONFLICT (category) DO NOTHING;
