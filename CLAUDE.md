# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Reading Experience Platform - Claude Code Guide

## 프로젝트 개요

**Reading Experience Platform (독서 여정 플랫폼)**은 독서 과정을 음악으로 기록하고 공유하는 웹 서비스입니다.

### 핵심 컨셉
- 독서 여정의 각 단계마다 AI가 음악을 자동 생성
- 완독 시 전체 독서 경험을 담은 플레이리스트 완성
- 커뮤니티에서 다른 사람의 독서 여정 탐색 및 공유

### 음악 생성 플로우
```
책 선택 → v0 음악 (책 정보 기반)
  ↓
독서 기록 추가 → v1, v2, ... vN 음악 (감정 + 구절 기반)
  ↓
완독 → vFinal 음악 (전체 여정 종합)
  ↓
플레이리스트 완성 (v0 → v1 → ... → vN → vFinal)
```

## 개발 명령어

### 애플리케이션 실행
```bash
# 개발 서버 실행 (Turbopack 사용 - 가장 빠름)
npm run dev

# 개발 서버 + Mureka MCP 브릿지 동시 실행
npm run dev:with-mureka

# Mureka MCP 브릿지만 실행 (별도 터미널)
npm run mureka:bridge

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

**중요**: 여러 개의 dev 서버가 백그라운드에서 실행 중일 수 있습니다. 새 서버 시작 전 `netstat -ano | findstr :3000` (Windows) 또는 `lsof -i :3000` (Mac/Linux)로 확인하세요.

### 데이터베이스 타입 생성
```bash
# Supabase 스키마로부터 TypeScript 타입 자동 생성
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
```

### 테스트
```bash
# Playwright E2E 테스트 실행
npm test

# 헤드리스 모드로 테스트 실행
npm run test:headed

# UI 모드로 테스트 실행 (디버깅에 유용)
npm run test:ui

# 디버그 모드로 테스트 실행
npm run test:debug

# 테스트 리포트 보기
npm run test:report
```

**테스트 구조**:
- `tests/` - Playwright E2E 테스트
- `tests/pages/` - Page Object Model 패턴
- `tests/helpers/` - 테스트 헬퍼 함수
- `playwright.config.ts` - Playwright 설정

### 유틸리티 스크립트
```bash
# 음악 생성 플로우 E2E 테스트 (개발 서버 실행 필요)
npm run test:music-flow
# 또는: node scripts/test-music-flow.js

# 완독 플로우 E2E 테스트 (개발 서버 실행 필요)
npm run test:complete-flow
# 또는: node scripts/test-complete-flow.js

# 내 책장 페이지 E2E 테스트 (개발 서버 실행 필요)
npm run test:library
# 또는: node scripts/test-library.js

# Mureka API 연결 테스트
node scripts/test-mureka-api.js

# 독서 여정 테스트 데이터 생성
node scripts/setup-test-journey.js

# Mureka 설정 검증
node scripts/verify-mureka-setup.js
```

**스크립트 위치**: `scripts/` 폴더
**중요**: 모든 스크립트는 `.env.local` 환경 변수 필요

## 필수 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (음악 프롬프트 생성에 필수)
OPENAI_API_KEY=your_openai_key

# Mureka MCP (음악 생성에 필수)
MUREKA_API_KEY=your_mureka_key

# OAuth (선택사항)
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_secret
```

⚠️ **보안 주의**: `.env.local` 파일을 절대 git에 커밋하지 마세요 (이미 .gitignore에 포함됨)

## 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **State**: Zustand (전역 상태), React Hook Form + Zod (폼)
- **Icons**: Lucide React (⚠️ **이모지 사용 금지**)
- **Animation**: Framer Motion

### Backend & Infrastructure
- **BaaS**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **API Routes**: Next.js API Routes
- **File Storage**: Supabase Storage (음악 파일, 앨범커버)

### AI & External APIs
- **Music Prompt**: OpenAI GPT-4o-mini
- **Music Generation**: Mureka MCP
- **Book Search**: Google Books API
- **OAuth**: Kakao (선택)

### Audio
- **Player**: Howler.js
- **Waveform**: WaveSurfer.js

### Testing & Development
- **E2E Testing**: Playwright
- **MCP Servers**: filesystem, github, supabase, context7, playwright 등

## 프로젝트 구조

