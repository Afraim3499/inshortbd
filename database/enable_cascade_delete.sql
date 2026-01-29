-- 1. Drop the strict constraint that is blocking us
ALTER TABLE "analytics_events"
DROP CONSTRAINT "analytics_events_post_id_fkey";

-- 2. Add the new "Mafia" constraint (Cascade Delete)
ALTER TABLE "analytics_events"
ADD CONSTRAINT "analytics_events_post_id_fkey"
FOREIGN KEY ("post_id")
REFERENCES "posts"("id")
ON DELETE CASCADE;
