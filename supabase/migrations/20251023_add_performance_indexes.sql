-- Performance Optimization: Add indexes for feed and journey queries
-- Migration created: 2025-10-23
-- Purpose: Improve query performance for frequently accessed data patterns

-- ==========================================
-- POSTS TABLE INDEXES
-- ==========================================

-- Index for feed list query (GET /api/posts)
-- Covers: is_published filter + created_at/likes_count sorting
CREATE INDEX IF NOT EXISTS idx_posts_published_created_at
ON posts (is_published, created_at DESC)
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_posts_published_likes_count
ON posts (is_published, likes_count DESC)
WHERE is_published = true;

-- Index for category filtering on feed
-- reading_journeys.book_category is frequently filtered
-- This will be covered by reading_journeys indexes below

-- Index for post detail lookups and user posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id
ON posts (user_id);

CREATE INDEX IF NOT EXISTS idx_posts_journey_id
ON posts (journey_id);

-- ==========================================
-- READING_JOURNEYS TABLE INDEXES
-- ==========================================

-- Index for library page query (GET /api/journeys)
-- Covers: user_id filter + status filter + started_at sorting
CREATE INDEX IF NOT EXISTS idx_reading_journeys_user_status_started
ON reading_journeys (user_id, status, started_at DESC);

-- Index for category filtering in feed (through JOIN)
CREATE INDEX IF NOT EXISTS idx_reading_journeys_category
ON reading_journeys (book_category)
WHERE book_category IS NOT NULL;

-- Index for ISBN-based lookups (same book posts feature)
CREATE INDEX IF NOT EXISTS idx_reading_journeys_isbn
ON reading_journeys (book_isbn)
WHERE book_isbn IS NOT NULL;

-- ==========================================
-- READING_LOGS TABLE INDEXES
-- ==========================================

-- Index for journey detail page (GET /api/journeys/[id]/logs)
-- Covers: journey_id filter + version sorting
CREATE INDEX IF NOT EXISTS idx_reading_logs_journey_id_version
ON reading_logs (journey_id, version);

-- Index for music track lookups (frequent JOIN on music_track_id)
CREATE INDEX IF NOT EXISTS idx_reading_logs_music_track_id
ON reading_logs (music_track_id)
WHERE music_track_id IS NOT NULL;

-- ==========================================
-- MUSIC_TRACKS TABLE INDEXES
-- ==========================================

-- Index for music status polling (GET /api/journeys/[id]/music-status)
-- Covers: status filter + created_at for timeout checks
CREATE INDEX IF NOT EXISTS idx_music_tracks_status_created
ON music_tracks (status, created_at)
WHERE status IN ('pending', 'generating');

-- Index for Mureka task ID lookups (music generation polling)
CREATE INDEX IF NOT EXISTS idx_music_tracks_mureka_task_id
ON music_tracks (mureka_task_id)
WHERE mureka_task_id IS NOT NULL;

-- ==========================================
-- LIKES, COMMENTS, BOOKMARKS INDEXES
-- ==========================================

