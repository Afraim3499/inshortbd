-- Add city column to analytics_sessions table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'city') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN city TEXT; 
    END IF; 
END $$;