```
bookbeats/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 라우트 그룹
│   │   │   ├── login/                # 로그인 페이지
│   │   │   └── signup/               # 회원가입 페이지
│   │   ├── (main)/                   # 메인 라우트 그룹
│   │   │   ├── journey/              # 독서 여정
│   │   │   │   ├── [id]/             # 여정 상세 (동적 라우트)
│   │   │   │   └── new/              # 새 여정 시작
│   │   │   ├── library/              # 내 책장
│   │   │   ├── feed/                 # 게시판 (커뮤니티 피드)
│   │   │   └── my/                   # 마이페이지
│   │   ├── api/                      # API Routes
│   │   │   ├── books/                # 도서 검색 API
│   │   │   ├── journeys/             # 독서 여정 CRUD
│   │   │   ├── music/                # 음악 생성 API
│   │   │   └── posts/                # 게시물 CRUD
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 홈페이지
│   │   └── globals.css               # 전역 스타일
│   │
│   ├── components/                   # React 컴포넌트
│   │   ├── ui/                       # shadcn/ui 기본 컴포넌트
│   │   ├── journey/                  # 독서 여정 관련 컴포넌트
│   │   ├── music/                    # 음악 플레이어 컴포넌트
│   │   ├── post/                     # 게시물 관련 컴포넌트
│   │   └── CLAUDE.md                 # 컴포넌트 가이드 (중요!)
│   │
│   ├── lib/                          # 라이브러리 & 유틸리티
│   │   ├── supabase/                 # Supabase 클라이언트
│   │   │   ├── client.ts             # 클라이언트 컴포넌트용
│   │   │   └── server.ts             # 서버 컴포넌트용
│   │   ├── openai/                   # OpenAI 연동
│   │   │   └── client.ts             # 음악 프롬프트 생성 로직
│   │   └── utils.ts                  # 공통 유틸리티 (cn 함수 등)
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuth.ts                # 인증 관련 훅
│   │   ├── useJourney.ts             # 독서 여정 관리 훅
│   │   └── useMusicPlayer.ts         # 음악 플레이어 훅
│   │
│   ├── services/                     # 비즈니스 로직 레이어
│   │   ├── journey.service.ts        # 독서 여정 서비스
│   │   └── music.service.ts          # 음악 생성 서비스
│   │
│   ├── repositories/                 # 데이터 액세스 레이어
│   │   └── log.repository.ts         # 독서 로그 리포지토리
│   │
│   └── types/                        # TypeScript 타입 정의
│       ├── database.ts               # Supabase 데이터베이스 타입
│       └── dto/                      # Data Transfer Objects
│
├── tests/                            # Playwright E2E 테스트
│   ├── pages/                        # Page Object Models
│   └── helpers/                      # 테스트 헬퍼 함수
│
├── public/                           # 정적 파일
├── .env.local                        # 환경 변수 (gitignore)
├── .env.example                      # 환경 변수 템플릿
├── components.json                   # shadcn/ui 설정
├── playwright.config.ts              # Playwright 설정
├── tsconfig.json                     # TypeScript 설정
├── tailwind.config.ts                # Tailwind CSS 설정
├── next.config.ts                    # Next.js 설정
├── PRD_instruction.md                # 제품 요구사항 문서
├── execution_plan.md                 # 단계별 실행 계획
└── CLAUDE.md                         # 이 파일
```

## 개발 도구 및 MCP 서버

### MCP (Model Context Protocol) 도구 사용 원칙

**⚠️ 매우 중요**: 파일 작업 시 MCP 도구를 우선 사용하세요!

```typescript
// ✅ 올바른 방법: MCP filesystem 도구 사용
mcp__filesystem__read_text_file({ path: "C:/Users/USER/bookbeats/src/app/page.tsx" })
mcp__filesystem__edit_file({ path: "...", edits: [...] })
mcp__filesystem__write_file({ path: "...", content: "..." })

// ❌ 피해야 할 방법: bash sed/awk 등 복잡한 명령어
bash("sed -i 's/old/new/g' file.tsx")  // 파일 손상 위험!
```

### 사용 가능한 MCP 서버

1. **filesystem** - 파일 읽기/쓰기/편집 (가장 자주 사용)
   - `read_text_file`, `write_file`, `edit_file`
   - `list_directory`, `create_directory`
   - `search_files`, `get_file_info`

2. **supabase** - 데이터베이스 작업
   - `execute_sql`, `apply_migration`
   - `list_tables`, `generate_typescript_types`
   - `get_logs`, `get_advisors`

