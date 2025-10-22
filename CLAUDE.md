# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# BookBeats - 독서 여정 플랫폼

독서 과정을 AI 생성 음악으로 기록하고 공유하는 웹 서비스. 각 독서 단계마다 음악이 자동 생성되어 완독 시 플레이리스트가 완성됩니다.

**핵심 플로우**: 책 선택(v0) → 독서 기록(v1~vN) → 완독(vFinal) → 플레이리스트 완성

## 주요 명령어

```bash
# 개발 (포트 3000 자동 정리)
npm run dev

# 서버 관리
npm run server:status    # 상태 확인
npm run server:kill      # 포트 강제 종료

# 빌드 & 배포
npm run build
npm start

# 테스트
npm test                 # Playwright E2E
npm run test:ui          # UI 모드

# 데이터베이스 타입 생성
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
```

**Troubleshooting**:
- 포트 충돌: `npm run server:kill` → `npm run dev`
- 빌드 에러: `rm -rf .next` → `npm run build`
- 타입 에러: DB 타입 재생성 → 빌드

## 환경 변수

`.env.local` 필수 설정:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...              # GPT-4o-mini
MUREKA_API_KEY=...              # 음악 생성
KAKAO_CLIENT_ID=...             # 선택
```

## 기술 스택

**Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion  
**Backend**: Supabase (PostgreSQL, Auth, Storage)  
**AI**: OpenAI GPT-4o-mini (프롬프트), Mureka MCP (음악 생성)  
**State**: Zustand, React Hook Form + Zod  
**Icons**: Lucide React (**이모지 금지**)  
**Testing**: Playwright

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/              # 로그인, 회원가입 (최소 레이아웃)
│   ├── (main)/              # 메인 앱 (Header + Sidebar)
│   │   ├── journey/[id]/    # 독서 여정 상세
│   │   ├── library/         # 내 책장
│   │   ├── feed/            # 커뮤니티 피드
│   │   └── my/              # 마이페이지
│   └── api/                 # API Routes
│
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── journey/             # 독서 여정 UI
│   ├── music/               # 음악 플레이어
│   ├── post/                # 게시물 UI
│   └── CLAUDE.md            # 컴포넌트 문서 ⭐
│
├── lib/
│   ├── supabase/           # client.ts, server.ts
│   ├── openai/             # 음악 프롬프트 생성 ⭐
│   └── utils.ts
│
├── hooks/                   # Custom React Hooks
├── services/                # 비즈니스 로직
└── types/                   # TypeScript 타입
```

**⭐ 핵심 파일**:
- `src/lib/openai/client.ts` - 3단계 음악 생성 로직
- `src/components/CLAUDE.md` - 컴포넌트 사용 전 필수 확인

## MCP 도구 사용

**파일 작업은 항상 MCP filesystem 도구 우선**:
```typescript
// ✅ 올바름
mcp__filesystem__read_text_file({ path: "..." })
mcp__filesystem__edit_file({ path: "...", edits: [...] })

// ❌ 금지: bash sed/awk (파일 손상 위험)
bash("sed -i 's/old/new/g' file.tsx")
```

**사용 가능한 MCP 서버**:
- `filesystem` - 파일 읽기/쓰기/편집
- `supabase` - DB 작업, 타입 생성
- `playwright` - E2E 테스트
- `github` - Git 작업
- `context7` - 라이브러리 문서

## 데이터베이스 (Supabase)

**주요 테이블**:
- `users` - 사용자 (Auth 연동)
- `reading_journeys` - 독서 여정 (책 정보, 상태, 리뷰)
- `reading_logs` - 독서 기록 (v0, v1, v2..., 음악 참조)
- `music_tracks` - 음악 파일 (프롬프트, 파일 URL, 상태)
- `emotion_tags` - 감정 태그 (프리셋 + 커스텀)
- `log_emotions` - 로그-감정 연결 테이블
- `posts`, `comments`, `likes`, `bookmarks` - 커뮤니티

**⚠️ 중요**: `emotion_tags` 조회 시 `log_emotions` 테이블 조인 필요  
**보안**: 모든 테이블 RLS 활성화 (사용자는 자신의 데이터만 접근)

## 핵심 아키텍처 패턴

### 1. Next.js 15 - Dynamic Route Params (중요!)

```typescript
// ❌ Next.js 14 방식 (작동 안 함)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;  // 에러!
}

// ✅ Next.js 15 방식 (await 필수)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // 올바름
}
```

### 2. 3단계 음악 생성 플로우 (핵심 비즈니스 로직)

```typescript
v0 (여정 시작): 책 정보만 → 첫 음악
vN (독서 중): 최근 2개 로그 + 새 입력 → 진화하는 음악
vFinal (완독): 전체 히스토리 + 최종 감상 → 피날레 음악
```

