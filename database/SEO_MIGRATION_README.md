# SEO Analytics Migration Guide

## Overview

This migration adds SEO tracking capabilities to Inshort platform, including:
- SEO score columns on posts table
- Historical SEO analytics tracking
- Keyword performance tracking

## Migration Steps

1. **Run the migration script in Supabase SQL Editor:**
   ```
   database/seo-migration.sql
   ```

2. **Verify the migration:**
   ```sql
   -- Check tables were created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('seo_analytics', 'keyword_tracking');

   -- Check columns were added to posts
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'posts' 
   AND column_name IN ('seo_score', 'readability_score', 'meta_description');
   ```

## What's Added

### Posts Table Columns
- `seo_score` (INTEGER) - Current SEO score (0-100)
- `readability_score` (INTEGER) - Current readability score (0-100)
- `meta_description` (TEXT) - SEO meta description

### New Tables

#### `seo_analytics`
Tracks historical SEO scores for articles over time.

**Columns:**
- `id` - UUID primary key
- `post_id` - Reference to article
- `seo_score` - SEO score (0-100)
- `readability_score` - Readability score (0-100)
- `word_count` - Word count at analysis time
- `keyword_density` - Keyword density percentage
- `analyzed_at` - When analysis was performed
- `created_at` - Record creation time

#### `keyword_tracking`
Tracks keyword performance and density.

**Columns:**
- `id` - UUID primary key
- `post_id` - Reference to article (optional)
- `keyword` - The keyword being tracked
- `density` - Keyword density percentage
- `position` - First occurrence position
- `count` - Number of occurrences
- `tracked_at` - Tracking timestamp
- `created_at` - Record creation time

## Indexes

All necessary indexes are created for optimal query performance:
- `idx_seo_analytics_post_id` - Fast post lookups
- `idx_seo_analytics_analyzed_at` - Time-based queries
- `idx_seo_analytics_seo_score` - Score-based filtering
- `idx_keyword_tracking_post_id` - Post keyword lookups
- `idx_keyword_tracking_keyword` - Keyword searches
- `idx_keyword_tracking_tracked_at` - Time-based queries
- `idx_posts_seo_score` - Post score filtering

## Security

- Row Level Security (RLS) is enabled on both tables
- Only admins and editors can manage SEO analytics
- Policies are automatically created by the migration

## Usage

After migration, the SEO system will:
1. Calculate SEO scores in the editor
2. Store scores in the `posts` table
3. Track historical changes in `seo_analytics`
4. Monitor keyword performance in `keyword_tracking`

The SEO panel in the editor provides real-time analysis, and the SEO dashboard shows overall health metrics.

## Next Steps

1. Run the migration script
2. Test SEO analysis in the editor
3. View SEO dashboard to see overall health
4. Historical tracking will begin automatically as articles are analyzed

---

**Migration Script:** `database/seo-migration.sql`  
**Safe Version:** Yes - uses conditional statements, no DROP statements