3. **github** - Git 작업
   - `create_pull_request`, `create_issue`
   - `get_file_contents`, `push_files`

4. **playwright** - 브라우저 테스팅
   - `browser_navigate`, `browser_click`
   - `browser_snapshot`, `browser_take_screenshot`

5. **context7** - 라이브러리 문서 검색
   - `resolve-library-id`, `get-library-docs`

### MCP 도구 사용 우선순위

```
1순위: MCP filesystem 도구 (read_text_file, edit_file, write_file)
2순위: MCP 전문 도구 (supabase, playwright, github)
3순위: bash 명령어 (단순 명령만 - ls, cd, npm 등)

❌ 절대 금지: bash를 이용한 복잡한 파일 편집 (sed, awk 등)
```

## 데이터베이스 스키마 (Supabase)

### 주요 테이블

1. **users** - 사용자 정보
   - Supabase Auth와 연동
   - 닉네임, 이메일, 인증 제공자

2. **reading_journeys** - 독서 여정
   - 책 정보 (ISBN, 제목, 저자, 표지 등)
   - 상태 (reading/completed)
   - 별점, 한줄평, 감상평

3. **reading_logs** - 독서 기록
   - 버전 관리 (v0, v1, v2, ...)
   - 인상 깊은 구절, 메모
   - 음악 트랙 참조
   - **주의**: `emotion_tags` 필드는 직접 없음, `log_emotions` 테이블로 조인 필요

4. **music_tracks** - 음악 파일
   - 프롬프트, 장르, 무드, 템포
   - 파일 URL (Supabase Storage)
   - 생성 상태 (pending/completed/error)

5. **emotion_tags** - 감정 태그
   - 사전 정의 태그 + 사용자 커스텀
   - 사용 횟수 추적

6. **log_emotions** - 로그-감정 다대다 관계 테이블
   - reading_log_id ↔ emotion_tag_id

7. **posts** - 게시물
   - 완독한 여정 공유
   - 앨범커버, 좋아요/댓글/스크랩 수

8. **comments**, **likes**, **bookmarks** - 상호작용

### Row Level Security (RLS)
- 모든 테이블에 RLS 활성화
- 사용자는 자신의 데이터만 조회/수정 가능
- 공개 게시물은 모든 사용자가 조회 가능

## 핵심 아키텍처 패턴

### 1. Next.js 15 Breaking Changes (중요!)

**Dynamic Route Params가 Promise로 변경됨**:

```typescript
// ❌ Next.js 14 방식 (더 이상 작동하지 않음)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const journeyId = params.id;  // 에러!
}

// ✅ Next.js 15 방식 (반드시 await 필요)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // 올바름!
  // 이제 id 사용 가능
}
```

**적용 파일**:
- `src/app/api/journeys/[id]/route.ts`
- 모든 동적 라우트의 API Routes
- 모든 동적 라우트의 페이지 컴포넌트

### 2. 3단계 음악 생성 플로우 (가장 중요!)

이 프로젝트의 **핵심 비즈니스 로직**입니다:

```typescript
v0 (여정 시작)
  입력: 책 메타데이터만 (제목, 설명, 카테고리)
  출력: 첫 번째 음악

v1, v2, ...vN (독서 진행 중)
  입력: 누적 컨텍스트 (이전 로그들) + 새로운 사용자 입력 (구절, 감정, 메모)
  처리: previousLogs.slice(-2) - 최근 2개만 사용 (토큰 절약)
  출력: 진화하는 음악

vFinal (완독)
  입력: 전체 여정 히스토리 + 최종 감상
  출력: 여정의 피날레 음악
```

**핵심 구현 파일**: `src/lib/openai/client.ts`의 `generateMusicPrompt()` 함수

**중요 설정값**:
- 모델: `gpt-4o-mini` (비용 효율적)
- Temperature: `0.8` (창의성 확보)
- Response Format: `{ type: 'json_object' }` (엄격한 JSON 응답)
- 컨텍스트 제한: 최근 2개 로그만 참조 (토큰 절약)

```typescript
// 예시: src/lib/openai/client.ts
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.8,
  response_format: { type: "json_object" },
  messages: [...]
});
```

### 3. Supabase 클라이언트 분리 패턴

**⚠️ 매우 중요**: 반드시 올바른 클라이언트를 사용하세요!

