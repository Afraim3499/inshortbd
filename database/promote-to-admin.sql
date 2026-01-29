-- =====================================================
-- PROMOTE USER TO ADMIN (ROBUST VERSION)
-- =====================================================
-- USAGE: 
-- 1. Copy this entire script.
-- 2. Go to Supabase Dashboard -> SQL Editor.
-- 3. Paste and RUN.
-- 4. Logout and Login again.
-- =====================================================

DO $$
DECLARE
    target_email TEXT := 'afraim.afraim99@gmail.com'; -- Already updated with your email
    target_user_id UUID;
BEGIN
    -- 1. Retrieve User ID
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User % not found. Please Sign Up first!', target_email;
    END IF;

    -- 2. Ensure Profiles Table Exists (Safety Check)
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT,
        full_name TEXT,
        role TEXT DEFAULT 'reader' CHECK (role IN ('admin', 'editor', 'reader')),
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Enable RLS (Security)
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- 4. Create Policy (If not exists - simplified for admin fix)
    -- Allow users to read their own profile
    BEGIN
        CREATE POLICY "Users can read own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    -- 5. Insert or Update Profile to ADMIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (target_user_id, target_email, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        email = EXCLUDED.email; -- Ensure sync

    RAISE NOTICE 'SUCCESS: % is now an ADMIN.', target_email;
END $$;
