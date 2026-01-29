# Enhanced Analytics Migration Guide

## Overview

This migration adds comprehensive analytics tracking to Inshort platform, including:
- Session tracking with device and location data
- Event tracking (page views, scroll depth, time on page)
- Traffic source analysis
- Device and browser analytics

## Migration Steps

1. **Run the migration script in Supabase SQL Editor:**
   ```
   database/analytics-migration.sql
   ```

2. **Verify the migration:**
   ```sql
   -- Check tables were created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('analytics_sessions', 'analytics_events');

   -- Check indexes were created
   SELECT indexname 
   FROM pg_indexes 
   WHERE tablename IN ('analytics_sessions', 'analytics_events');
   ```

## What's Added

### New Tables

#### `analytics_sessions`
Tracks user sessions with metadata including device, location, and traffic source.

**Columns:**
- `id` - UUID primary key
- `session_id` - Unique session identifier (client-generated)
- `user_id` - Reference to authenticated user (optional)
- `post_id` - Reference to article being viewed
- `device_type` - desktop, mobile, tablet, unknown
- `browser` - Browser name
- `browser_version` - Browser version
- `os` - Operating system
- `os_version` - OS version
- `country` - Country code/name
- `city` - City name
- `referrer` - Referrer URL
- `traffic_source` - direct, search, social, referral, email, other
- `utm_source`, `utm_medium`, `utm_campaign` - UTM parameters
- `started_at` - Session start time
- `ended_at` - Session end time (optional)
- `duration_seconds` - Total session duration
- `page_views` - Number of page views in session

#### `analytics_events`
Tracks individual analytics events.

**Columns:**
- `id` - UUID primary key
- `session_id` - Reference to session
- `post_id` - Reference to article
- `event_type` - page_view, scroll, time, exit, click
- `event_data` - JSONB with event-specific data
- `timestamp` - Event timestamp

## Indexes

All necessary indexes are created for optimal query performance:
- Session lookups by session_id, post_id, started_at
- Event lookups by session_id, post_id, event_type, timestamp
- Traffic source and device type queries

## RLS Policies

- **Public insert** - Anyone can create sessions and events (for tracking)
- **Admin/Editor read** - Only admins and editors can view analytics data

## Usage

Analytics tracking is automatically enabled on all article pages via the `ArticleTracker` component. No additional setup required after migration.

---

**Migration Created:** December 2024  
**Status:** Ready to deploy







