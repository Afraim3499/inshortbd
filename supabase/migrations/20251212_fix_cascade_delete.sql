-- Fix: Enable CASCADE DELETE for posts
-- This allows deleting posts even when they have related records

-- Post Comments: Delete comments when post is deleted
ALTER TABLE public.post_comments 
DROP CONSTRAINT IF EXISTS post_comments_post_id_fkey;

ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id)
ON DELETE CASCADE;

-- Post Revisions: Delete revisions when post is deleted
ALTER TABLE public.post_revisions
DROP CONSTRAINT IF EXISTS post_revisions_post_id_fkey;

ALTER TABLE public.post_revisions
ADD CONSTRAINT post_revisions_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id)
ON DELETE CASCADE;

-- Post Assignments: Delete assignments when post is deleted
ALTER TABLE public.post_assignments
DROP CONSTRAINT IF EXISTS post_assignments_post_id_fkey;

ALTER TABLE public.post_assignments
ADD CONSTRAINT post_assignments_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id)
ON DELETE CASCADE;

-- Collection Posts: Delete from collections when post is deleted
ALTER TABLE public.collection_posts
DROP CONSTRAINT IF EXISTS collection_posts_post_id_fkey;

ALTER TABLE public.collection_posts
ADD CONSTRAINT collection_posts_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id)
ON DELETE CASCADE;

-- SEO Analytics: Delete analytics when post is deleted
ALTER TABLE public.seo_analytics
DROP CONSTRAINT IF EXISTS seo_analytics_post_id_fkey;

ALTER TABLE public.seo_analytics
ADD CONSTRAINT seo_analytics_post_id_fkey
FOREIGN KEY (post_id) REFERENCES public.posts(id)
ON DELETE CASCADE;
