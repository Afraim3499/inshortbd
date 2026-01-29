-- Create a function to safely delete posts with all related records
-- This function manually deletes related records before deleting the post

CREATE OR REPLACE FUNCTION public.delete_posts_cascade(post_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, null out any references in site_config (hero_post_id)
  UPDATE public.site_config SET hero_post_id = NULL WHERE hero_post_id = ANY(post_ids);
  
  -- Delete related records
  DELETE FROM public.post_comments WHERE post_id = ANY(post_ids);
  DELETE FROM public.post_revisions WHERE post_id = ANY(post_ids);
  DELETE FROM public.post_assignments WHERE post_id = ANY(post_ids);
  DELETE FROM public.collection_posts WHERE post_id = ANY(post_ids);
  DELETE FROM public.seo_analytics WHERE post_id = ANY(post_ids);
  
  -- Now delete the posts themselves
  DELETE FROM public.posts WHERE id = ANY(post_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_posts_cascade(uuid[]) TO authenticated;
