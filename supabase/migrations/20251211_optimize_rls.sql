-- Optimization: Fix "Auth RLS Initialization Plan" and "Multiple Permissive Policies" warnings
-- This script optimizes RLS policies by:
-- 1. Using a helper function `is_admin_or_editor()` that wraps `auth.uid()` in a sub-select (InitPlan).
-- 2. Wrapping `auth.uid()` in sub-selects for all user-based policies.
-- 3. Restricting Admin policies to `authenticated` role to reduce scope.

-- 1. Helper function (Idempotent creation)
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

-- 2. MAIN CONTENT TABLES

-- Posts
drop policy if exists "Admins can do everything" on public.posts;
create policy "Admins can do everything"
  on public.posts for all
  to authenticated
  using ( is_admin_or_editor() );

-- Post Revisions
drop policy if exists "Admins and Editors can view revisions" on public.post_revisions;
create policy "Admins and Editors can view revisions"
  on public.post_revisions for select
  to authenticated
  using ( is_admin_or_editor() );

drop policy if exists "Admins and Editors can insert revisions" on public.post_revisions;
create policy "Admins and Editors can insert revisions"
  on public.post_revisions for insert
  to authenticated
  with check ( is_admin_or_editor() );

-- Post Assignments
drop policy if exists "Admins and editors can manage assignments" on public.post_assignments;
create policy "Admins and editors can manage assignments"
  on public.post_assignments for all
  to authenticated
  using ( is_admin_or_editor() );

drop policy if exists "Users can view own assignments" on public.post_assignments;
create policy "Users can view own assignments"
  on public.post_assignments for select
  to authenticated
  using ( assigned_to = (select auth.uid()) );

-- Post Comments
drop policy if exists "Users can create comments" on public.post_comments;
create policy "Users can create comments"
  on public.post_comments for insert
  to authenticated
  with check ( user_id = (select auth.uid()) );

drop policy if exists "Users can update own comments or admins all" on public.post_comments;
create policy "Users can update own comments or admins all"
  on public.post_comments for update
  to authenticated
  using ( user_id = (select auth.uid()) or is_admin_or_editor() );

drop policy if exists "Users can delete own comments or admins all" on public.post_comments;
create policy "Users can delete own comments or admins all"
  on public.post_comments for delete
  to authenticated
  using ( user_id = (select auth.uid()) or is_admin_or_editor() );

-- Comments (Legacy/Generic)
-- Fixing overlap: Admins moderate vs Users update/delete
drop policy if exists "Admins can moderate comments" on public.comments;
create policy "Admins can moderate comments"
  on public.comments for all
  to authenticated
  using ( is_admin_or_editor() );

drop policy if exists "Authenticated users can create comments" on public.comments;
create policy "Authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check ( user_id = (select auth.uid()) );

drop policy if exists "Users can update own pending comments" on public.comments;
create policy "Users can update own pending comments"
  on public.comments for update
  to authenticated
  using ( user_id = (select auth.uid()) and status = 'pending' );

drop policy if exists "Users can delete own comments or admins all" on public.comments;
create policy "Users can delete own comments or admins all"
  on public.comments for delete
  to authenticated
  using ( user_id = (select auth.uid()) or is_admin_or_editor() );


-- Collections
-- Collections
drop policy if exists "Authenticated users can create collections" on public.collections;
create policy "Authenticated users can create collections"
  on public.collections for insert
  to authenticated
  with check ( created_by = (select auth.uid()) );

drop policy if exists "Users can update own collections or admins all" on public.collections;
create policy "Users can update own collections or admins all"
  on public.collections for update
  to authenticated
  using ( created_by = (select auth.uid()) or is_admin_or_editor() );

drop policy if exists "Users can delete own collections or admins all" on public.collections;
create policy "Users can delete own collections or admins all"
  on public.collections for delete
  to authenticated
  using ( created_by = (select auth.uid()) or is_admin_or_editor() );

-- Collection Posts
drop policy if exists "Admins and editors can manage collection posts" on public.collection_posts;
create policy "Admins and editors can manage collection posts"
  on public.collection_posts for all
  to authenticated
  using ( is_admin_or_editor() );

-- 4. NEWSLETTER & SOCIAL

-- Newsletter Subscribers
drop policy if exists "Admins can view subscribers" on public.newsletter_subscribers;
drop policy if exists "Admins/Editors can manage subscribers" on public.newsletter_subscribers;
create policy "Admins/Editors can manage subscribers"
  on public.newsletter_subscribers for all
  to authenticated
  using ( is_admin_or_editor() );

-- Newsletter Campaigns
drop policy if exists "Admins can manage campaigns" on public.newsletter_campaigns;
drop policy if exists "Admins/Editors can manage campaigns" on public.newsletter_campaigns;
create policy "Admins/Editors can manage campaigns"
  on public.newsletter_campaigns for all
  to authenticated
  using ( is_admin_or_editor() );