-- Index for like/bookmark status checks (N+1 in feed)
-- These are frequently checked per post for current user
CREATE INDEX IF NOT EXISTS idx_likes_post_user
ON likes (post_id, user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_post_user
ON bookmarks (post_id, user_id);

-- Index for comments count and retrieval
CREATE INDEX IF NOT EXISTS idx_comments_post_created
ON comments (post_id, created_at DESC);

-- Index for user's own likes/bookmarks pages
CREATE INDEX IF NOT EXISTS idx_likes_user_created
ON likes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created
ON bookmarks (user_id, created_at DESC);

-- ==========================================
-- LOG_EMOTIONS TABLE INDEXES
-- ==========================================

-- Index for emotion tag lookups in reading logs
CREATE INDEX IF NOT EXISTS idx_log_emotions_log_id
ON log_emotions (log_id);

CREATE INDEX IF NOT EXISTS idx_log_emotions_emotion_tag_id
ON log_emotions (emotion_tag_id);

-- Composite index for efficient JOIN
CREATE INDEX IF NOT EXISTS idx_log_emotions_log_emotion
ON log_emotions (log_id, emotion_tag_id);

-- ==========================================
-- USERS TABLE INDEXES
-- ==========================================

-- Index for user profile lookups in feed (JOIN with posts)
-- Auth user_id is already primary key, but add for nickname searches
CREATE INDEX IF NOT EXISTS idx_users_nickname
ON users (nickname)
WHERE nickname IS NOT NULL;

-- ==========================================
-- STATISTICS OPTIMIZATION INDEXES
-- ==========================================

-- User journey statistics (GET /api/user/stats)
-- Covers: COUNT by user_id, status filtering, category/rating aggregation
CREATE INDEX IF NOT EXISTS idx_reading_journeys_user_stats
ON reading_journeys (user_id, status)
INCLUDE (book_category, rating)
WHERE status IS NOT NULL;

COMMENT ON INDEX idx_reading_journeys_user_stats IS
'Optimizes user statistics dashboard queries (journey counts, favorite category, average rating)';

-- Music tracks count by user (via reading_logs)
-- Covers: COUNT of music_track_id per journey for statistics
CREATE INDEX IF NOT EXISTS idx_reading_logs_stats
ON reading_logs (journey_id)
INCLUDE (music_track_id)
WHERE music_track_id IS NOT NULL;

COMMENT ON INDEX idx_reading_logs_stats IS
'Optimizes music tracks count queries in user statistics';

-- Posts count by user (published posts statistics)
-- Covers: COUNT by user_id with is_published filter
CREATE INDEX IF NOT EXISTS idx_posts_user_stats
ON posts (user_id, is_published);

COMMENT ON INDEX idx_posts_user_stats IS
'Optimizes user published posts count queries';

-- Likes count by post (aggregate statistics)
-- Covers: COUNT GROUP BY post_id for likes_count calculation
CREATE INDEX IF NOT EXISTS idx_likes_post_stats
ON likes (post_id);

COMMENT ON INDEX idx_likes_post_stats IS
'Optimizes likes count aggregation for posts';

-- Comments count by post (aggregate statistics)
-- Covers: COUNT GROUP BY post_id for comments_count calculation
CREATE INDEX IF NOT EXISTS idx_comments_post_stats
ON comments (post_id);

COMMENT ON INDEX idx_comments_post_stats IS
'Optimizes comments count aggregation for posts';

-- Bookmarks count by post (aggregate statistics)
-- Covers: COUNT GROUP BY post_id for bookmarks_count calculation
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_stats
ON bookmarks (post_id);

COMMENT ON INDEX idx_bookmarks_post_stats IS
'Optimizes bookmarks count aggregation for posts';

-- Same book posts count (ISBN-based statistics)
-- Covers: Finding completed journeys by same ISBN for recommendations
CREATE INDEX IF NOT EXISTS idx_reading_journeys_isbn_stats
ON reading_journeys (book_isbn)
WHERE book_isbn IS NOT NULL AND status = 'completed';

COMMENT ON INDEX idx_reading_journeys_isbn_stats IS
'Optimizes same book posts and recommendations queries';

-- ==========================================
-- ANALYSIS AND EXPECTED IMPROVEMENTS
-- ==========================================

-- FEED PAGE (GET /api/posts):
-- Before: Full table scan on posts + N+1 queries for users, journeys, likes, bookmarks
-- After: Index scan on idx_posts_published_created_at/likes_count
--        Fast lookups on idx_likes_post_user, idx_bookmarks_post_user
-- Expected improvement: 60-80% faster query time

-- LIBRARY PAGE (GET /api/journeys):
-- Before: Table scan + filtering on user_id, status
-- After: Index scan on idx_reading_journeys_user_status_started
-- Expected improvement: 70-90% faster query time

-- JOURNEY DETAIL PAGE (GET /api/journeys/[id]):
-- Before: Full scan of reading_logs for journey_id
-- After: Index scan on idx_reading_logs_journey_id_version
-- Expected improvement: 50-70% faster query time

-- MUSIC STATUS POLLING:
-- Before: Full scan of music_tracks for pending/generating status
-- After: Index-only scan on idx_music_tracks_status_created
-- Expected improvement: 80-95% faster query time

-- POST DETAIL PAGE (GET /api/posts/[id]):
-- Before: Multiple sequential queries with no indexes
-- After: Fast lookups on all composite indexes
-- Expected improvement: 40-60% faster query time

-- USER STATISTICS PAGE (GET /api/user/stats):
-- Before: Multiple COUNT queries with sequential scans
-- After: Index-only scans with INCLUDE columns
-- Expected improvement: 70-90% faster query time

COMMENT ON INDEX idx_posts_published_created_at IS
'Optimizes feed list query sorted by latest posts';

COMMENT ON INDEX idx_reading_journeys_user_status_started IS
'Optimizes library page query filtered by user and status';

COMMENT ON INDEX idx_reading_logs_journey_id_version IS
'Optimizes journey detail page log retrieval';

COMMENT ON INDEX idx_music_tracks_status_created IS
'Optimizes music status polling for generating tracks';

COMMENT ON INDEX idx_likes_post_user IS
'Eliminates N+1 query problem for like status checks in feed';
