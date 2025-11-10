# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# ReadTune - 독서 여정 플랫폼

독서 과정을 AI 생성 음악으로 기록하고 공유하는 웹 서비스. 각 독서 단계마다 음악이 자동 생성되어 완독 시 플레이리스트가 완성됩니다.

**핵심 플로우**: 책 선택(v0) → 독서 기록(v1~vN) → 완독(vFinal) → 플레이리스트 완성

**현재 상태**: Phase 12 배포 완료 + 플레이리스트 크로스페이드 기능 추가 ✅
**Production**: https://25-capstone-project-iise.vercel.app
**마지막 업데이트**: 2025-01-30

---

## 필수 명령어

### 개발 서버
```bash
npm run dev              # 개발 서버 (포트 3000, 자동 정리)
npm run dev:raw          # Raw Next.js 개발 서버 (Turbopack)
npm run build            # Production 빌드 (Turbopack)
npm start                # Production 서버 시작
```

**서버 관리** (포트 충돌 발생 시):
```bash
npm run server:status    # 서버 상태 확인
npm run server:kill      # 포트 3000 프로세스 강제 종료
# 그 후: npm run dev
```

### 테스트
```bash
# E2E 테스트 (Playwright)
npm test                 # Headless 모드
npm run test:ui          # UI 모드 (권장 - 시각적 디버깅)
npm run test:headed      # Headed 모드 (브라우저 표시)
npm run test:debug       # 디버그 모드

# 단일 테스트 실행
npx playwright test tests/e2e/auth.spec.ts              # 특정 파일
npx playwright test -g "독서 여정 시작"                   # 특정 테스트
npx playwright test --headed --debug                    # 디버그 모드
npx playwright test --trace on                          # Trace 기록
npx playwright show-report                              # 테스트 리포트

# 유틸리티 테스트 스크립트
npm run test:music-flow      # 음악 생성 플로우 테스트
npm run test:complete-flow   # 완독 플로우 테스트
npm run test:library         # 라이브러리 테스트
npm run test:performance     # 성능 측정
```

### DB 타입 생성 (스키마 변경 시 필수)
```bash
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
```

### 트러블슈팅
- **포트 충돌**: `npm run server:kill` → `npm run dev`
- **빌드 에러**: `rm -rf .next` → `npm run build`
- **DB 타입 에러**: DB 타입 재생성 후 빌드
- **Playwright 실패**: `npx playwright install` (브라우저 설치)
- **Background processes**: 개발 서버 종료 전 `npm run server:kill` 실행 권장

---

## 기술 스택

**Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion
**Backend**: Supabase (PostgreSQL, Auth, Storage)
**AI**: GPT-4o-mini (음악 프롬프트), Mureka MCP (음악 생성)
**State**: Zustand, React Hook Form + Zod
**Icons**: Lucide React (**이모지 절대 금지**)
**Testing**: Playwright
**Deployment**: Vercel (자동 배포: main 브랜치 push)
**Design**: 라이트 모드 전용 (다크모드 제거됨), 미니멀 디자인

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/              # 로그인/회원가입 (최소 레이아웃)
│   ├── (main)/              # 메인 앱 (Header + Sidebar)
│   │   ├── journey/[id]/    # 독서 여정 상세
│   │   ├── library/         # 내 책장
│   │   ├── feed/            # 커뮤니티 피드
│   │   └── my/              # 마이페이지
│   └── api/                 # API Routes (Next.js 15 async params)
│
├── components/
│   ├── ui/                  # shadcn/ui 기본 컴포넌트
│   ├── journey/             # 독서 여정 UI
│   ├── music/               # 음악 플레이어
│   ├── post/                # 게시물 UI
│   └── CLAUDE.md            # 컴포넌트 재사용 가이드 ⭐ 필독
│
├── lib/
│   ├── supabase/            # client.ts, server.ts
│   ├── openai/client.ts     # 3단계 음악 프롬프트 생성 ⭐
│   ├── mureka/              # Mureka API 클라이언트
│   └── google-books/        # Google Books API
│
├── services/                # 비즈니스 로직 레이어 (의존성 주입) ⭐
│   ├── journey.service.ts
│   ├── music.service.ts
│   ├── user.service.ts
│   └── audio-crossfade-manager.ts  # Web Audio API 크로스페이드 ⭐
│
├── repositories/            # 데이터 접근 레이어 (Repository 패턴) ⭐
│   ├── base.repository.ts
│   ├── journey.repository.ts
│   ├── music.repository.ts
│   └── log.repository.ts
│
├── hooks/                   # Custom React Hooks
│   └── useMusicPlayer.ts    # 플레이리스트 + 크로스페이드 통합 ⭐
│
└── types/                   # TypeScript 타입 정의
    └── database.ts          # Supabase 생성 타입

