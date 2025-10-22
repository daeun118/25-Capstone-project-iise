# BookBeats 배포 가이드

**목표 플랫폼**: Vercel (권장)
**현재 상태**: 배포 준비 완료 ✅
**예상 성능**: 로컬 대비 3-5배 향상

---

## 🎯 Vercel 배포 방법 (권장)

### 1. Vercel 계정 준비

1. [Vercel 회원가입](https://vercel.com/signup)
2. GitHub 계정 연동 (권장) 또는 GitLab/Bitbucket 사용

### 2. Git 저장소 준비

현재 프로젝트를 GitHub에 푸시합니다:

```bash
# GitHub에서 새 저장소 생성 (예: bookbeats)
# 로컬에서 remote 설정
git remote add origin https://github.com/YOUR_USERNAME/bookbeats.git

# 푸시
git push -u origin refactor/phase-11-ui-ux

# main 브랜치로 병합 (선택)
git checkout -b main
git merge refactor/phase-11-ui-ux
git push -u origin main
```

### 3. Vercel 프로젝트 생성

**방법 1: Vercel CLI (빠름)**

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포 시작
vercel

# 프로덕션 배포
vercel --prod
```

**방법 2: Vercel 대시보드 (GUI)**

1. [Vercel Dashboard](https://vercel.com/new)에서 "Import Project" 클릭
2. GitHub 저장소 선택 (`bookbeats`)
3. Framework Preset: **Next.js** 자동 감지
4. Root Directory: `.` (기본값)
5. Build Command: `npm run build` (자동 설정)
6. Output Directory: `.next` (자동 설정)

### 4. 환경 변수 설정

**Vercel Dashboard** → **Settings** → **Environment Variables**에서 다음 변수 추가:

#### 필수 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://oelgskajaisratnbffip.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (GPT-4o-mini)
OPENAI_API_KEY=sk-proj-...

# Mureka (음악 생성)
MUREKA_API_KEY=your_mureka_api_key
```

#### 선택 환경 변수

```env
# Kakao OAuth (선택)
KAKAO_CLIENT_ID=your_kakao_client_id
```

**주의사항**:
- `NEXT_PUBLIC_*` 변수는 Production, Preview, Development 모두 체크
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`는 Production만 체크 (보안)

### 5. 배포 실행

#### CLI 사용 시:

```bash
vercel --prod
```

#### 대시보드 사용 시:

1. Settings에서 환경 변수 저장 후
2. Deployments 탭에서 "Redeploy" 또는
3. main 브랜치에 push하면 자동 배포

### 6. 배포 확인

```
✅ Deployment successful!
🌍 Production: https://bookbeats.vercel.app
```

배포 완료 후:
1. URL 접속하여 동작 확인
2. 로그인 테스트
3. 독서 여정 생성 테스트
4. 성능 확인 (DevTools Network 탭)

---

## 🔧 Vercel 프로젝트 설정 최적화

### 1. Build & Development Settings

**Vercel Dashboard** → **Settings** → **General**

```yaml
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

### 2. 도메인 설정 (선택)

**Vercel Dashboard** → **Settings** → **Domains**

```
bookbeats.vercel.app (자동 제공)
www.bookbeats.com (커스텀 도메인 추가 가능)
```

### 3. Git 자동 배포 설정

**Vercel Dashboard** → **Settings** → **Git**

```yaml
Production Branch: main
Preview Branches: All branches
Auto Deploy: Enabled
```

---

## 🚀 배포 후 성능 확인

### 1. 성능 측정

배포 후 실제 성능을 측정합니다:

```bash
# 로컬 측정 (비교용)
npm run test:performance

# 프로덕션 성능 확인
# Chrome DevTools → Network 탭에서 측정
# - API 응답 시간
# - 페이지 로드 시간
# - FCP (First Contentful Paint)
# - LCP (Largest Contentful Paint)
```

### 2. 예상 성능 향상

| 항목 | 로컬 환경 | Vercel 프로덕션 | 개선율 |
|------|----------|----------------|--------|
| API 응답 | 954ms | **200-300ms** | 3-5배 ⬆️ |
| 페이지 로드 | 2461ms | **800-1200ms** | 2-3배 ⬆️ |
| Cold Start | 1457ms | **50-100ms** | 10-15배 ⬆️ |

### 3. 성능 개선 요인

- ✅ Edge Functions (전 세계 CDN)
- ✅ Supabase 프로덕션 인스턴스
- ✅ Next.js Production Build 최적화
- ✅ HTTP/2, Brotli 압축
- ✅ Static Generation (정적 페이지)
- ✅ 설계 최적화 완료 (N+1 쿼리 제거 등)

---

## 📊 추가 최적화 (배포 후)

### 1. 데이터베이스 인덱스 추가 (우선순위: 높음)

Supabase SQL Editor에서 실행:

```sql
-- reading_journeys 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_journeys_user_status_date
ON reading_journeys(user_id, status, started_at DESC);

-- reading_logs 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_logs_journey_created
ON reading_logs(journey_id, created_at DESC);

-- music_tracks 상태 인덱스
CREATE INDEX IF NOT EXISTS idx_music_status
ON music_tracks(status)
WHERE status = 'generating';

-- posts 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_user_created
ON posts(user_id, created_at DESC);

-- 인덱스 확인
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**예상 효과**: 30-50% 추가 성능 개선

### 2. 이미지 최적화 (우선순위: 중간)

`next.config.ts` 최적화:

```typescript
const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'books.google.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // 최신 포맷 우선
    deviceSizes: [640, 750, 828, 1080, 1200], // 반응형 크기
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // 작은 이미지 크기
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일 캐싱
  },
};
```

**예상 효과**: 이미지 용량 80-90% 감소, LCP 개선

### 3. Analytics 설정 (선택)

**Vercel Analytics** 활성화:

```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🔍 트러블슈팅

