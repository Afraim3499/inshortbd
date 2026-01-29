-- Create Analytics Sessions Table
create table if not exists public.analytics_sessions (
    id uuid default gen_random_uuid() primary key,
    session_id text not null,
    user_id uuid references auth.users(id),
    post_id text not null,
    device_type text,
    browser text,
    browser_version text,
    os text,
    os_version text,
    country text,
    city text,
    referrer text,
    traffic_source text check (traffic_source in ('direct', 'search', 'social', 'referral', 'email', 'other')),
    utm_source text,
    utm_medium text,
    utm_campaign text,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    ended_at timestamp with time zone,
    duration_seconds integer,
    page_views integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analytics_sessions enable row level security;

-- Create Policy: Allow public to insert (for tracking)
create policy "Allow public insert to analytics_sessions"
on public.analytics_sessions
for insert
to public
with check (true);

-- Create Policy: Allow public to update own session (by session_id)
create policy "Allow public update by session_id"
on public.analytics_sessions
for update
to public
using (session_id = current_setting('request.headers')::json->>'x-session-id')
with check (session_id = current_setting('request.headers')::json->>'x-session-id');

-- Note: The logic in the API route uses `select` and `update` via Service Role key usually,
-- but having RLS for public logic helps.
-- Actually the API route `src/app/api/analytics/session/route.ts` uses `createClient` from `@/utils/supabase/server`.
-- If that uses Service Role, RLS is bypassed. If it uses Anon key, it needs RLS.
-- To be safe, adding basic RLS.

-- Grant access
grant all on public.analytics_sessions to postgres;
grant all on public.analytics_sessions to anon;
grant all on public.analytics_sessions to authenticated;
grant all on public.analytics_sessions to service_role;
