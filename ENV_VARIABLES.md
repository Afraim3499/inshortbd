# Environment Variables Configuration

## Required Variables

These environment variables **must** be set for the application to function:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Optional Variables

These can be configured but have defaults:

```bash
# Site URL for RSS, sitemap, and structured data
NEXT_PUBLIC_SITE_URL=https://inshortbd.com

# Service role key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cron job authentication secret (recommended for production)
CRON_SECRET=your_secure_random_string
```

## Setup Instructions

1. Copy `.env.local.example` to `.env.local` (if provided)
2. Or create `.env.local` file in the project root
3. Add all required variables
4. For production, set `NODE_ENV=production`

## Validation

The application will validate required environment variables on startup. If any are missing, it will fail fast with a clear error message.

## Security Notes

- Never commit `.env.local` to version control
- Use strong, random values for `CRON_SECRET`
- Keep `SUPABASE_SERVICE_ROLE_KEY` secure (server-side only)






