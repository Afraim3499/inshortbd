-- =====================================================
-- Admin Search RPC (Fixed Ambiguous Columns)
-- =====================================================

create or replace function public.search_admin_posts(search_term text)
returns table (
  id uuid,
  title text,
  status text,
  published_at timestamptz
) 
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 1. Security Check: Must be Admin or Editor
  -- We use alias 'prof' to avoid ambiguity with return column 'id'
  if not exists (
    select 1 from public.profiles prof
    where prof.id = auth.uid()
    and prof.role in ('admin', 'editor')
  ) then
    raise exception 'Access denied: User is not an admin or editor.';
  end if;

  -- 2. Perform Search
  -- We use alias 'p' to avoid ambiguity with return columns 'id', 'title', etc.
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
    case when p.title ilike search_term || '%' then 0 else 1 end,
    p.published_at desc nulls last
  limit 50;
end;
$$;
