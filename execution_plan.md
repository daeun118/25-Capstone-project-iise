# Reading Experience Platform - 실행 계획

**작성일:** 2025-10-20  
**개발 환경:** Claude Code  
**목표:** MVP 단계적 개발 및 배포

---

## Phase 0: 프로젝트 초기 세팅 (Day 1)

### 0.1 프로젝트 생성
```bash
# Next.js 프로젝트 생성
npx create-next-app@latest reading-experience-platform \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd reading-experience-platform
```

### 0.2 필수 패키지 설치
```bash
# Supabase 클라이언트
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# UI 컴포넌트
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card dialog form

# 유틸리티
npm install zustand  # 상태 관리
npm install react-hot-toast  # 알림
npm install lucide-react  # 아이콘
npm install date-fns  # 날짜 포맷
```

### 0.3 Supabase 프로젝트 생성
1. https://supabase.com 접속
2. 새 프로젝트 생성
3. 프로젝트 URL, API Key 복사
4. `.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI API
OPENAI_API_KEY=your_openai_key

# Mureka MCP (나중에 추가)
MUREKA_API_KEY=your_mureka_key
```

### 0.4 폴더 구조 생성
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── journey/
│   │   │   ├── [id]/
│   │   │   └── new/
│   │   ├── library/
│   │   ├── feed/
│   │   └── my/
│   ├── api/
│   │   ├── books/
│   │   ├── journeys/
│   │   ├── music/
│   │   └── posts/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn)
│   ├── journey/
│   ├── music/
│   └── post/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── openai/
│   │   └── client.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useJourney.ts
│   └── useMusicPlayer.ts
└── types/
    └── database.ts
```

---

## Phase 1: 데이터베이스 구축 (Day 1-2)

### 1.1 Supabase SQL 실행

**파일:** `supabase/schema.sql`
```sql
-- 1. Users 테이블 (Supabase Auth와 연동)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  auth_provider VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Reading Journeys 테이블
CREATE TABLE reading_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  book_isbn VARCHAR(20),
  book_title VARCHAR(500) NOT NULL,
  book_author VARCHAR(500),
  book_publisher VARCHAR(200),
  book_cover_url TEXT,
  book_description TEXT,
  book_category VARCHAR(100),
  book_published_date VARCHAR(20),
  
  status VARCHAR(20) NOT NULL DEFAULT 'reading',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  one_liner VARCHAR(100),
  review TEXT,
  review_is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Emotion Tags 테이블
CREATE TABLE emotion_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  is_predefined BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 추천 태그 초기 데이터
INSERT INTO emotion_tags (name, is_predefined) VALUES
  ('기쁨', true), ('슬픔', true), ('고독', true), ('의지', true),
  ('희망', true), ('분노', true), ('설렘', true), ('평온', true);

-- 4. Music Tracks 테이블
CREATE TABLE music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  prompt TEXT NOT NULL,
  genre VARCHAR(50),
  mood VARCHAR(50),
  tempo INTEGER,
  
  file_url TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER,
  
  description VARCHAR(200),
  mureka_task_id VARCHAR(100),
  
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reading Logs 테이블
CREATE TABLE reading_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journey_id UUID NOT NULL REFERENCES reading_journeys(id) ON DELETE CASCADE,
  
  version INTEGER NOT NULL,
  log_type VARCHAR(20) NOT NULL,
  
  quote TEXT,
  memo TEXT,
  is_public BOOLEAN DEFAULT false,
  
  music_prompt TEXT,
  music_track_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Log Emotions 연결 테이블
CREATE TABLE log_emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID NOT NULL REFERENCES reading_logs(id) ON DELETE CASCADE,
  emotion_tag_id UUID NOT NULL REFERENCES emotion_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(log_id, emotion_tag_id)
);

