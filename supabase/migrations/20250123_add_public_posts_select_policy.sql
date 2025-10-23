-- Migration: Add RLS policy for public posts viewing
-- Date: 2025-01-23
-- Purpose: Allow unauthenticated users to view published posts

-- Add policy for anyone to view published posts (including unauthenticated users)
CREATE POLICY "Anyone can view published posts"
ON posts FOR SELECT
USING (is_published = true);

-- Note: Existing "Users can view own posts" policy (auth.uid() = user_id) 
-- will continue to work for viewing own unpublished posts
-- The two policies work with OR logic - if either condition is true, access is granted
