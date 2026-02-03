-- =====================================================
-- Fix RLS for Collection Posts
-- =====================================================

-- 1. Ensure the helper function exists and is correct
create or replace function public.is_admin_or_editor()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role in ('admin', 'editor')
  );
$$;

-- 2. Drop existing policies on collection_posts to avoid conflicts
drop policy if exists "Admins and editors can manage collection posts" on public.collection_posts;
drop policy if exists "Admins/Editors manage collection posts" on public.collection_posts;

-- 3. Create explicit policies
create policy "Admins/Editors manage collection posts"
  on public.collection_posts
  for all
  to authenticated
  using ( is_admin_or_editor() )
  with check ( is_admin_or_editor() );

create policy "Public can view collection posts"
  on public.collection_posts
  for select
  to anon, authenticated
  using ( true );

-- 4. Grant permissions (just in case)
grant all on public.collection_posts to authenticated;
grant all on public.collection_posts to service_role;