-- Newsletter Sends
drop policy if exists "Admins can view sends" on public.newsletter_sends;
drop policy if exists "Admins/Editors can manage sends" on public.newsletter_sends;
create policy "Admins/Editors can manage sends"
  on public.newsletter_sends for all
  to authenticated
  using ( is_admin_or_editor() );

-- Social Accounts
drop policy if exists "Admins can manage social accounts" on public.social_accounts;
drop policy if exists "Admins/Editors can manage social accounts" on public.social_accounts;
create policy "Admins/Editors can manage social accounts"
  on public.social_accounts for all
  to authenticated
  using ( is_admin_or_editor() );

-- Social Posts
drop policy if exists "Admins can manage social posts" on public.social_posts;
drop policy if exists "Admins/Editors can manage social posts" on public.social_posts;
create policy "Admins/Editors can manage social posts"
  on public.social_posts for all
  to authenticated
  using ( is_admin_or_editor() );

-- Social Tasks
drop policy if exists "Admins can manage all social tasks" on public.social_tasks;
drop policy if exists "Admins/Editors can manage all social tasks" on public.social_tasks;
create policy "Admins/Editors can manage all social tasks"
  on public.social_tasks for all
  to authenticated
  using ( is_admin_or_editor() );

drop policy if exists "Users can view assigned tasks" on public.social_tasks;
create policy "Users can view assigned tasks"
  on public.social_tasks for select
  to authenticated
  using ( assigned_to = (select auth.uid()) );

drop policy if exists "Users can update assigned tasks" on public.social_tasks;
create policy "Users can update assigned tasks"
  on public.social_tasks for update
  to authenticated
  using ( assigned_to = (select auth.uid()) );

-- Social Task Completions
drop policy if exists "Admins can manage completions" on public.social_task_completions;
drop policy if exists "Admins/Editors can manage completions" on public.social_task_completions;
create policy "Admins/Editors can manage completions"
  on public.social_task_completions for all
  to authenticated
  using ( is_admin_or_editor() );

drop policy if exists "Users can create completions" on public.social_task_completions;
create policy "Users can create completions"
  on public.social_task_completions for insert
  to authenticated
  with check ( completed_by = (select auth.uid()) );

drop policy if exists "Users can view own completions" on public.social_task_completions;
create policy "Users can view own completions"
  on public.social_task_completions for select
  to authenticated
  using ( completed_by = (select auth.uid()) );

-- 5. ANALYTICS & SEO

-- SEO Analytics
drop policy if exists "Admins can manage seo analytics" on public.seo_analytics;
drop policy if exists "Admins/Editors can manage seo analytics" on public.seo_analytics;
create policy "Admins/Editors can manage seo analytics"
  on public.seo_analytics for all
  to authenticated
  using ( is_admin_or_editor() );

-- Keyword Tracking
drop policy if exists "Admins can manage keyword tracking" on public.keyword_tracking;
drop policy if exists "Admins/Editors can manage keyword tracking" on public.keyword_tracking;
create policy "Admins/Editors can manage keyword tracking"
  on public.keyword_tracking for all
  to authenticated
  using ( is_admin_or_editor() );

-- Analytics Sessions
drop policy if exists "Admins can read all sessions" on public.analytics_sessions;
drop policy if exists "Admins/Editors can manage analytics sessions" on public.analytics_sessions;
create policy "Admins/Editors can manage analytics sessions"
  on public.analytics_sessions for all
  to authenticated
  using ( is_admin_or_editor() );

-- Analytics Events
drop policy if exists "Admins can read all events" on public.analytics_events;
drop policy if exists "Admins/Editors can manage analytics events" on public.analytics_events;
create policy "Admins/Editors can manage analytics events"
  on public.analytics_events for all
  to authenticated
  using ( is_admin_or_editor() );

-- 6. MEDIA & SYSTEM

-- Media Files
drop policy if exists "Users can update own or admins all media" on public.media_files;
create policy "Users can update own or admins all media"
  on public.media_files for update
  to authenticated
  using ( uploaded_by = (select auth.uid()) or is_admin_or_editor() );

drop policy if exists "Users can delete own or admins all media" on public.media_files;
create policy "Users can delete own or admins all media"
  on public.media_files for delete
  to authenticated
  using ( uploaded_by = (select auth.uid()) or is_admin_or_editor() );

-- Editing Locks
drop policy if exists "Admins can delete any lock" on public.editing_locks;
create policy "Admins can delete any lock"
  on public.editing_locks for delete
  to authenticated
  using ( is_admin_or_editor() );

drop policy if exists "Users can create locks" on public.editing_locks;
create policy "Users can create locks"
  on public.editing_locks for insert
  to authenticated
  with check ( user_id = (select auth.uid()) );

drop policy if exists "Users can extend own locks" on public.editing_locks;
create policy "Users can extend own locks"
  on public.editing_locks for update
  to authenticated
  using ( user_id = (select auth.uid()) );

drop policy if exists "Users can release own locks" on public.editing_locks;
create policy "Users can release own locks"
  on public.editing_locks for delete
  to authenticated
  using ( user_id = (select auth.uid()) );

-- Profiles (Self Read)
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using ( id = (select auth.uid()) );
