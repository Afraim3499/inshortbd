-- Delete ads with the broken image link
DELETE FROM public.ads 
WHERE image_url LIKE '%premium-sub.jpg%';
