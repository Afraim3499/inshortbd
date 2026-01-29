# Newsletter System Migration Guide

## Overview

This migration creates the database tables required for the newsletter system, including subscribers, campaigns, and send tracking.

## Files

- `database/newsletter-migration.sql` - Main migration script

## How to Run

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `newsletter-migration.sql`
4. Paste into the SQL Editor
5. Click "Run" or press `Ctrl+Enter` / `Cmd+Enter`
6. Wait for confirmation

## What This Migration Creates

### Tables

1. **newsletter_subscribers**
   - Stores subscriber email, name, status
   - Tracks subscription/unsubscription dates
   - Includes unsubscribe tokens for security

2. **newsletter_campaigns**
   - Tracks email campaigns
   - Stores subject, content, type
   - Tracks send statistics (sent, opened, clicked)

3. **newsletter_sends**
   - Individual email send tracking
   - Links campaigns to subscribers
   - Tracks open and click events

### Features

- Row Level Security (RLS) enabled
- Performance indexes on all tables
- Auto-updating timestamps
- Secure unsubscribe tokens

## Verification

After running the migration, verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'newsletter%';
```

You should see:
- newsletter_subscribers
- newsletter_campaigns
- newsletter_sends

## Next Steps

After running the migration:
1. Set `RESEND_API_KEY` environment variable
2. Test newsletter subscription on homepage
3. Test sending a campaign from admin

---

*Last Updated: December 2024*