scripts/                     # 개발/테스트 유틸리티 스크립트
```

**⭐ 핵심 파일**:
- `src/lib/openai/client.ts` - 3단계 음악 프롬프트 생성 로직 (v0/vN/vFinal)
- `src/services/audio-crossfade-manager.ts` - Web Audio API 기반 Equal Power Crossfade
- `src/hooks/useMusicPlayer.ts` - 플레이리스트 관리 + 크로스페이드 통합
- `src/components/music/MusicPlayerBar.tsx` - 하단 재생 바 (Spotify 스타일)
- `src/components/auth/AuthRequired.tsx` - 로그인 필요 안내 (비로그인 UX)
- `src/components/CLAUDE.md` - **컴포넌트 생성 전 필수 확인**
- `src/services/` - 비즈니스 로직 레이어
- `src/repositories/` - 데이터 접근 레이어

---

## 핵심 아키텍처 패턴

**중요**: 모든 코드 변경은 아래 패턴을 준수해야 함

### 1. 레이어드 아키텍처 (필수)

**플로우**: `API Route → Service → Repository → Database`

```typescript
// Repository: DB 쿼리만 (데이터 접근 레이어)
export class JourneyRepository extends BaseRepository {
  async findByUserId(userId: string) {
    return this.db.from('reading_journeys')
      .select('*')
      .eq('user_id', userId);
  }
}

// Service: 비즈니스 로직 + 의존성 주입 (비즈니스 레이어)
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

// API Route: HTTP 요청/응답만 (프레젠테이션 레이어)
export async function POST(req: Request) {
  const service = new JourneyService(journeyRepo, musicService);
  return Response.json(await service.create(userId, dto));
}
```

**왜 이 패턴인가?**:
- **관심사의 분리**: 각 레이어는 하나의 책임만
- **테스트 용이성**: 각 레이어를 독립적으로 테스트 가능
- **유지보수성**: 비즈니스 로직 변경 시 Service만 수정
- **재사용성**: Service는 다른 API Route에서도 재사용 가능

### 2. Next.js 15 - Dynamic Route Params (중요!)

```typescript
// ❌ Next.js 14 방식 (작동 안 함)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;  // 에러!
}

