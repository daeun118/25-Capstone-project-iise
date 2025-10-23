-- Migration: Add RLS policies for public feed viewing
-- Date: 2025-01-23
-- Purpose: Allow unauthenticated users to view feed by granting SELECT access to users and reading_journeys

-- 1. users 테이블: 모든 사용자의 기본 프로필 정보 조회 허용
-- (닉네임, 이메일은 공개 정보로 간주)
CREATE POLICY "Anyone can view user profiles"
ON users FOR SELECT
USING (true);

-- 2. reading_journeys 테이블: 공개된 게시물과 연결된 완독 여정만 조회 허용
-- 게시물로 공유된 여정만 비로그인 사용자가 볼 수 있어야 함
CREATE POLICY "Anyone can view journeys with published posts"
ON reading_journeys FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.journey_id = reading_journeys.id 
    AND posts.is_published = true
  )
);

-- Note: 
-- - users 테이블은 정책이 없었으므로 모든 접근이 차단되었음
-- - reading_journeys는 auth.uid() = user_id만 있어서 비로그인 사용자 차단
-- - 이제 posts (is_published = true) + users (true) + reading_journeys (has published post) 
--   세 테이블 모두 비로그인 사용자 조회 가능