**핵심 파일**: `src/lib/openai/client.ts`의 `generateMusicPrompt()`

**설정**:
- 모델: `gpt-4o-mini`
- Temperature: `0.8`
- Response: `{ type: 'json_object' }`
- 컨텍스트: 최근 2개 로그만 (`previousLogs.slice(-2)`)

### 3. Supabase 클라이언트 분리

```typescript
// ✅ 클라이언트 컴포넌트 ('use client')
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// ✅ 서버 컴포넌트/API Routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()  // await 필수!
```

### 4. 라우트 그룹 구조

- `(auth)/` → `/login`, `/signup` (최소 레이아웃)
- `(main)/` → `/journey`, `/library` (Header + Sidebar)
- `api/` → API Routes (그룹 아님)

## 주요 API 엔드포인트

**Books**: `GET /api/books/search?q={query}`

**Journeys**:
- `POST /api/journeys/create` - 여정 시작 (v0 생성)
- `GET /api/journeys?status=all&sort=latest` - 목록
- `POST /api/journeys/[id]/logs` - 기록 추가 (vN 생성)
- `POST /api/journeys/[id]/complete` - 완독 (vFinal 생성)

**Music**: `POST /api/music/generate` - GPT-4o-mini + Mureka

**Posts**: CRUD + like/comment/bookmark

## 개발 가이드

**코드 스타일**:
- Naming: camelCase (변수/함수), PascalCase (컴포넌트/타입)
- 파일명: kebab-case
- Import: `@/` 별칭 사용

**컴포넌트**:
1. Server Components 우선
2. 클라이언트 상태 필요시만 `'use client'`
3. 단일 책임, hooks로 재사용

### 컴포넌트 규칙 (중요!)

**⚠️ 컴포넌트 생성 전**: `src/components/CLAUDE.md` 먼저 확인!

**워크플로우**:
1. 기존 컴포넌트 확인
2. Props/variants로 재사용 시도
3. 최후의 수단으로 새 컴포넌트 생성
4. **Lucide React 아이콘 사용** (이모지 금지)

```typescript
// ✅ 재사용
<BookCard variant="library" showActions />

// ❌ 중복 생성
function MyBookCard() { /* ... */ }
```





### 에러 처리
- API: try-catch + HTTP 상태 코드
- UI: `sonner` toast
- 로딩: 음악 생성 30초~2분 고려

### 보안
- 환경 변수: `NEXT_PUBLIC_*` (클라이언트), 나머지 (서버 전용)
- RLS: 모든 테이블 활성화
- 인증: Supabase Auth
- 검증: Zod 스키마 사용

## 알려진 이슈

### 1. emotion_tags 조회

`reading_logs`에 `emotion_tags` 필드 없음 → `log_emotions` 테이블로 조인 필요

```typescript
// ❌ 에러
select('*, emotion_tags')

// ✅ 올바름
select(`
  *,
  log_emotions!inner (
    emotion_tags (id, name, color)
  )
`)
```

### 2. Framer Motion 에러

**문제**: `motion is not defined`

**해결**:
```typescript
'use client'  // 필수
import { motion } from 'framer-motion'
```

## 개발 상태

**현재**: ✅ Phase 10 완료 (마이페이지)  
**다음**: Phase 11 (UI/UX 개선 - 다크모드, 반응형, 접근성)

**주요 완료 기능**:
- ✅ 인증, 도서 검색, 독서 여정 관리
- ✅ 음악 생성 (v0, vN, vFinal)
- ✅ 커뮤니티 (게시판, 좋아요, 댓글, 스크랩)
- ✅ 마이페이지 (프로필, 통계, 보관함)

## 중요 원칙

**금지**:
- ❌ 이모지 사용 (Lucide React 아이콘만)
- ❌ bash sed/awk (MCP filesystem 도구 사용)
- ❌ Next.js 15에서 params await 생략
- ❌ emotion_tags 직접 조회 (log_emotions 조인 필요)
- ❌ `.env.local` 커밋

**필수**:
- ✅ 컴포넌트 생성 전 `src/components/CLAUDE.md` 확인
- ✅ Server Components 우선, 필요시만 `'use client'`
- ✅ RLS 정책 활성화
- ✅ MCP filesystem 도구 우선 사용
- ✅ 타입 안전성 유지

---

**참고 문서**:
- [src/components/CLAUDE.md](./src/components/CLAUDE.md) - 컴포넌트 가이드
- [PRD_instruction.md](./PRD_instruction.md) - 제품 요구사항
- [execution_plan.md](./execution_plan.md) - 개발 계획
