-- =====================================================
-- Admin Search RPC
-- =====================================================
-- Description: Allows admins to search ALL posts (drafts, etc.)
--              bypassing standard RLS row filters, but strictly
--              enforcing admin/editor role check.
-- =====================================================

create or replace function public.search_admin_posts(search_term text)
returns table (
  id uuid,
  title text,
  status text,
  published_at timestamptz
) 
language plpgsql
security definer -- Bypass RLS
set search_path = ''
as $$
begin
  -- 1. Security Check: Must be Admin or Editor
  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'editor')
  ) then
    raise exception 'Access denied: User is not an admin or editor.';
  end if;

  -- 2. Perform Search
  return query
  select 
    p.id,
    p.title,
    p.status::text,
    p.published_at
  from public.posts p
  where 
    p.title ilike '%' || search_term || '%'
  order by 
    case when p.title ilike search_term || '%' then 0 else 1 end, -- Exact start matches first
    p.published_at desc nulls last
  limit 20;
end;
$$;
