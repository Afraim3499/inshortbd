# Quick Start: Running Migrations

## Recommended: Use Safe Versions

To avoid warning dialogs, use these files:

1. **`newsletter-migration-safe.sql`** - Newsletter system tables
2. **`social-media-migration-safe.sql`** - Social media tables

## Steps

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste `newsletter-migration-safe.sql`
3. Click "Run" (no warning will appear)
4. Repeat for `social-media-migration-safe.sql`

## What Gets Created

### Newsletter Migration Creates:
- ✅ `newsletter_subscribers` - Email subscribers
- ✅ `newsletter_campaigns` - Email campaigns
- ✅ `newsletter_sends` - Individual email tracking

### Social Media Migration Creates:
- ✅ `social_accounts` - Connected social accounts
- ✅ `social_posts` - Posted content tracking

## Verification

After running, check the verification queries at the bottom of each script to confirm tables were created.

---

**Note:** If you see a warning, you can safely click "Run this query" - the scripts are safe!






