-- =====================================================
-- Collaboration System Migration
-- =====================================================
-- 1. Create editing_locks table
-- 2. Setup RLS for locks
-- 3. Add Realtime publication
-- =====================================================

-- 1. Create Locks Table
CREATE TABLE IF NOT EXISTS editing_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT, -- Cache for display (avatar/name fallback)
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL, -- Calculated by client/server (e.g. NOW() + 5 min)
    
    UNIQUE(post_id) -- Only one active lock per post
);

-- 2. Enable RLS
ALTER TABLE editing_locks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- READ: Everyone can see who has locked a post
DROP POLICY IF EXISTS "Everyone can view locks" ON editing_locks;
CREATE POLICY "Everyone can view locks" 
ON editing_locks FOR SELECT 
USING (true);

-- INSERT: User can create a lock if none exists
DROP POLICY IF EXISTS "Users can create locks" ON editing_locks;
CREATE POLICY "Users can create locks" 
ON editing_locks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: User can extend their OWN lock
DROP POLICY IF EXISTS "Users can extend own locks" ON editing_locks;
CREATE POLICY "Users can extend own locks" 
ON editing_locks FOR UPDATE 
USING (auth.uid() = user_id);

-- DELETE: User can release their OWN lock, or Admins can force release
DROP POLICY IF EXISTS "Users can release own locks" ON editing_locks;
CREATE POLICY "Users can release own locks" 
ON editing_locks FOR DELETE 
USING (auth.uid() = user_id);

-- Allow Admins to override locks (Force Unlock)
DROP POLICY IF EXISTS "Admins can delete any lock" ON editing_locks;
CREATE POLICY "Admins can delete any lock" 
ON editing_locks FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Enable Realtime for specific tables
-- 4. Enable Realtime for specific tables
-- This ensures 'editing_locks' changes are broadcast
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'editing_locks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE editing_locks;
  END IF;
END $$;

-- Ensure profiles are also visible for avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;

-- =====================================================
-- End Migration
-- =====================================================