-- 7. Posts 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES reading_journeys(id) ON DELETE CASCADE,
  
  album_cover_url TEXT,
  album_cover_thumbnail_url TEXT,
  
  is_published BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Comments 테이블
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Likes 테이블
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 10. Bookmarks 테이블
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_journeys_user_id ON reading_journeys(user_id);
CREATE INDEX idx_journeys_status ON reading_journeys(status);
CREATE INDEX idx_logs_journey_id ON reading_logs(journey_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_likes_count ON posts(likes_count DESC);

-- RLS 정책 (Row Level Security)
ALTER TABLE reading_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- (RLS 정책 상세는 ERD.md 참고)
```

### 1.2 Storage Buckets 생성

Supabase Dashboard에서:
1. Storage → New Bucket
2. `music` 버킷 생성 (Public)
3. `album-covers` 버킷 생성 (Public)

### 1.3 TypeScript 타입 생성
```bash
# Supabase CLI 설치
npm install -g supabase

# 타입 자동 생성
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

---

## Phase 2: 인증 시스템 (Day 2-3)

### 2.1 Supabase Auth 설정
- Email/Password 활성화
- Google OAuth 설정
- Kakao OAuth 설정 (선택)

### 2.2 개발 순서
1. `lib/supabase/client.ts` - Supabase 클라이언트 초기화
2. `hooks/useAuth.ts` - 인증 훅
3. `app/(auth)/login/page.tsx` - 로그인 페이지
4. `app/(auth)/signup/page.tsx` - 회원가입 페이지
5. `components/Header.tsx` - 네비게이션 (로그인 상태 표시)

### 2.3 테스트
- [ ] 이메일 회원가입 → 로그인
- [ ] Google 소셜 로그인
- [ ] 로그아웃
- [ ] 보호된 라우트 접근 제어

---

## Phase 3: 도서 검색 (Day 3-4)

### 3.1 Google Books API 연동
```typescript
// lib/google-books/client.ts
export async function searchBooks(query: string) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
  );
  return response.json();
}
```

### 3.2 개발 순서
1. `lib/google-books/client.ts` - API 클라이언트
2. `app/api/books/search/route.ts` - 검색 API
3. `components/book/SearchDialog.tsx` - 검색 UI
4. `components/book/BookCard.tsx` - 책 카드

### 3.3 테스트
- [ ] 책 제목 검색
- [ ] 저자 검색
- [ ] 책 정보 표시 (표지, 제목, 저자, 설명)

---

## Phase 4: 독서 여정 - 시작 & v0 생성 (Day 4-6)

### 4.1 개발 순서
1. `app/journey/new/page.tsx` - 책 선택 & 여정 시작
2. `app/api/journeys/create/route.ts` - 여정 생성 API
3. `app/api/music/generate/route.ts` - 음악 생성 API
   - GPT-4o-mini 연동
   - Mureka MCP 연동
4. `components/music/MusicPlayer.tsx` - 음악 플레이어
5. `app/journey/[id]/page.tsx` - 여정 상세 페이지

### 4.2 음악 생성 플로우
```typescript
// app/api/music/generate/route.ts
async function generateMusic(bookData, previousLogs?, userInput?) {
  // 1. GPT-4o-mini로 프롬프트 생성
  const musicPrompt = await generateMusicPrompt(bookData, previousLogs, userInput);
  
  // 2. Mureka MCP로 음악 생성
  const music = await mureka.generate({
    prompt: musicPrompt.prompt,
    duration: 180,
    genre: musicPrompt.genre,
    mood: musicPrompt.mood
  });
  
  // 3. Supabase Storage에 업로드
  const fileUrl = await uploadToStorage(music);
  
  // 4. DB에 저장
  return saveMusicTrack({ ...musicPrompt, fileUrl });
}
```

### 4.3 테스트
- [ ] 책 선택 → 여정 생성
- [ ] v0 음악 자동 생성 (30초~2분 대기)
- [ ] 음악 재생
- [ ] 여정 페이지에서 플레이리스트 표시

---

## Phase 5: 독서 기록 추가 & vN 생성 (Day 6-8)

### 5.1 개발 순서
1. `components/journey/LogForm.tsx` - 기록 작성 폼
   - 인상 깊은 구절
   - 감정 태그 선택 + 커스텀 추가
   - 메모
   - 공개 여부
2. `app/api/journeys/[id]/logs/route.ts` - 로그 생성 API
3. `app/api/music/generate/route.ts` 수정 - 누적 컨텍스트 반영
4. `components/journey/LogList.tsx` - 로그 목록 표시

### 5.2 감정 태그 UI
```typescript
// 추천 태그 + 커스텀 입력
<div>
  <h3>감정 태그</h3>
  {predefinedTags.map(tag => (
    <Badge onClick={() => toggleTag(tag)}>{tag}</Badge>
  ))}
  <Input 
    placeholder="직접 입력..." 
    onEnter={addCustomTag}
  />
</div>
```

### 5.3 테스트
- [x] 독서 기록 추가 ✅
- [x] 감정 태그 선택 + 커스텀 추가 ✅
- [x] vN 음악 프롬프트 생성 (이전 기록 참고) ✅
- [x] 독서 기록 타임라인 표시 ✅
- [x] Playwright E2E 테스트 ✅
- [ ] 실제 음악 파일 생성 (Mureka MCP - 추후 구현)

---

## Phase 6: 완독 & 최종 음악 (Day 8-9)

### 6.1 개발 순서
1. `components/journey/CompleteForm.tsx` - 완독 폼
   - 별점, 한줄평, 감상평
2. `app/api/journeys/[id]/complete/route.ts` - 완독 API
3. `app/api/music/generate/route.ts` 수정 - 최종 음악 생성
4. `components/music/Playlist.tsx` - 플레이리스트 컴포넌트

### 6.2 테스트
- [ ] 완독 처리
- [ ] vFinal 음악 생성
- [ ] 전체 플레이리스트 연속 재생
- [ ] 여정 상태 변경 (읽는 중 → 완독)

---

## Phase 7: 내 책장 (Day 9-10)

### 7.1 개발 순서
1. `app/library/page.tsx` - 내 책장 페이지
2. `app/api/journeys/route.ts` - 여정 목록 API
3. `components/journey/JourneyCard.tsx` - 여정 카드
4. 읽는 중 / 완독 탭 분리

### 7.2 테스트
- [ ] 내 책장에서 여정 목록 표시
- [ ] 읽는 중 / 완독 필터
- [ ] 여정 클릭 → 상세 페이지 이동

---

## Phase 8: 게시판 (Day 10-12)

### 8.1 개발 순서
1. `app/api/posts/route.ts` - 게시물 생성/조회 API
2. `app/feed/page.tsx` - 피드 페이지
3. `components/post/PostCard.tsx` - 게시물 카드
4. `app/feed/[id]/page.tsx` - 게시물 상세
5. `components/post/SameBookPosts.tsx` - "이 책의 다른 여정"

### 8.2 테스트
- [ ] 여정 게시판에 공유
- [ ] 피드에서 게시물 목록 표시
- [ ] 카테고리 필터
- [ ] 인기순/최신순 정렬
- [ ] 게시물 상세 페이지
- [ ] "이 책의 다른 여정" 표시

---

## Phase 9: 상호작용 (Day 12-13)

### 9.1 개발 순서
1. `app/api/posts/[id]/like/route.ts` - 좋아요 API
2. `app/api/posts/[id]/comments/route.ts` - 댓글 API
3. `app/api/posts/[id]/bookmark/route.ts` - 스크랩 API
4. `components/post/InteractionBar.tsx` - 상호작용 UI
5. `components/post/CommentList.tsx` - 댓글 목록

### 9.2 테스트
- [ ] 좋아요 / 취소
- [ ] 댓글 작성 / 삭제
- [ ] 스크랩 / 취소
- [ ] 실시간 카운트 업데이트

---

## Phase 10: 마이페이지 (Day 13-14)

### 10.1 개발 순서
1. `app/my/page.tsx` - 마이페이지
2. `app/my/bookmarks/page.tsx` - 보관함
3. `app/api/bookmarks/route.ts` - 스크랩 목록 API
4. 프로필 편집 (닉네임만)

### 10.2 테스트
- [ ] 보관함에서 스크랩한 게시물 확인
- [ ] 닉네임 변경

---

## Phase 11: UI/UX 개선 (Day 14-15)

### 11.1 개발 순서
1. 다크모드 구현
2. 눈 편의성 설정 (글씨 크기, 줄 간격)
3. 반응형 디자인 최적화
4. 로딩 상태 UI
5. 에러 처리 UI

### 11.2 테스트
- [ ] 다크모드 토글
- [ ] 글씨 크기 조절
- [ ] 모바일/태블릿 화면 테스트
- [ ] 로딩 스피너 표시
- [ ] 에러 메시지 표시

---

## Phase 12: 배포 (Day 15-16)

### 12.1 Vercel 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 12.2 환경 변수 설정
Vercel Dashboard에서:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `MUREKA_API_KEY`

### 12.3 최종 테스트
- [ ] 프로덕션 환경에서 전체 플로우 테스트
- [ ] 성능 측정 (Lighthouse)
- [ ] 모바일 테스트

---

## Phase 13 (P1): 앨범커버 생성 (선택)

### 13.1 개발 순서
1. `app/api/album-cover/generate/route.ts` - 앨범커버 생성 API
   - GPT-4o-mini: 핵심 장면 추출
   - DALL-E 3: 4컷 이미지 생성
   - 이미지 합성
2. `components/journey/AlbumCoverGenerator.tsx` - 생성 UI
3. Supabase Storage 업로드

### 13.2 테스트
- [ ] 완독 후 앨범커버 생성
- [ ] 4컷 만화 스타일 확인
- [ ] 게시물에 앨범커버 표시

---

## 개발 우선순위

### 🔴 P0 (최우선)
- Phase 0-12 (MVP 핵심 기능)

### 🟡 P1 (중요)
- Phase 13 (앨범커버)
- 다크모드, 눈 편의성

### 🟢 P2 (다음 버전)
- 추천 시스템
- 인기 랭킹
- 팔로우 시스템

---

## 일정 예상

**총 16일 (약 2-3주)**

- Week 1: Phase 0-7 (기초 + 독서 여정)
- Week 2: Phase 8-11 (커뮤니티 + UI)
- Week 3: Phase 12-13 (배포 + 추가 기능)

---

## 체크리스트

### 개발 전 확인
- [ ] Supabase 프로젝트 생성
- [ ] OpenAI API 키 발급
- [ ] Mureka API 키 발급 (또는 대체 방안)
- [ ] Google Books API 설정

### 개발 중 확인
- [ ] 각 Phase 완료 후 테스트
- [ ] Git 커밋 & 푸시
- [ ] 에러 처리 구현
- [ ] 로딩 상태 구현

### 배포 전 확인
- [ ] 환경 변수 설정
- [ ] 프로덕션 빌드 테스트
- [ ] 성능 최적화
- [ ] 보안 검토

---

**이 계획은 Claude Code에서 단계별로 실행하면서 조정할 수 있습니다.**