### 문제 1: 빌드 실패

**증상**: `Error: Build failed`

**원인**: 환경 변수 누락 또는 타입 에러

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 에러 확인
npm run build 2>&1 | grep "error TS"
```

### 문제 2: API 500 에러

**증상**: 프로덕션에서 API 호출 실패

**원인**: 환경 변수 미설정

**해결**:
1. Vercel Dashboard → Settings → Environment Variables 확인
2. `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 등 필수 변수 확인
3. Redeploy

### 문제 3: 음악 생성 실패

**증상**: 음악 프롬프트 생성 안 됨

**원인**: `OPENAI_API_KEY` 또는 `MUREKA_API_KEY` 누락

**해결**:
1. Environment Variables에서 API 키 확인
2. OpenAI API 사용량 확인 (https://platform.openai.com/usage)
3. Mureka MCP 연결 상태 확인

### 문제 4: Supabase 연결 실패

**증상**: DB 쿼리 타임아웃 또는 실패

**원인**: RLS 정책 또는 네트워크 문제

**해결**:
1. Supabase Dashboard에서 RLS 정책 확인
2. Connection Pooling 설정 확인
3. Supabase 로그 확인 (Logs & Reports)

---

## 📝 배포 체크리스트

### 배포 전

- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 타입 에러 없음 (`npm run build`)
- [ ] E2E 테스트 통과 (`npm test`)
- [ ] 환경 변수 정리 (`.env.local` → `.env.example` 참고)
- [ ] Git 커밋 & 푸시 완료

### Vercel 설정

- [ ] 환경 변수 모두 설정
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `MUREKA_API_KEY`
- [ ] Production 브랜치 설정 (main)
- [ ] Auto Deploy 활성화

### 배포 후

- [ ] 프로덕션 URL 접속 확인
- [ ] 로그인/회원가입 테스트
- [ ] 독서 여정 생성 테스트
- [ ] 음악 프롬프트 생성 테스트
- [ ] 게시판 CRUD 테스트
- [ ] 성능 측정 (Chrome DevTools)
- [ ] DB 인덱스 추가 (SQL 실행)

---

## 🎓 추가 리소스

**Vercel 공식 문서**:
- [Next.js 배포 가이드](https://vercel.com/docs/frameworks/nextjs)
- [환경 변수 설정](https://vercel.com/docs/projects/environment-variables)
- [도메인 설정](https://vercel.com/docs/projects/domains)

**Next.js 공식 문서**:
- [프로덕션 빌드](https://nextjs.org/docs/pages/building-your-application/deploying)
- [성능 최적화](https://nextjs.org/docs/pages/building-your-application/optimizing)

**Supabase 공식 문서**:
- [프로덕션 체크리스트](https://supabase.com/docs/guides/platform/going-into-prod)
- [성능 최적화](https://supabase.com/docs/guides/database/performance)

---

**작성일**: 2025-10-22
**작성**: Claude Code
**참고**: `claudedocs/performance-optimization-report.md`