```typescript
// ❌ 절대 이렇게 하지 마세요
import { createClient } from '@supabase/supabase-js'

// ✅ 클라이언트 컴포넌트에서 ('use client' 선언된 파일)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// ✅ 서버 컴포넌트/API Routes에서
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()  // ← await 필수!
```

**이유**:
- 클라이언트: 브라우저의 쿠키를 통한 인증
- 서버: Next.js의 쿠키 헤더를 통한 인증 (async 필요)

### 4. Next.js 라우트 그룹 구조

```
app/
├── (auth)/           # 인증 라우트 그룹 - 최소 레이아웃
│   ├── login/
│   └── signup/
├── (main)/           # 메인 라우트 그룹 - 전체 앱 레이아웃
│   ├── journey/
│   ├── library/
│   ├── feed/
│   └── my/
└── api/              # API Routes (라우트 그룹 아님)
```

**라우트 그룹의 목적**: URL에 영향을 주지 않고 레이아웃을 분리
- `(auth)` → `/login`, `/signup` (단순 레이아웃)
- `(main)` → `/journey`, `/library` (Header, Sidebar 포함)

## API 엔드포인트 구조

### Books API
- `GET /api/books/search?q={query}` - Google Books API 검색

### Journeys API
- `POST /api/journeys/create` - 새 여정 시작 (v0 음악 생성)
- `GET /api/journeys?status={status}&sort={sort}` - 내 여정 목록
  - Query Parameters:
    - `status`: 'reading' | 'completed' | 'all' (default: 'all')
    - `sort`: 'latest' | 'oldest' (default: 'latest')
  - 반환값: Journey 배열 (logsCount, musicTracksCount 포함)
- `GET /api/journeys/[id]` - 여정 상세
- `POST /api/journeys/[id]/logs` - 독서 기록 추가 (vN 음악 생성)
- `POST /api/journeys/[id]/complete` - 완독 처리 (vFinal 음악 생성)

### Music API
- `POST /api/music/generate` - 음악 생성 (GPT-4o-mini + Mureka)
  - 입력: 책 정보, 이전 기록, 사용자 입력
  - 출력: 음악 파일 URL, 메타데이터

### Posts API
- `POST /api/posts` - 게시물 생성
- `GET /api/posts` - 게시물 목록 (필터, 정렬)
- `GET /api/posts/[id]` - 게시물 상세
- `POST /api/posts/[id]/like` - 좋아요
- `POST /api/posts/[id]/comments` - 댓글 작성
- `POST /api/posts/[id]/bookmark` - 스크랩

## 개발 가이드라인

### 코드 스타일
- **Naming**: camelCase (변수, 함수), PascalCase (컴포넌트, 타입)
- **파일명**: kebab-case (page.tsx, user-profile.tsx)
- **컴포넌트**: 함수형 컴포넌트 + TypeScript
- **Imports**: `@/` 별칭 사용 (예: `@/components/ui/button`)

### 컴포넌트 작성 원칙
1. **Server Components 우선**: 가능하면 Server Component 사용
2. **'use client' 명시적 선언**: 클라이언트 상태가 필요할 때만
3. **단일 책임**: 하나의 컴포넌트는 하나의 역할
4. **재사용성**: 공통 로직은 hooks로 분리

### 컴포넌트 구성 규칙 (CRITICAL)

**⚠️ 컴포넌트를 만들기 전에 반드시**: `src/components/CLAUDE.md` 먼저 확인!

#### 컴포넌트 카테고리
- `ui/` - shadcn/ui 기본 요소 (**수정 금지**)
- `layout/` - AppLayout, Header, Footer, Sidebar
- `auth/` - LoginForm, SignupForm, SocialLoginButtons
- `book/` - BookCard, BookCover, BookSearchDialog
- `journey/` - JourneyCard, LogForm, LogList, CompleteForm, JourneyHeader, EmotionTagSelector
- `music/` - MusicPlayer, Waveform, Playlist, MusicGenerationStatus
- `post/` - PostCard, PostDetail, InteractionBar, CommentList, CommentForm, SameBookPosts
- `user/` - UserAvatar, UserProfileDropdown
- `common/` - LoadingSpinner, ErrorBoundary, EmptyState, Pagination, ThemeToggle, ConfirmDialog, FilterBar, RatingDisplay, StatsCard
- `settings/` - AccessibilitySettings

