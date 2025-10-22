# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# BookBeats - 독서 여정 플랫폼

독서 과정을 AI 생성 음악으로 기록하고 공유하는 웹 서비스. 각 독서 단계마다 음악이 자동 생성되어 완독 시 플레이리스트가 완성됩니다.

**핵심 플로우**: 책 선택(v0) → 독서 기록(v1~vN) → 완독(vFinal) → 플레이리스트 완성

## 주요 명령어

### 개발 & 빌드
```bash
# 개발 서버 (포트 3000 자동 정리)
npm run dev              # 권장 - 자동 포트 관리
npm run dev:raw          # Turbopack만 (포트 관리 없음)

# 서버 관리
npm run server:status    # 포트 3000 상태 확인
npm run server:kill      # 포트 3000 강제 종료

# 빌드 & 배포
npm run build            # Production 빌드
npm start                # Production 서버 실행
```

### 테스트
```bash
# E2E 테스트 (Playwright)
npm test                 # Headless 모드
npm run test:ui          # UI 모드 (권장)
npm run test:headed      # Headed 모드 (브라우저 표시)
npm run test:debug       # 디버그 모드
npm run test:report      # 테스트 리포트 보기

# 플로우 테스트 (Node 스크립트)
npm run test:music-flow      # 음악 생성 플로우
npm run test:complete-flow   # 완독 플로우
npm run test:library         # 라이브러리 기능
```

### 데이터베이스
```bash
# 타입 생성 (DB 스키마 변경 시)
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
```

**Troubleshooting**:
- 포트 충돌: `npm run server:kill` → `npm run dev`
- 빌드 에러: `rm -rf .next` → `npm run build`
- 타입 에러: DB 타입 재생성 → `npm run build`
- Framer Motion 에러: `node scripts/fix-framer-motion.js`

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
│   ├── mureka/             # Mureka API 클라이언트
│   └── google-books/       # Google Books API
│
├── hooks/                   # Custom React Hooks
├── services/                # 비즈니스 로직 레이어 ⭐
├── repositories/            # 데이터 접근 레이어 ⭐
└── types/                   # TypeScript 타입
    └── dto/                # Data Transfer Objects
```

**⭐ 핵심 파일**:
- `src/lib/openai/client.ts` - 3단계 음악 생성 로직
- `src/components/CLAUDE.md` - 컴포넌트 사용 전 필수 확인
- `src/services/*.service.ts` - 비즈니스 로직 (의존성 주입 패턴)
- `src/repositories/*.repository.ts` - DB 접근 (Repository 패턴)

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

### 1. 레이어드 아키텍처 (Repository + Service Pattern)

```typescript
// ✅ 레이어 분리
API Route → Service → Repository → Database

// Repository Layer - 데이터 접근만 담당
export class JourneyRepository extends BaseRepository<Journey> {
  async findByUserId(userId: string) {
    return this.db.from('reading_journeys').select('*').eq('user_id', userId);
  }
}

// Service Layer - 비즈니스 로직 담당
export class JourneyService {
  constructor(
    private journeyRepo: IJourneyRepository,
    private musicService: IMusicService
  ) {}
  
  async create(userId: string, dto: CreateJourneyDto) {
    const journey = await this.journeyRepo.create({...});
    await this.musicService.generateV0Music({...});
    return journey;
  }
}

// API Route - 요청/응답 처리만
export async function POST(req: Request) {
  const service = new JourneyService(journeyRepo, musicService);
  const result = await service.create(userId, dto);
  return Response.json(result);
}
```

**원칙**:
- Repository: DB 쿼리만 (비즈니스 로직 없음)
- Service: 비즈니스 로직 + 트랜잭션 관리
- API Route: HTTP 요청/응답 처리만

### 2. Next.js 15 - Dynamic Route Params (중요!)

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

### 3. 3단계 음악 생성 플로우 (핵심 비즈니스 로직)

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

### 4. Supabase 클라이언트 분리

```typescript
// ✅ 클라이언트 컴포넌트 ('use client')
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// ✅ 서버 컴포넌트/API Routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()  // await 필수!
```

### 5. 라우트 그룹 구조

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
- **절대 금지**: 이모지 사용 (Lucide React 아이콘만 허용)

**컴포넌트 원칙**:
1. Server Components 우선 (RSC)
2. 클라이언트 상태 필요시만 `'use client'`
3. 단일 책임 원칙 (SRP)
4. Props 인터페이스 명시
5. Variant 시스템 활용

**아키텍처 원칙**:
1. **레이어 분리**: API Route → Service → Repository → DB
2. **의존성 주입**: 생성자로 의존성 주입
3. **인터페이스 우선**: 구현보다 인터페이스에 의존
4. **단일 책임**: 각 레이어는 하나의 책임만

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
- **API Routes**: try-catch + 적절한 HTTP 상태 코드
- **UI**: `sonner` toast 사용
- **비동기 작업**: 로딩 상태 표시 (음악 생성 30초~2분)
- **Repository**: 데이터베이스 에러를 도메인 에러로 변환
- **Service**: 비즈니스 로직 검증 + 에러 처리

### 보안
- **환경 변수**: `NEXT_PUBLIC_*` (클라이언트), 나머지 (서버 전용)
- **RLS**: 모든 테이블 활성화 (사용자는 자신의 데이터만 접근)
- **인증**: Supabase Auth (세션 기반)
- **검증**: Zod 스키마로 입력 검증
- **Authorization**: Service 레이어에서 권한 확인

## 알려진 이슈 및 해결방법

### 1. emotion_tags 조회 (다대다 관계)

`reading_logs`에 `emotion_tags` 필드 없음 → `log_emotions` 테이블로 조인 필요

```typescript
// ❌ 에러 - emotion_tags 컬럼은 reading_logs에 없음
select('*, emotion_tags')

// ✅ 올바름 - log_emotions 중간 테이블을 통해 조인
select(`
  *,
  log_emotions!inner (
    emotion_tags (id, name, color)
  )
`)

// 또는 별도 쿼리로 가져오기
const { data: logEmotions } = await supabase
  .from('log_emotions')
  .select('emotion_tags(id, name, color)')
  .eq('log_id', logId);
```

### 2. Framer Motion 트리 쉐이킹 에러

**문제**: `motion is not defined` 또는 빌드 에러

**해결**:
```typescript
// 1. 'use client' 필수
'use client'
import { motion } from 'framer-motion'

// 2. MotionProvider로 감싸기 (layout.tsx에서)
import { MotionProvider } from '@/components/providers/MotionProvider'

<MotionProvider>
  {children}
</MotionProvider>
```

**참고**: `scripts/fix-framer-motion.js` 스크립트로 자동 수정 가능

### 3. 포트 3000 충돌

**문제**: `EADDRINUSE: address already in use :::3000`

**해결**:
```bash
# 자동 해결 (dev 스크립트에 내장)
npm run dev

# 수동 해결
npm run server:kill
npm run dev:raw
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
