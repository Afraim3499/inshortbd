-- Optimization: Add Missing Indexes on Foreign Keys
-- This script addresses "Unindexed foreign keys" warnings to improve join performance.

-- 1. Analytics Sessions
create index if not exists idx_analytics_sessions_user_id on public.analytics_sessions(user_id);

-- 2. Editing Locks
create index if not exists idx_editing_locks_user_id on public.editing_locks(user_id);

-- 3. Post Revisions
create index if not exists idx_post_revisions_post_id on public.post_revisions(post_id);
create index if not exists idx_post_revisions_author_id on public.post_revisions(author_id);

-- 4. Posts
create index if not exists idx_posts_author_id on public.posts(author_id);

-- 5. Site Config
create index if not exists idx_site_config_hero_post_id on public.site_config(hero_post_id);

-- 6. Social Task Completions
create index if not exists idx_social_task_completions_verified_by on public.social_task_completions(verified_by);

-- 7. Social Tasks
create index if not exists idx_social_tasks_assigned_by on public.social_tasks(assigned_by);
