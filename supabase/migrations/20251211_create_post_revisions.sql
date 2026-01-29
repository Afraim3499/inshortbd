-- Create post_revisions table for CMS history (Idempotent)
create table if not exists public.post_revisions (
  id uuid not null default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  content jsonb,
  title text,
  excerpt text,
  author_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint post_revisions_pkey primary key (id)
);

-- Enable RLS
alter table public.post_revisions enable row level security;

-- Safely recreate policies
drop policy if exists "Admins and Editors can view revisions" on public.post_revisions;
create policy "Admins and Editors can view revisions"
  on public.post_revisions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );

drop policy if exists "Admins and Editors can insert revisions" on public.post_revisions;
create policy "Admins and Editors can insert revisions"
  on public.post_revisions for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );
