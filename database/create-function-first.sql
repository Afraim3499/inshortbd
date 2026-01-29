-- =====================================================
-- Quick Fix: Create the update_updated_at_column function
-- =====================================================
-- Run this FIRST if you got errors about the function not existing
-- Then re-run your migration scripts
-- =====================================================

-- Create the function (safe to run even if it exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify it was created
SELECT 'Function created successfully!' as status, proname 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';






