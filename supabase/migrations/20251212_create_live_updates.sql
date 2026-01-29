-- Create live_updates table
CREATE TABLE IF NOT EXISTS public.live_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone for active updates
CREATE POLICY "Allow public read access active updates" ON public.live_updates
    FOR SELECT
    USING (is_active = true);

-- Allow full access to admins/editors
CREATE POLICY "Allow admin/editor full access" ON public.live_updates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor')
        )
    );

-- Add simple realtime subscription if needed later (optional)
alter publication supabase_realtime add table live_updates;