// ✅ Next.js 15 방식 (await 필수)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // 올바름
}
```

### 3. 3단계 음악 생성 플로우 (핵심 비즈니스 로직)

**파일**: `src/lib/openai/client.ts:12` → `generateMusicPrompt()`

```typescript
// v0: 책 정보만 → 첫 음악 (anticipatory mood)
// vN: 최근 2개 로그 + 새 입력 → 진화하는 음악 (누적 컨텍스트)
// vFinal: 전체 히스토리 → 피날레 음악 (synthesis)
```

**GPT-4o-mini 설정**:
- Model: `gpt-4o-mini`
- Temperature: `0.8` (창의성)
- Response Format: `{ type: 'json_object' }`
- Context Window: 최근 2개 로그만 (`previousLogs.slice(-2)`)
- Output: `{ prompt, genre, mood, tempo, description }`
- **크로스페이드 최적화**: 템포 일관성(±10-15 BPM), 페이드 인/아웃

**⚠️ 주의**:
- 현재는 프롬프트만 생성 (Mureka MCP 음악 생성 미구현)
- 이 로직 변경 시 반드시 기존 프롬프트 검증 필요

### 4. Supabase 클라이언트 분리

```typescript
// ✅ 클라이언트 컴포넌트 ('use client')
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// ✅ 서버 컴포넌트/API Routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()  // await 필수!
```

---

## 데이터베이스 (Supabase)

**주요 테이블**:
- `users` - 사용자 (Auth 연동)
- `reading_journeys` - 독서 여정 (책 정보, 상태, 리뷰)
- `reading_logs` - 독서 기록 (v0, v1, v2..., 음악 참조)
- `music_tracks` - 음악 파일 (프롬프트, 파일 URL, 상태)
- `emotion_tags` - 감정 태그 (프리셋 + 커스텀)
- `log_emotions` - 로그-감정 연결 테이블 (다대다)
- `posts`, `comments`, `likes`, `bookmarks` - 커뮤니티

**⚠️ 중요**: `emotion_tags`는 `reading_logs`에 직접 없음 → `log_emotions` 조인 필수

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

**보안**: 모든 테이블 RLS 활성화 (사용자는 자신의 데이터만 접근)

**성능 최적화** (중요!):
- **인덱스**: 29개 전략적 인덱스 추가 (복합 인덱스, 부분 인덱스)
- **복합 인덱스**: `idx_reading_journeys_user_status_started (user_id, status, started_at DESC)`
- **부분 인덱스**: `idx_posts_published_created_at (created_at DESC) WHERE is_published = true`
- **측정 결과**: 피드 72% 개선, 책장 71% 개선 (Production 환경)

---

## 개발 가이드

### 코드 스타일
- **Naming**: camelCase (변수/함수), PascalCase (컴포넌트/타입)
- **파일명**: kebab-case
- **Import**: `@/` 별칭
- **절대 금지**: 이모지 사용 (Lucide React 아이콘만)
- **스타일링**: Tailwind CSS 클래스 사용 (인라인 스타일 금지)
- **디자인**: 라이트 모드 전용 (다크모드 관련 코드 제거됨)

### 컴포넌트 개발 워크플로우
1. **`src/components/CLAUDE.md` 먼저 확인** (재사용 가이드)
2. 기존 컴포넌트 재사용 (Props/variants 활용)
3. Server Components 우선 (`'use client'`는 필요시만)
4. 단일 책임 원칙

### MCP 도구 사용
**파일 작업**: MCP filesystem 도구 사용 (bash sed/awk 금지)

```typescript
// ✅ 사용
mcp__filesystem__read_text_file({ path: "..." })
mcp__filesystem__edit_file({ path: "...", edits: [...] })

// ❌ 금지
bash("sed -i 's/old/new/g' file.tsx")
```

**활성화된 MCP 서버**: filesystem, supabase, playwright, github, context7

### 에러 처리
- **API**: try-catch + HTTP 상태 코드
- **UI**: `sonner` toast
- **비동기**: 로딩 상태 표시 (음악 생성 30초~2분)

### 성능 최적화 패턴

**N+1 쿼리 방지** - JOIN을 사용한 단일 쿼리로 해결:

```typescript
// ❌ N+1 쿼리 (여러 번 DB 호출)
const journeys = await db.from('reading_journeys').select('*');
for (const journey of journeys) {
  const user = await db.from('users').select('*').eq('id', journey.user_id).single();
  const logs = await db.from('reading_logs').select('*').eq('journey_id', journey.id);
}

