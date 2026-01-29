alter table "public"."posts" add column "mentions" jsonb default '[]'::jsonb;
