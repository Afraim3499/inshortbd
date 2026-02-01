-- Comprehensive repair for analytics_sessions table
-- Adds all potential missing columns that are used in the API route
DO $$ 
BEGIN 
    -- Traffic Source
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'traffic_source') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN traffic_source text check (traffic_source in ('direct', 'search', 'social', 'referral', 'email', 'other')); 
    END IF; 

    -- Referrer
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'referrer') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN referrer text; 
    END IF; 

    -- UTM params
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'utm_source') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN utm_source text; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'utm_medium') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN utm_medium text; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'utm_campaign') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN utm_campaign text; 
    END IF; 

    -- Location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'city') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN city text; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'country') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN country text; 
    END IF; 

    -- Device Info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'device_type') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN device_type text; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'browser') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN browser text; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'browser_version') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN browser_version text; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'os') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN os text; 
    END IF; 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_sessions' AND column_name = 'os_version') THEN 
        ALTER TABLE analytics_sessions ADD COLUMN os_version text; 
    END IF;

    -- Force schema cache reload (usually automatic, but changing comment triggers it sometimes)
    COMMENT ON TABLE analytics_sessions IS 'Analytics sessions table (Updated schema)';
END $$;