#### 필수 워크플로우
```
1. src/components/CLAUDE.md 에서 기존 컴포넌트 확인
2. 가능하면 props/variants로 재사용
   <BookCard variant="search" />  // 검색용
   <BookCard variant="library" /> // 책장용
3. 꼭 필요할 때만 새 컴포넌트 생성
4. ⚠️ 항상 Lucide React 아이콘 사용, 이모지 절대 금지
```

#### 재사용 예시
```typescript
// ✅ 올바름: 기존 컴포넌트 재사용
import { BookCard } from '@/components/book/BookCard';
<BookCard book={book} variant="library" showActions />

// ❌ 잘못됨: 유사한 새 컴포넌트 생성
function MyBookCard() { /* ... */ }
```

**📚 상세 문서**: [src/components/CLAUDE.md](./src/components/CLAUDE.md) - 모든 컴포넌트의 Props, 사용법, 예제

### Supabase 클라이언트 사용법

**중요**: 이 프로젝트는 `@supabase/auth-helpers-nextjs` 패키지를 사용합니다.

자세한 패턴은 위의 **"핵심 아키텍처 패턴 > 3. Supabase 클라이언트 분리 패턴"** 섹션을 참고하세요.

**타입 안정성**:
- `Database` 타입은 `src/types/database.ts`에서 자동 생성됩니다
- 데이터베이스 스키마 변경 시 반드시 타입을 재생성하세요:
  ```bash
  supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
  ```

### 음악 생성 플로우 (핵심 로직)
이 플랫폼의 핵심 기능은 3단계 음악 생성입니다:

1. **v0 생성** (여정 시작): 책 정보만으로 음악 생성
2. **vN 생성** (독서 중): 누적 컨텍스트 + 새로운 감정 반영
3. **vFinal 생성** (완독): 전체 여정을 종합한 피날레 음악

**음악 생성 시간**: 30초 ~ 2분 (Mureka API 처리 시간)

```typescript
// 프롬프트 생성 (src/lib/openai/client.ts 참고)
import { generateMusicPrompt } from '@/lib/openai/client'

const prompt = await generateMusicPrompt({
  bookTitle: "노인과 바다",
  bookDescription: "...",
  bookCategory: "외국소설",
  previousLogs: [...],  // 이전 독서 기록들 (누적 컨텍스트)
  userInput: {
    quote: "...",
    emotions: ["고독", "의지"],
    memo: "..."
  },
  isFinal: false  // true면 vFinal 생성
})

// 반환값: { prompt, genre, mood, tempo, description }

// 이후 Mureka MCP로 실제 음악 생성 → Supabase Storage 업로드
```

**중요 사항**:
- `generateMusicPrompt` 함수는 `gpt-4o-mini` 모델 사용
- `response_format: { type: 'json_object' }` 설정으로 JSON 응답 보장
- `temperature: 0.8`로 창의성 확보
- 이전 기록은 최근 2개만 사용 (`previousLogs.slice(-2)`)하여 토큰 절약

### 에러 처리 및 사용자 피드백
- **API Routes**: try-catch + 적절한 HTTP 상태 코드 (200, 400, 401, 500 등)
- **클라이언트**: `sonner` 사용 (`toast.success()`, `toast.error()`)
- **로딩 상태**: 명시적 loading state 관리 (특히 음악 생성은 30초~2분 소요)

### 보안 원칙
1. **환경 변수 관리**:
   - `NEXT_PUBLIC_*` 접두사: 클라이언트에서 접근 가능
   - `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용
   - ⚠️ `.env.local` 파일은 절대 커밋하지 않기
2. **Row Level Security (RLS)**: 모든 테이블에 필수 적용
   - 사용자는 자신의 데이터만 조회/수정
   - 공개 게시물은 모든 사용자가 읽기 가능
3. **인증**: Supabase Auth 사용 (Email/Password, Google, Kakao)
4. **입력 검증**: 사용자 입력은 항상 검증 (Zod 스키마 사용 권장)

## 알려진 이슈 및 해결방법

### 1. emotion_tags 필드 이슈

**문제**: `reading_logs` 테이블에 `emotion_tags` 필드가 직접 존재하지 않음

**해결방법**:
```typescript
// ❌ 잘못된 방법
const log = await supabase
  .from('reading_logs')
  .select('*, emotion_tags')  // 에러!

// ✅ 올바른 방법 (조인 사용)
const log = await supabase
  .from('reading_logs')
  .select(`
    *,
    log_emotions!inner (
      emotion_tags (
        id,
        name,
        color
      )
    )
  `)
