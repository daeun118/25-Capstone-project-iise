-- Fix RLS policy for reading_logs table to allow access for public posts

-- First, check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'reading_logs';

-- Create a new policy to allow reading logs for journeys with published posts
-- This allows anyone to read reading_logs if the journey has a published post
CREATE POLICY "reading_logs_public_posts_select" 
ON reading_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM posts 
    WHERE posts.journey_id = reading_logs.journey_id 
    AND posts.is_published = true
  )
);

-- Alternative: If you also need to check music_tracks relationship
-- CREATE POLICY "reading_logs_with_music_public_posts_select" 
-- ON reading_logs 
-- FOR SELECT 
-- USING (
--   music_track_id IS NOT NULL
--   AND EXISTS (
--     SELECT 1 
--     FROM posts 
--     WHERE posts.journey_id = reading_logs.journey_id 
--     AND posts.is_published = true
--   )
-- );