// ✅ 단일 쿼리 (JOIN 사용)
const journeys = await db.from('reading_journeys').select(`
  *,
  users (id, nickname, avatar_url),
  reading_logs (*)
`);
```

**이미지 최적화**:
- Next.js Image 컴포넌트 필수 사용
- AVIF/WebP 자동 변환 (next.config.ts 설정)
- `quality={85}` 기본값
- LCP 최적화: 첫 화면 이미지는 `priority` prop
- 나머지는 lazy loading (기본값)

```typescript
// ✅ 올바른 이미지 사용
import Image from 'next/image';

<Image
  src={bookCover}
  alt={bookTitle}
  width={200}
  height={300}
  quality={85}
  priority={isAboveFold}  // 첫 화면만 true
/>
```

### 보안 (중요!)
- **환경 변수**: `NEXT_PUBLIC_*` (클라이언트 노출), 나머지 (서버 전용)
- **절대 금지**: API 토큰을 클라이언트 코드에 하드코딩
- **RLS**: 모든 테이블 활성화 (사용자는 자신의 데이터만 접근)
- **공개 데이터**: RLS 정책에 `USING (true)` 또는 `USING (is_published = true)` 추가
- **인증**: Supabase Auth (세션 기반)
- **검증**: Zod 스키마 (API 요청/응답 모두)

**환경 변수 체크리스트**:
- `.env.local` 파일 생성 (`.env.example` 참고)
- `.env.local`은 `.gitignore`에 포함 (절대 커밋 금지)
- Vercel 배포: Environment Variables에서 설정
- Production/Preview 환경 별도 관리

### Git 워크플로우 (중요!)

**⚠️ 중요**: 사용자가 "깃에 올리고 푸시해줘" 요청 시 **반드시 main 브랜치까지 푸시**해야 함

```bash
# 1. Feature 브랜치 생성 및 커밋
git checkout -b feature/[feature-name]
git add [files]
git commit -m "feat: [description]"
git push -u origin feature/[feature-name]