```

**영향받는 파일**:
- `src/services/music.service.ts` - TODO 주석으로 표시됨
- `src/services/journey.service.ts` - TODO 주석으로 표시됨

### 2. Next.js 15 params Promise

**문제**: Dynamic route의 params가 Promise로 변경됨

**해결방법**: 위의 "핵심 아키텍처 패턴 > 1. Next.js 15 Breaking Changes" 참고

### 3. Mureka API 통합 이슈

**문제**: Mureka API 응답 형식과 폴링 로직 불일치

**해결방법** (2025-10-21 수정 완료):
```typescript
// ❌ 잘못된 방법 (GitHub 문서와 실제 API 불일치)
const taskId = result.task_id;  // 실제로는 'id' 필드 사용

// ✅ 올바른 방법
const taskId = result.id;  // Mureka API는 'id' 필드 반환

// API 응답 예시:
{
  "id": "101439869353985",
  "created_at": 1761048700,
  "model": "mureka-7.5",
  "status": "preparing",
  "trace_id": "9c62f2d5915d70ae809fdaa857fa12df"
}
```

**주요 수정사항**:
1. 엔드포인트: `/v1/song/generate` → `/v1/instrumental/generate` (BGM 전용)
2. 페이로드: `{model: 'auto', prompt: '...'}` (lyrics 필드 제거)
3. 응답 필드: `task_id` → `id`
4. 폴링: `/v1/instrumental/query/{id}` (5초 간격, 최대 5분)
5. 상태: preparing → processing → succeeded/failed/cancelled/timeouted

**영향받는 파일**:
- `src/lib/mureka/client.ts` - API 통합 로직 (수정 완료)
- `.env.local` - `MUREKA_MCP_ENABLED=false` 설정 필수

### 4. 음악 생성 중 페이지 새로고침 이슈

**문제**: 음악 생성 중 useEffect 무한 재실행으로 페이지 깜빡임

**해결방법** (2025-10-21 수정 완료):
```typescript
// ❌ 잘못된 방법 (generatingTracks 의존성으로 무한 루프)
useEffect(() => {
  if (generatingTracks.size === 0) return;
  const pollInterval = setInterval(fetchJourney, 2000);
  return () => clearInterval(pollInterval);
}, [generatingTracks]); // 매번 새로운 Set 객체로 재실행

// ✅ 올바른 방법 (useRef로 안정적 참조)
const generatingTracksRef = useRef(generatingTracks);
generatingTracksRef.current = generatingTracks;

useEffect(() => {
  const pollInterval = setInterval(() => {
    if (generatingTracksRef.current.size > 0) {
      fetchJourney();
    }
  }, 2000);
  return () => clearInterval(pollInterval);
}, []); // 빈 의존성 배열 - 마운트 시 한 번만 실행
```

**영향받는 파일**:
- `src/app/(main)/journey/[id]/page.tsx` - 폴링 로직 (수정 완료)

### 5. Optional Props 타입 에러

**문제**: 컴포넌트 props가 optional인데 required로 전달되는 경우

**해결방법**:
```typescript
// ✅ Props 인터페이스에 optional 명시
interface JourneyHeaderProps {
  bookTitle: string;
  bookAuthor?: string;  // optional
  logsCount?: number;   // optional
}

