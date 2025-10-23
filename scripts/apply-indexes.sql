-- Quick Index Application Script
-- Copy and paste this into Supabase SQL Editor

-- ==========================================
-- POSTS TABLE (Feed optimization)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_posts_published_created_at
ON posts (is_published, created_at DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_posts_published_likes_count
ON posts (is_published, likes_count DESC) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_journey_id ON posts (journey_id);

-- ==========================================
-- READING_JOURNEYS TABLE (Library optimization)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_reading_journeys_user_status_started
ON reading_journeys (user_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_reading_journeys_category
ON reading_journeys (book_category) WHERE book_category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reading_journeys_isbn
ON reading_journeys (book_isbn) WHERE book_isbn IS NOT NULL;

-- ==========================================
-- READING_LOGS TABLE (Journey detail optimization)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_reading_logs_journey_id_version
ON reading_logs (journey_id, version);

CREATE INDEX IF NOT EXISTS idx_reading_logs_music_track_id
ON reading_logs (music_track_id) WHERE music_track_id IS NOT NULL;

-- ==========================================
-- MUSIC_TRACKS TABLE (Polling optimization)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_music_tracks_status_created
ON music_tracks (status, created_at)
WHERE status IN ('pending', 'generating');

CREATE INDEX IF NOT EXISTS idx_music_tracks_mureka_task_id
ON music_tracks (mureka_task_id) WHERE mureka_task_id IS NOT NULL;

-- ==========================================
-- SOCIAL FEATURES (N+1 elimination)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes (post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_user ON bookmarks (post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments (post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_created ON likes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON bookmarks (user_id, created_at DESC);

-- ==========================================
-- EMOTION TAGS (Log emotions optimization)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_log_emotions_log_id ON log_emotions (log_id);
CREATE INDEX IF NOT EXISTS idx_log_emotions_emotion_tag_id ON log_emotions (emotion_tag_id);
CREATE INDEX IF NOT EXISTS idx_log_emotions_log_emotion ON log_emotions (log_id, emotion_tag_id);

-- ==========================================
-- USERS TABLE (Profile lookups)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users (nickname) WHERE nickname IS NOT NULL;

-- ==========================================
-- STATISTICS OPTIMIZATION INDEXES
-- ==========================================

-- User journey statistics (GET /api/user/stats)
-- Covers: COUNT by user_id, status filtering
CREATE INDEX IF NOT EXISTS idx_reading_journeys_user_stats
ON reading_journeys (user_id, status)
INCLUDE (book_category, rating)
WHERE status IS NOT NULL;

-- Music tracks count by user (via reading_logs)
-- Covers: COUNT of music_track_id per journey
CREATE INDEX IF NOT EXISTS idx_reading_logs_stats
ON reading_logs (journey_id)
INCLUDE (music_track_id)
WHERE music_track_id IS NOT NULL;

-- Posts count by user
-- Covers: COUNT by user_id with is_published filter
CREATE INDEX IF NOT EXISTS idx_posts_user_stats
ON posts (user_id, is_published);

-- Likes count by post (aggregate statistics)
-- Covers: COUNT GROUP BY post_id
CREATE INDEX IF NOT EXISTS idx_likes_post_stats
ON likes (post_id);

-- Comments count by post (aggregate statistics)
-- Covers: COUNT GROUP BY post_id
CREATE INDEX IF NOT EXISTS idx_comments_post_stats
ON comments (post_id);

-- Bookmarks count by post (aggregate statistics)
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_stats
ON bookmarks (post_id);

-- Same book posts count (ISBN-based statistics)
CREATE INDEX IF NOT EXISTS idx_reading_journeys_isbn_stats
ON reading_journeys (book_isbn)
WHERE book_isbn IS NOT NULL AND status = 'completed';

-- ==========================================
-- VERIFICATION
-- ==========================================
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(('public.' || indexname)::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected result: 29 indexes (22 base + 7 statistics)