# 2. Main 브랜치에 merge 및 푸시 (필수!)
git checkout main
git merge feature/[feature-name]
git push origin main
```

**커밋 메시지 규칙**:
- `feat:` - 새 기능
- `fix:` - 버그 수정
- `docs:` - 문서 변경
- `refactor:` - 리팩토링
- `style:` - 코드 스타일 (포맷팅)
- `test:` - 테스트 추가/수정
- `design:` - UI/UX 디자인 변경

**자동 배포**: main 브랜치 push → Vercel 자동 배포

---

## 주요 API 엔드포인트

**Books**: `GET /api/books/search?q={query}`

**Journeys**:
- `POST /api/journeys/create` - 여정 시작 (v0 생성)
- `GET /api/journeys?status=all&sort=latest` - 목록
- `GET /api/journeys/[id]` - 여정 상세 (완독 시 플레이리스트 포함)
- `POST /api/journeys/[id]/logs` - 기록 추가 (vN 생성)
- `POST /api/journeys/[id]/complete` - 완독 (vFinal 생성)

**Music**: `POST /api/music/generate` - GPT-4o-mini 프롬프트 생성

**Posts**: CRUD + like/comment/bookmark

---

## 알려진 이슈 및 해결방법

### 1. Framer Motion 에러
**문제**: `motion is not defined`
**해결**: 컴포넌트에 `'use client'` 추가 + MotionProvider 사용

### 2. 포트 3000 충돌
**문제**: `EADDRINUSE`
**해결**: `npm run server:kill` → `npm run dev`

### 3. Playwright 테스트 타임아웃
**문제**: 음악 생성 API 호출 시 타임아웃
**해결**: `playwright.config.ts`에서 타임아웃 설정 확인 (현재 60초)

---

## 개발 상태 및 다음 단계

**현재**: ✅ Phase 12 완료 (Vercel 배포) + 플레이리스트 크로스페이드 기능 완료
**Production**: https://25-capstone-project-iise.vercel.app
**다음**: Phase 13 - 앨범커버 생성 (DALL-E 3)

**배포 프로세스**:
- main 브랜치 push → Vercel 자동 배포
- PR 생성 → Preview 배포 (테스트용)
- 배포 로그: Vercel 대시보드에서 확인

**최근 개선사항** (2025-01-30):
- ✅ **디자인 시스템 통합** - 인라인 스타일 제거, Tailwind CSS 표준화
- ✅ **Suno 스타일 피드 레이아웃** - 카드 기반 그리드 레이아웃
- ✅ **다크모드 제거** - 라이트 모드 전용 단순화
- ✅ **Footer 제거** - 미니멀 디자인 적용

**이전 개선사항** (2025-01-23~28):
- ✅ **이미지 최적화** - AVIF/WebP 자동 변환, 80-90% 용량 감소
- ✅ **DB 인덱스 최적화** - 29개 인덱스, 피드 72% 개선
- ✅ **회원가입 UX 개선** - 이메일 확인 프로세스 개선
- ✅ **피드 공개 조회** - RLS 정책 수정
- ✅ **음악 재생 바 개선** - Spotify 스타일, 크로스페이드
- ✅ **플레이리스트 자동 재생** - Web Audio API 기반 크로스페이드

**완료된 최적화** (Phase 11):
- N+1 쿼리 제거: 11개 → 1개 JOIN (60-70% 성능 개선)
- React 메모이제이션: 리렌더 80% 감소
- CSS Transitions: 메모리 90% 감소, 60fps 유지
- 적응형 폴링: API 호출 40% 감소

**미완료 기능** (Phase 13+):
- Mureka MCP 실제 음악 생성 (현재 프롬프트만)
- 실시간 업데이트 (Supabase Realtime)
- 앨범커버 생성 (DALL-E 3)
- 고급 통계 대시보드

---

## 중요 원칙

**금지**:
- ❌ 이모지 사용 (Lucide React 아이콘만)
- ❌ 인라인 스타일 (Tailwind CSS 클래스 사용)
- ❌ 다크모드 관련 코드 추가 (제거됨)
- ❌ bash sed/awk (MCP filesystem 도구 사용)
- ❌ Next.js 15에서 params await 생략
- ❌ emotion_tags 직접 조회 (log_emotions 조인 필요)
- ❌ `.env.local` 커밋

**필수**:
- ✅ 컴포넌트 생성 전 `src/components/CLAUDE.md` 확인
- ✅ Server Components 우선, 필요시만 `'use client'`
- ✅ 레이어드 아키텍처 준수 (API → Service → Repository → DB)
- ✅ MCP filesystem 도구 우선 사용
- ✅ 타입 안전성 유지

---

## 빠른 참조

**컴포넌트 개발**:
1. `src/components/CLAUDE.md` 확인
2. 기존 컴포넌트 재사용
3. Props/variants 활용
4. 새 컴포넌트 생성 (최후의 수단)

**API 개발**:
1. Repository 확인 (데이터 접근)
2. Service 작성 (비즈니스 로직)
3. API Route 작성 (HTTP 처리)
4. Zod 스키마 검증

**테스트 개발**:
1. `tests/e2e/` 확인
2. Playwright 작성
3. `npm run test:ui` 실행
4. 디버깅: `--headed --debug`

**환경 변수**:
- `.env.example` → `.env.local` 복사
- Supabase, OpenAI, Mureka, Kakao 키 설정
- Vercel에도 동일하게 설정

---

**참고 문서**:
- [src/components/CLAUDE.md](./src/components/CLAUDE.md) - 컴포넌트 재사용 가이드
- [PRD_instruction.md](./PRD_instruction.md) - 제품 요구사항
- [execution_plan.md](./execution_plan.md) - 개발 계획
- [claudedocs/performance-optimization-report.md](./claudedocs/performance-optimization-report.md) - 성능 최적화 상세
- [claudedocs/music-generation-api-guide.md](./claudedocs/music-generation-api-guide.md) - 음악 생성 API 가이드 ⭐