// ✅ 기본값 제공
export function JourneyHeader({ 
  bookAuthor = 'Unknown',
  logsCount = 0 
}: JourneyHeaderProps) {
  // ...
}
```

## 현재 개발 단계

**현재 상태**: ✅ Phase 10 완료 (마이페이지)

**최근 완료 사항** (Phase 10 - 마이페이지):
```
✅ 사용자 프로필 API 구현 (GET/PATCH /api/user/profile)
✅ 북마크 목록 API 구현 (GET /api/user/bookmarks)
✅ 독서 통계 API 구현 (GET /api/user/stats)
✅ ProfileEditDialog 컴포넌트 구현 (닉네임 수정)
✅ StatsDashboard 컴포넌트 구현 (독서 통계 대시보드)
✅ 마이페이지 UI 업데이트 (프로필 정보 + 통계)
✅ 보관함 페이지 구현 (/my/bookmarks)
```

**Phase 10 주요 기능**:
- **프로필 관리**: 사용자 정보 조회, 닉네임 수정 (중복 검증)
- **보관함**: 스크랩한 게시물 목록, 페이지네이션, 카드형 레이아웃
- **독서 통계**: 여정 통계, 콘텐츠 통계, 커뮤니티 활동, 독서 인사이트
- **통계 항목**: 전체/진행중/완독 여정, 음악 트랙, 독서 기록, 좋아요/댓글/스크랩, 평균 별점, 선호 카테고리

**다음 단계** (Phase 11 - UI/UX 개선):
1. 다크모드 구현
2. 눈 편의성 설정 (글씨 크기, 줄 간격)
3. 반응형 디자인 최적화
4. 로딩 상태 UI 개선
5. 에러 처리 UI 개선

**전체 개발 로드맵**:
- [x] Phase 0: 프로젝트 초기 세팅
- [x] Phase 1: 데이터베이스 구축
- [x] Phase 2: 인증 시스템
- [x] Phase 3: 도서 검색
- [x] Phase 4: 독서 여정 시작 & v0 음악 생성
- [x] Phase 5: 독서 기록 추가 & vN 음악 생성
- [x] Phase 6: 완독 & 최종 음악 생성
- [x] Phase 7: 내 책장 ✅ **완료**
- [x] Phase 8: 게시판 (커뮤니티) ✅ **완료**
- [x] Phase 9: 상호작용 (좋아요, 댓글, 스크랩) ✅ **완료**
- [x] Phase 10: 마이페이지 ✅ **완료**
- [ ] Phase 11: UI/UX 개선
- [ ] Phase 12: 배포
- [ ] Phase 13: 앨범커버 생성 (P1, 선택사항)

상세한 단계별 실행 계획은 [execution_plan.md](./execution_plan.md)를 참고하세요.

## 개발 워크플로우

### 브랜치 전략
- `master`: 메인 브랜치
- `feature/*`: 각 Phase별 기능 개발
- `fix/*`: 버그 수정

### 각 Phase 완료 후 체크리스트
- [ ] TypeScript 에러 없음 (`npm run build`)
- [ ] Supabase 연결 정상 작동
- [ ] 해당 Phase의 API 엔드포인트 테스트
- [ ] 에러 처리 및 로딩 상태 구현
- [ ] Git 커밋 (의미있는 메시지)

## 빌드 및 배포

### 빌드 전 체크사항
- [ ] TypeScript 에러 없음 (`npm run build`)
- [ ] 환경 변수가 모두 설정됨 (`.env.local`)
- [ ] Supabase 연결 정상 작동
- [ ] 음악 생성 플로우 테스트 완료
- [ ] RLS 정책 검증 완료
- [ ] Playwright 테스트 통과 (`npm test`)

## 참고 문서
- [PRD_instruction.md](./PRD_instruction.md) - 상세한 제품 요구사항
- [execution_plan.md](./execution_plan.md) - 단계별 실행 계획
- [src/components/CLAUDE.md](./src/components/CLAUDE.md) - 컴포넌트 가이드 (필수!)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Playwright Documentation](https://playwright.dev/)

## 중요 주의사항

### ❌ 절대 하지 말 것
- `.env.local` 파일을 git에 커밋
- Service Role Key를 클라이언트 코드에서 사용
- RLS 정책 없이 테이블 생성
- 음악 파일을 public 폴더에 저장
- **이모지(emoji) 사용 - 항상 Lucide React 아이콘으로 대체**
- `@supabase/supabase-js`를 직접 import (반드시 `@/lib/supabase/client` 또는 `server` 사용)
- **bash를 이용한 복잡한 파일 편집 (sed, awk 등) - MCP filesystem 도구 사용**
- Next.js 15에서 동적 라우트 params를 await 없이 사용
- `reading_logs` 테이블에서 `emotion_tags` 필드 직접 참조

### ✅ 반드시 할 것
- 새로운 테이블 생성 시 RLS 정책 추가
- API Routes는 인증 확인 먼저 수행
- 비동기 작업(특히 음악 생성)은 명시적 로딩/에러 상태 표시
- 타입 안전성 유지 (any 사용 최소화)
- **UI 컴포넌트는 shadcn/ui 사용** (일관성 있는 디자인)
- 컴포넌트 생성 전 `src/components/CLAUDE.md` 확인
- **파일 작업 시 MCP filesystem 도구 우선 사용**
- Next.js 15 동적 라우트에서 `await params` 패턴 사용
- emotion_tags 조회 시 `log_emotions` 테이블 조인 사용

---

**이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.**
