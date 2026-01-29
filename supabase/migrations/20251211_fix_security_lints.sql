-- Fix RLS Disabled Errors
-- The following tables were flagged as public but missing RLS. 
-- We will enable RLS and add standard policies (Public Read, Admin/Editor Write).

-- 1. Billionaires
alter table public.billionaires enable row level security;

create policy "Public can view billionaires"
  on public.billionaires for select
  using (true);

create policy "Admins/Editors can manage billionaires"
  on public.billionaires for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- 2. Billionaire Holdings
alter table public.billionaire_holdings enable row level security;

create policy "Public can view billionaire_holdings"
  on public.billionaire_holdings for select
  using (true);

create policy "Admins/Editors can manage billionaire_holdings"
  on public.billionaire_holdings for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- 3. Companies
alter table public.companies enable row level security;

create policy "Public can view companies"
  on public.companies for select
  using (true);

create policy "Admins/Editors can manage companies"
  on public.companies for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- 4. PR Segments
alter table public.pr_segments enable row level security;

create policy "Public can view pr_segments"
  on public.pr_segments for select
  using (true);

create policy "Admins/Editors can manage pr_segments"
  on public.pr_segments for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- 5. Startup Stories
alter table public.startup_stories enable row level security;

create policy "Public can view startup_stories"
  on public.startup_stories for select
  using (true);

create policy "Admins/Editors can manage startup_stories"
  on public.startup_stories for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

-- Fix Function Search Path Mutable Error
-- The function update_updated_at_column needs a fixed search_path for security.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = '' 
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;
