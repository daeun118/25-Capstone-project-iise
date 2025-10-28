# 📐 ReadTune 프론트엔드 & 디자인 리팩토링 계획

**작성일**: 2025-10-22  
**Phase**: 11 (UI/UX 개선)  
**목적**: 코드 품질 향상, 디자인 시스템 일관성, 성능 최적화

---

## 🎯 목표

### 1. 코드 품질 (Code Quality)
- **일관성**: 컴포넌트 구조 및 패턴 통일
- **재사용성**: 중복 코드 제거, 공통 로직 추출
- **타입 안정성**: TypeScript 타입 정의 강화
- **가독성**: 명확한 네이밍 및 주석

### 2. 디자인 시스템 (Design System)
- **일관된 스타일**: Tailwind CSS 유틸리티 클래스 체계화
- **컴포넌트 변형**: variant 시스템 강화
- **접근성**: ARIA 속성, 키보드 네비게이션
- **반응형**: 모바일 최적화

### 3. 성능 최적화 (Performance)
- **번들 크기**: 동적 임포트, 코드 스플리팅
- **렌더링**: React.memo, useMemo, useCallback 최적화
- **이미지**: Next.js Image 컴포넌트 활용
- **애니메이션**: Framer Motion 최적화

---

## 📊 현황 분석

### 통계
- **총 컴포넌트 수**: 70+ (UI 30개, 도메인 40개)
- **useState/useEffect 사용**: 163개 파일에서 사용
- **TODO 주석**: 13개 발견
- **스타일 시스템**: Tailwind CSS v4 + globals.css
- **디자인 테마**: Stripe-inspired 보라/바이올렛 그라데이션

### 주요 문제점

#### 1. 코드 품질 문제
- **중복 로직**: 유사한 데이터 패칭 로직이 여러 컴포넌트에 산재
- **Props Drilling**: 깊은 컴포넌트 트리에서 props 전달
- **에러 처리 불일치**: 일부 컴포넌트는 try-catch 누락
- **TODO 미해결**: 13개 TODO 주석 (emotion_tags 조인, Mureka API 등)

#### 2. 디자인 일관성 문제
- **그라데이션 중복**: 인라인 스타일로 동일 그라데이션 반복 정의
- **Spacing 불일치**: 일부는 Tailwind 클래스, 일부는 CSS 변수 사용
- **타이포그래피**: 커스텀 클래스(.display-hero 등)와 Tailwind 혼용
- **다크모드 미완성**: .dark 정의는 있으나 컴포넌트 적용 불완전

#### 3. 성능 문제
- **과도한 재렌더링**: useEffect 의존성 배열 최적화 부족
- **번들 크기**: Framer Motion, Howler.js 등 대용량 라이브러리 전역 로드
- **이미지 최적화**: BookCover 등에서 Next.js Image 미사용
- **폴링 로직**: 음악 생성 상태 폴링에서 메모리 누수 가능성

---

## 🗂️ 리팩토링 우선순위

### Priority 1: Critical (즉시 해결)
1. **TODO 주석 해결** - 특히 emotion_tags 조인 로직
2. **메모리 누수 수정** - useEffect cleanup 함수 추가
3. **에러 경계 적용** - 주요 페이지에 ErrorBoundary 추가
4. **타입 안정성** - any 타입 제거, 엄격한 타입 정의

### Priority 2: High (Phase 11 목표)
1. **디자인 토큰 시스템 구축**
2. **다크모드 완전 구현**
3. **접근성 개선** (WCAG 2.1 AA 준수)
4. **성능 최적화** (React.memo, 코드 스플리팅)

### Priority 3: Medium (Phase 12 이전)
1. **컴포넌트 재사용성 개선**
2. **전역 상태 관리 정리** (Zustand)
3. **테스트 커버리지 확대**
4. **문서화 강화**

### Priority 4: Low (장기 과제)
1. **Storybook 도입** (컴포넌트 카탈로그)
2. **성능 모니터링** (Web Vitals)
3. **국제화 (i18n)** 준비
4. **PWA 기능** 추가

---

## 📋 세부 실행 계획

## Task 1: 디자인 토큰 시스템 구축 (2일)

### 목표
CSS 변수와 Tailwind 설정을 통합하여 일관된 디자인 토큰 시스템 구축

### 작업 내용

#### 1.1 Color Tokens 정리
**파일**: `src/app/globals.css`, `tailwind.config.ts`

**Before**:
```css
/* globals.css */
--primary: #6366f1;
--gradient-hero: linear-gradient(...);
```

```typescript
// tailwind.config.ts
// 컬러 설정 없음 (Tailwind 기본값 사용)
```

**After**:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // CSS 변수 참조
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        background: 'var(--background)',
        // ... 모든 색상 토큰
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-accent': 'var(--gradient-accent)',
        // ... 모든 그라데이션
      },
    },
  },
};
```

**이점**:
- CSS 변수와 Tailwind 클래스 일관성 확보
- 다크모드 전환 시 자동 색상 변경
- 디자인 토큰 중앙 관리

#### 1.2 Typography Tokens
**파일**: `src/app/globals.css` → `tailwind.config.ts`

**Before**:
```css
.display-hero {
  font-size: 4.5rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.04em;
}
```

**After**:
```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontSize: {
      'display-hero': ['4.5rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.04em' }],
      'display-2xl': ['4rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.03em' }],
      // ...
    },
  },
}
```

**사용**:
```tsx
// Before
<h1 className="display-hero">제목</h1>

// After
<h1 className="text-display-hero">제목</h1>
```

#### 1.3 Spacing & Radius Tokens
**파일**: `tailwind.config.ts`

```typescript
theme: {
  extend: {
    spacing: {
      'xs': 'var(--spacing-xs)',
      'sm': 'var(--spacing-sm)',
      // ...
    },
    borderRadius: {
      'sm': 'var(--radius-sm)',
      'md': 'var(--radius-md)',
      // ...
    },
  },
}
```

#### 1.4 그라데이션 유틸리티 클래스
**파일**: `src/app/globals.css`

**Before** (인라인 스타일):
```tsx
<div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }} />
```

**After** (유틸리티 클래스):
```tsx
<div className="bg-gradient-hero" />
```

**Component Layer 추가**:
```css
@layer components {
  .bg-gradient-hero {
    background: var(--gradient-hero);
  }
  .bg-gradient-accent {
    background: var(--gradient-accent);
  }
  .bg-gradient-warm {
    background: var(--gradient-warm);
  }
  .bg-gradient-cool {
    background: var(--gradient-cool);
  }
}
```

### 검증 기준
- [ ] 모든 인라인 그라데이션 스타일 제거
- [ ] Tailwind 클래스로 100% 대체 가능
- [ ] 다크모드 전환 시 색상 자동 변경
- [ ] 타입 안정성 (theme 타입 자동완성)

---

## Task 2: 다크모드 완전 구현 (3일)

### 목표
모든 컴포넌트와 페이지에서 다크모드가 올바르게 작동하도록 구현

### 작업 내용

#### 2.1 ThemeProvider 검증
**파일**: `src/components/providers/ThemeProvider.tsx`, `src/app/layout.tsx`

**확인 사항**:
```tsx
// layout.tsx
<html lang="ko" suppressHydrationWarning> {/* ✅ 필수 */}
  <body>
    <ThemeProvider
      attribute="class"        // ✅ data-theme 아님
      defaultTheme="light"     // 기본 라이트 모드
      enableSystem             // OS 설정 따라가기
      disableTransitionOnChange // 깜빡임 방지
    >
```

#### 2.2 다크모드 색상 검증
**파일**: `src/app/globals.css`

**검토 항목**:
```css
.dark {
  --background: #0a0a0a;           /* ✅ 충분히 어두움 */
  --card: #171717;                 /* ✅ 카드 배경 */
  --foreground: #fafafa;           /* ✅ 텍스트 색상 */
  --border: #2a2a2a;               /* ✅ 경계선 */
  
  /* ⚠️ 누락된 토큰 추가 필요 */
  --gradient-hero: linear-gradient(135deg, #4338ca 0%, #581c87 50%, #831843 100%);
  --shadow-primary: 0 8px 24px rgba(139, 92, 246, 0.2);
  /* ... */
}
```

#### 2.3 컴포넌트별 다크모드 적용
**대상 컴포넌트**: 모든 UI 컴포넌트 + 도메인 컴포넌트

**패턴**:
```tsx
// ❌ 하드코딩된 색상
<div className="bg-white text-black">

// ✅ 다크모드 지원 토큰 사용
<div className="bg-background text-foreground">
<div className="bg-card border-border">
```

**주요 수정 대상**:
1. **src/app/page.tsx** - Hero 섹션 그라데이션
2. **src/components/layout/Header.tsx** - 네비게이션 배경
3. **src/components/book/BookCard.tsx** - 카드 배경
4. **src/components/journey/JourneyCard.tsx** - 카드 배경
5. **src/components/post/PostCard.tsx** - 게시물 카드
6. **모든 Card 컴포넌트** - bg-white → bg-card

#### 2.4 그라데이션 다크모드 대응
**파일**: `src/app/globals.css`

**추가 CSS 변수**:
```css
.dark {
  /* 다크모드용 그라데이션 (채도 낮춤) */
  --gradient-hero: linear-gradient(135deg, #4338ca 0%, #581c87 50%, #831843 100%);
  --gradient-accent: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  --gradient-warm: linear-gradient(135deg, #be185d 0%, #dc2626 100%);
  
  /* 다크모드용 그림자 (더 강조) */
  --shadow-primary: 0 8px 24px rgba(139, 92, 246, 0.3);
  --shadow-primary-lg: 0 16px 48px rgba(139, 92, 246, 0.4);
}
```

#### 2.5 ThemeToggle 컴포넌트 개선
**파일**: `src/components/common/ThemeToggle.tsx`

**현재**:
```tsx
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // ...
}
```

**개선 (아이콘 추가)**:
```tsx
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">테마 전환</span>
    </Button>
  );
}
```

### 검증 기준
- [ ] 모든 페이지에서 다크모드 전환 시 깜빡임 없음
- [ ] 텍스트 가독성 확보 (WCAG AA 명도 대비 4.5:1 이상)
- [ ] 그라데이션이 다크모드에서도 자연스러움
- [ ] localStorage에 테마 설정 저장 및 복원
- [ ] OS 설정 따라가기 (prefers-color-scheme) 작동

---

## Task 3: 접근성 개선 (WCAG 2.1 AA) (2일)

### 목표
키보드 네비게이션, 스크린 리더 지원, 색상 대비 개선

### 작업 내용

#### 3.1 키보드 네비게이션
**대상**: 모든 인터랙티브 요소

**체크리스트**:
- [ ] Tab 키로 모든 버튼/링크 접근 가능
- [ ] Enter/Space 키로 버튼 활성화
- [ ] Esc 키로 다이얼로그/모달 닫기
- [ ] Arrow 키로 드롭다운 메뉴 네비게이션

**수정 예시**:
```tsx
// Before
<div onClick={handleClick}>클릭</div>

// After
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
>
  클릭
</button>
```

#### 3.2 ARIA 속성 추가
**대상**: 모든 커스텀 컴포넌트

**패턴**:
```tsx
// 버튼
<button aria-label="음악 재생">
  <Play />
</button>

// 폼
<label htmlFor="book-search">도서 검색</label>
<input id="book-search" aria-describedby="search-help" />
<span id="search-help" className="sr-only">도서 제목 또는 저자명을 입력하세요</span>

// 로딩 상태
<div role="status" aria-live="polite">
  {loading && <LoadingSpinner />}
</div>

// 에러 메시지
<div role="alert" aria-live="assertive">
  {error && <ErrorMessage />}
</div>
```

**주요 수정 파일**:
1. `src/components/music/MusicPlayer.tsx` - 재생 컨트롤
2. `src/components/book/BookSearchDialog.tsx` - 검색 폼
3. `src/components/common/LoadingSpinner.tsx` - 로딩 상태
4. `src/components/post/InteractionBar.tsx` - 좋아요/댓글/스크랩 버튼

#### 3.3 색상 대비 개선
**도구**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**검증 대상**:
```css
/* 라이트 모드 */
--foreground: #1a1a1a;   /* 검은색 텍스트 */
--background: #fafbfc;   /* 밝은 배경 */
/* 대비: 16:1 ✅ */

--muted: #6b7280;        /* 보조 텍스트 */
--background: #fafbfc;   /* 밝은 배경 */
/* 대비: 4.8:1 ✅ */

/* 다크 모드 */
--foreground: #fafafa;   /* 밝은 텍스트 */
--background: #0a0a0a;   /* 검은 배경 */
/* 대비: 18:1 ✅ */

--muted: #a3a3a3;        /* 보조 텍스트 */
--background: #0a0a0a;   /* 검은 배경 */
/* 대비: 5.2:1 ✅ */
```

**개선 필요 항목**:
- 그라데이션 위의 텍스트 (반투명 배경 추가)
- 링크 색상 (파란색 → primary 색상)
- 비활성 버튼 (회색 → 더 진한 회색)

#### 3.4 Focus Indicator 개선
**파일**: `src/app/globals.css`

**현재**:
```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
  border-radius: 4px;
}
```

**개선**:
```css
*:focus-visible {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  border-radius: 6px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.dark *:focus-visible {
  outline-color: var(--primary-light);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
}
```

#### 3.5 스크린 리더 전용 텍스트
**파일**: `src/app/globals.css`

**추가**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**사용 예시**:
```tsx
<button>
  <Heart className="h-4 w-4" />
  <span className="sr-only">좋아요</span>
</button>
```

### 검증 기준
- [ ] axe DevTools 검사 0 에러
- [ ] Lighthouse Accessibility 점수 95+ 
- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] NVDA/JAWS 스크린 리더 테스트 통과
- [ ] 색상 대비 WCAG AA 기준 충족

---

## Task 4: 성능 최적화 (3일)

### 목표
초기 로딩 속도, 렌더링 성능, 번들 크기 최적화

### 작업 내용

#### 4.1 React.memo 적용
**대상**: 자주 재렌더링되는 컴포넌트

**수정 파일**:
1. `src/components/book/BookCard.tsx`
2. `src/components/journey/JourneyCard.tsx`
3. `src/components/post/PostCard.tsx`
4. `src/components/music/Waveform.tsx`
5. `src/components/user/UserAvatar.tsx`

**Before**:
```tsx
export function BookCard({ book }: BookCardProps) {
  // ...
}
```

**After**:
```tsx
import { memo } from 'react';

export const BookCard = memo(function BookCard({ book }: BookCardProps) {
  // ...
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수 (선택사항)
  return prevProps.book.id === nextProps.book.id;
});
```

#### 4.2 useMemo & useCallback 최적화
**대상**: 계산 비용이 큰 작업, 콜백 함수

**패턴**:
```tsx
// Before
function JourneyList({ journeys }: Props) {
  const filteredJourneys = journeys.filter(j => j.status === 'reading');
  const handleClick = (id: string) => { /* ... */ };
  
  return (
    <div>
      {filteredJourneys.map(j => (
        <JourneyCard key={j.id} journey={j} onClick={handleClick} />
      ))}
    </div>
  );
}

// After
function JourneyList({ journeys }: Props) {
  const filteredJourneys = useMemo(
    () => journeys.filter(j => j.status === 'reading'),
    [journeys]
  );
  
  const handleClick = useCallback((id: string) => {
    /* ... */
  }, []); // 의존성 배열 최소화
  
  return (
    <div>
      {filteredJourneys.map(j => (
        <JourneyCard key={j.id} journey={j} onClick={handleClick} />
      ))}
    </div>
  );
}
```

**주요 수정 파일**:
1. `src/app/(main)/library/page.tsx` - 도서 필터링
2. `src/app/(main)/feed/page.tsx` - 게시물 정렬
3. `src/components/music/MusicPlayer.tsx` - 오디오 컨트롤
4. `src/components/journey/EmotionTagSelector.tsx` - 태그 필터링

#### 4.3 코드 스플리팅 (동적 임포트)
**대상**: 대용량 라이브러리, 조건부 렌더링 컴포넌트

**Before**:
```tsx
import { motion } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';
import { Howl } from 'howler';

export default function Page() {
  return <motion.div>...</motion.div>;
}
```

**After**:
```tsx
import dynamic from 'next/dynamic';

// Framer Motion 동적 임포트
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => mod.motion.div),
  { ssr: false }
);

// Waveform 동적 임포트 (조건부)
const Waveform = dynamic(
  () => import('@/components/music/Waveform'),
  { ssr: false, loading: () => <WaveformSkeleton /> }
);

export default function Page() {
  return <MotionDiv>...</MotionDiv>;
}
```

**주요 수정 파일**:
1. `src/app/page.tsx` - Framer Motion (200KB+)
2. `src/components/music/MusicPlayer.tsx` - Howler.js (100KB+)
3. `src/components/music/Waveform.tsx` - WaveSurfer.js (150KB+)

#### 4.4 이미지 최적화
**대상**: 도서 표지, 앨범커버, 아바타

**Before** (`src/components/book/BookCover.tsx`):
```tsx
<img
  src={imageUrl}
  alt={title}
  className="w-full h-full object-cover"
/>
```

**After**:
```tsx
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={title}
  fill
  sizes="(max-width: 768px) 100vw, 33vw"
  className="object-cover"
  priority={priority} // 첫 화면 이미지만
/>
```

**주요 수정 파일**:
1. `src/components/book/BookCover.tsx`
2. `src/components/user/UserAvatar.tsx`
3. `src/components/post/PostCard.tsx`
4. `src/app/page.tsx` (Hero 섹션 배경)

#### 4.5 폴링 로직 최적화
**대상**: 음악 생성 상태 폴링

**Before** (`src/app/(main)/journey/[id]/page.tsx`):
```tsx
useEffect(() => {
  if (generatingTracks.size === 0) return;
  
  const pollInterval = setInterval(fetchJourney, 2000);
  
  // ⚠️ cleanup 함수 없음 (메모리 누수)
}, [generatingTracks]);
```

**After**:
```tsx
useEffect(() => {
  if (generatingTracks.size === 0) return;
  
  const pollInterval = setInterval(() => {
    fetchJourney();
  }, 2000);
  
  // ✅ cleanup 함수 추가
  return () => {
    clearInterval(pollInterval);
  };
}, [generatingTracks.size]); // ⚠️ size만 의존성으로
```

**더 나은 방법 (useRef 활용)**:
```tsx
const generatingTracksRef = useRef(generatingTracks);
generatingTracksRef.current = generatingTracks;

useEffect(() => {
  const pollInterval = setInterval(() => {
    if (generatingTracksRef.current.size > 0) {
      fetchJourney();
    }
  }, 2000);
  
  return () => clearInterval(pollInterval);
}, []); // 빈 의존성 배열 (한 번만 실행)
```

#### 4.6 번들 분석 및 최적화
**설정**: `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 번들 분석 활성화
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )?.[1];
              return `npm.${packageName?.replace('@', '')}`;
            },
          },
        },
      };
    }
    return config;
  },
  
  // 실험적 기능
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-dialog',
    ],
  },
};

export default nextConfig;
```

**번들 분석 명령어**:
```bash
npm install --save-dev @next/bundle-analyzer

# package.json
"scripts": {
  "analyze": "ANALYZE=true next build"
}
```

### 검증 기준
- [ ] Lighthouse Performance 점수 90+
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] 번들 크기 < 200KB (main chunk)

---

## Task 5: 컴포넌트 재사용성 개선 (2일)

### 목표
중복 코드 제거, Variant 시스템 확장, 공통 로직 추출

### 작업 내용

#### 5.1 Card 컴포넌트 통합
**현재 문제**: 여러 컴포넌트에서 유사한 카드 스타일 중복

**Before** (중복):
```tsx
// BookCard.tsx
<div className="card-elevated p-6 hover:shadow-lg transition">

// JourneyCard.tsx
<div className="card-elevated p-6 hover:shadow-lg transition">

// PostCard.tsx
<div className="card-elevated p-6 hover:shadow-lg transition">
```

**After** (통합):
```tsx
// src/components/ui/card-base.tsx
import { Card } from '@/components/ui/card';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'transition-all duration-200', // 기본 클래스
  {
    variants: {
      variant: {
        default: 'card-elevated',
        flat: 'bg-card border border-border',
        gradient: 'card-gradient',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1 hover:shadow-xl',
        glow: 'hover:shadow-primary-lg hover:border-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'lift',
    },
  }
);

interface CardBaseProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

export function CardBase({ variant, padding, hover, className, children }: CardBaseProps) {
  return (
    <div className={cn(cardVariants({ variant, padding, hover }), className)}>
      {children}
    </div>
  );
}
```

**사용**:
```tsx
// BookCard.tsx
<CardBase variant="default" hover="lift">
  {/* 도서 내용 */}
</CardBase>

// JourneyCard.tsx
<CardBase variant="gradient" hover="glow">
  {/* 여정 내용 */}
</CardBase>
```

#### 5.2 공통 Hooks 추출
**대상**: 반복되는 데이터 패칭 로직

**Before** (중복):
```tsx
// library/page.tsx
const [journeys, setJourneys] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchJourneys() {
    setLoading(true);
    try {
      const res = await fetch('/api/journeys');
      const data = await res.json();
      setJourneys(data);
    } catch (error) {
      toast.error('로딩 실패');
    } finally {
      setLoading(false);
    }
  }
  fetchJourneys();
}, []);

// feed/page.tsx
// 동일한 패턴 반복...
```

**After** (공통 Hook):
```tsx
// src/hooks/useJourneys.ts
export function useJourneys(filters?: JourneyFilters) {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJourneys = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams(filters as any);
      const res = await fetch(`/api/journeys?${params}`);
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setJourneys(data);
    } catch (err) {
      setError(err as Error);
      toast.error('독서 여정을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  return { journeys, loading, error, refetch: fetchJourneys };
}
```

**사용**:
```tsx
// library/page.tsx
const { journeys, loading } = useJourneys({ status: 'reading' });

// feed/page.tsx
const { journeys, loading } = useJourneys({ sort: 'latest' });
```

**추가 공통 Hooks**:
1. `useInfiniteScroll` - 무한 스크롤
2. `useDebounce` - 검색 입력 디바운싱
3. `useLocalStorage` - localStorage 동기화
4. `useMediaQuery` - 반응형 미디어 쿼리

#### 5.3 Button Variants 확장
**파일**: `src/components/ui/button.tsx`

**추가 Variants**:
```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center ...',
  {
    variants: {
      variant: {
        // 기존
        default: '...',
        outline: '...',
        ghost: '...',
        
        // 추가
        gradient: 'bg-gradient-accent text-white shadow-primary hover:shadow-primary-lg',
        'gradient-warm': 'bg-gradient-warm text-white',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        default: '...',
        sm: '...',
        lg: '...',
        
        // 추가
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
  }
);
```

**사용**:
```tsx
// Before (인라인 스타일)
<button
  className="px-8 py-6 text-lg rounded-xl"
  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
>
  시작하기
</button>

// After (Variant)
<Button variant="gradient" size="xl">
  시작하기
</Button>
```

#### 5.4 Form 컴포넌트 통합
**현재 문제**: LoginForm, SignupForm, CompleteForm 등에서 유사한 폼 구조 반복

**After** (공통 컴포넌트):
```tsx
// src/components/ui/form-field.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

**사용**:
```tsx
// LoginForm.tsx
<FormField label="이메일" error={errors.email} required>
  <Input type="email" {...register('email')} />
</FormField>

<FormField label="비밀번호" error={errors.password} required>
  <Input type="password" {...register('password')} />
</FormField>
```

### 검증 기준
- [ ] 코드 중복률 50% 감소
- [ ] 컴포넌트 라인 수 평균 30% 감소
- [ ] Variant 시스템으로 90% 이상 커버
- [ ] 공통 Hook 재사용률 80% 이상

---

## Task 6: TODO 주석 해결 (1일)

### 목표
코드베이스의 모든 TODO 주석을 해결하거나 명확한 티켓으로 변환

### 작업 내용

#### 6.1 emotion_tags 조인 로직 구현
**파일**: 
- `src/services/journey.service.ts:158`
- `src/app/api/journeys/[id]/logs/route.ts:77`

**현재 문제**:
```typescript
emotions: undefined, // TODO: Join emotion_tags from log_emotions table
```

**해결**:
```typescript
// src/services/journey.service.ts
async getJourneyById(journeyId: string, userId: string) {
  const { data, error } = await this.supabase
    .from('reading_journeys')
    .select(`
      *,
      reading_logs!inner (
        *,
        log_emotions!inner (
          emotion_tags (
            id,
            name,
            color,
            is_custom
          )
        )
      )
    `)
    .eq('id', journeyId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // 데이터 변환
  const journey = {
    ...data,
    logs: data.reading_logs.map((log: any) => ({
      ...log,
      emotions: log.log_emotions.map((le: any) => le.emotion_tags),
    })),
  };

  return journey;
}
```

#### 6.2 Mureka API 엔드포인트 업데이트
**파일**: `src/lib/mureka/client.ts:250`

**현재 TODO**:
```typescript
// TODO: Update endpoint when actual API docs are available
```

**해결**:
1. Mureka API 최신 문서 확인
2. 엔드포인트 URL 업데이트
3. 요청/응답 타입 정의
4. 에러 핸들링 강화

**예상 변경**:
```typescript
// Before
const MUREKA_API_BASE = 'https://api.mureka.ai/v1';

// After (문서 확인 후)
const MUREKA_API_BASE = 'https://api.mureka.ai/v2'; // 또는 최신 버전
```

#### 6.3 테스트 픽스처 TODO 해결
**파일**: `tests/fixtures/journey.fixture.ts`

**현재 TODO**:
```typescript
// TODO: 로그 추가 로직 구현
// TODO: 완독 여정 생성 로직 구현
```

**해결**:
```typescript
async function createJourneyWithLogs(page: Page, logCount: number = 2) {
  const journeyPage = await createJourney(page);
  
  for (let i = 0; i < logCount; i++) {
    await journeyPage.goto(`/journey/${journeyPage.journeyId}`);
    await journeyPage.addLog({
      quote: `인상 깊은 구절 ${i + 1}`,
      emotions: ['감동', '기쁨'],
      memo: `메모 ${i + 1}`,
    });
  }
  
  return journeyPage;
}
```

#### 6.4 Progress 계산 로직 구현
**파일**: `src/app/api/journeys/route.ts:76`

**현재 TODO**:
```typescript
progress: undefined, // TODO: Calculate progress based on logs/page numbers
```

**해결**:
```typescript
interface Journey {
  // ...
  total_pages?: number;
  current_page?: number;
}

// API 응답 변환 시
const journeys = data.map((journey: any) => ({
  ...journey,
  progress: journey.total_pages && journey.current_page
    ? Math.round((journey.current_page / journey.total_pages) * 100)
    : undefined,
}));
```

**데이터베이스 스키마 추가**:
```sql
-- migration 파일
ALTER TABLE reading_journeys
ADD COLUMN total_pages INTEGER,
ADD COLUMN current_page INTEGER DEFAULT 0;

-- Log 작성 시 current_page 업데이트
ALTER TABLE reading_logs
ADD COLUMN page_number INTEGER;
```

### 검증 기준
- [ ] TODO 주석 0개
- [ ] 모든 기능 정상 작동
- [ ] 타입 에러 0개
- [ ] 테스트 통과

---

## Task 7: 타입 안정성 강화 (1일)

### 목표
any 타입 제거, 엄격한 타입 정의, 타입 가드 추가

### 작업 내용

#### 7.1 any 타입 제거
**검색**: `grep -r "any" src/**/*.{ts,tsx}`

**수정 패턴**:
```tsx
// Before
function handleSubmit(data: any) {
  console.log(data);
}

// After
interface FormData {
  email: string;
  password: string;
}

function handleSubmit(data: FormData) {
  console.log(data);
}
```

#### 7.2 API 응답 타입 정의
**파일**: `src/types/dto/`

**Before** (타입 없음):
```tsx
const res = await fetch('/api/journeys');
const data = await res.json(); // data는 any
```

**After**:
```typescript
// src/types/dto/journey.dto.ts
export interface JourneyListResponse {
  journeys: Journey[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JourneyDetailResponse {
  journey: Journey;
  logs: ReadingLog[];
  tracks: MusicTrack[];
}
```

```tsx
// 사용
const res = await fetch('/api/journeys');
const data: JourneyListResponse = await res.json();
```

#### 7.3 타입 가드 추가
**파일**: `src/types/guards.ts` (신규)

```typescript
export function isJourney(obj: unknown): obj is Journey {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'book_title' in obj &&
    'status' in obj
  );
}

export function isReadingLog(obj: unknown): obj is ReadingLog {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'version' in obj
  );
}

// 사용
if (isJourney(data)) {
  console.log(data.book_title); // 타입 안전
}
```

#### 7.4 Utility Types 활용
```typescript
// Partial, Pick, Omit 활용
type JourneyFormData = Omit<Journey, 'id' | 'created_at' | 'updated_at'>;
type JourneyUpdateData = Partial<Journey>;

// Record 활용
type JourneyStatus = 'reading' | 'completed';
type JourneyStatusMap = Record<JourneyStatus, string>;

const statusLabels: JourneyStatusMap = {
  reading: '읽는 중',
  completed: '완독',
};
```

### 검증 기준
- [ ] any 타입 사용 90% 감소
- [ ] TypeScript strict 모드 활성화
- [ ] 빌드 시 타입 에러 0개
- [ ] IDE 자동완성 100% 작동

---

## Task 8: 반응형 디자인 개선 (2일)

### 목표
모바일, 태블릿, 데스크톱 모든 화면에서 최적의 UX 제공

### 작업 내용

#### 8.1 브레이크포인트 정의
**파일**: `tailwind.config.ts`

```typescript
theme: {
  screens: {
    'sm': '640px',   // 모바일 가로
    'md': '768px',   // 태블릿
    'lg': '1024px',  // 노트북
    'xl': '1280px',  // 데스크톱
    '2xl': '1536px', // 대형 화면
  },
}
```

#### 8.2 Grid 시스템 최적화
**Before** (고정 그리드):
```tsx
<div className="grid grid-cols-3 gap-8">
  {journeys.map(j => <JourneyCard key={j.id} journey={j} />)}
</div>
```

**After** (반응형):
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {journeys.map(j => <JourneyCard key={j.id} journey={j} />)}
</div>
```

#### 8.3 모바일 네비게이션
**파일**: `src/components/layout/Header.tsx`

**추가**: 햄버거 메뉴 (768px 이하)

```tsx
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  return (
    <header>
      {/* 데스크톱 메뉴 */}
      <nav className="hidden md:flex">
        {/* ... */}
      </nav>
      
      {/* 모바일 메뉴 */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="flex flex-col gap-4">
            {/* ... */}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
```

#### 8.4 Typography 반응형
**파일**: `src/app/globals.css`

```css
/* 모바일 기본 */
.display-hero {
  font-size: 2.5rem;    /* 40px */
  line-height: 1.2;
}

/* 태블릿 */
@media (min-width: 768px) {
  .display-hero {
    font-size: 3.5rem;  /* 56px */
    line-height: 1.1;
  }
}

/* 데스크톱 */
@media (min-width: 1280px) {
  .display-hero {
    font-size: 4.5rem;  /* 72px */
    line-height: 1.1;
  }
}
```

**Tailwind 방식**:
```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
  제목
</h1>
```

#### 8.5 터치 인터랙션 개선
**파일**: 모든 인터랙티브 컴포넌트

**최소 터치 타겟 크기**: 44x44px (WCAG 2.1)

```tsx
// Before (작은 버튼)
<button className="p-2">
  <Heart className="h-4 w-4" />
</button>

// After (충분한 터치 영역)
<button className="p-3 min-h-[44px] min-w-[44px]">
  <Heart className="h-5 w-5" />
</button>
```

### 검증 기준
- [ ] 모든 화면 크기에서 레이아웃 깨지지 않음
- [ ] 터치 타겟 최소 44x44px
- [ ] 모바일 메뉴 정상 작동
- [ ] Lighthouse Mobile 점수 90+

---

## 🔄 리팩토링 워크플로우

### 1. 준비 단계
1. **브랜치 생성**: `git checkout -b refactor/phase-11-ui-ux`
2. **백업**: 현재 작동하는 버전 커밋
3. **테스트 실행**: `npm test` (기준선 확보)
4. **번들 분석**: `npm run analyze` (기준선 확보)

### 2. 실행 단계
각 Task별로:
1. **TodoWrite** - 작업 계획 세우기
2. **구현** - 소규모 단위로 반복
3. **테스트** - 변경 사항 검증
4. **커밋** - 의미있는 단위로 커밋
5. **검증** - 체크리스트 확인

### 3. 검증 단계
1. **빌드**: `npm run build` (에러 없는지 확인)
2. **테스트**: `npm test` (회귀 없는지 확인)
3. **Lighthouse**: 성능, 접근성, SEO 점수 확인
4. **수동 테스트**: 주요 플로우 실제 사용

### 4. 마무리 단계
1. **문서 업데이트**: CLAUDE.md, 컴포넌트 가이드
2. **PR 생성**: 변경 사항 상세 설명
3. **코드 리뷰**: 팀원 피드백 반영
4. **머지**: main 브랜치에 병합

---

## 📈 성공 지표 (KPI)

### 코드 품질
- [ ] TypeScript strict 모드 활성화
- [ ] ESLint 에러 0개
- [ ] 코드 중복률 < 5%
- [ ] TODO 주석 0개

### 성능
- [ ] Lighthouse Performance 90+
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] 번들 크기 < 200KB (main chunk)

### 접근성
- [ ] Lighthouse Accessibility 95+
- [ ] WCAG 2.1 AA 준수
- [ ] 키보드 네비게이션 100% 지원
- [ ] 색상 대비 4.5:1 이상

### 디자인
- [ ] 다크모드 100% 지원
- [ ] 반응형 디자인 (320px ~ 2560px)
- [ ] 일관된 디자인 토큰 사용
- [ ] 컴포넌트 Variant 90% 커버

---

## 🗓️ 타임라인

### Week 1 (5일)
- **Day 1-2**: Task 1 (디자인 토큰 시스템)
- **Day 3-5**: Task 2 (다크모드 구현)

### Week 2 (5일)
- **Day 1-2**: Task 3 (접근성 개선)
- **Day 3-5**: Task 4 (성능 최적화)

### Week 3 (4일)
- **Day 1-2**: Task 5 (컴포넌트 재사용성)
- **Day 3**: Task 6 (TODO 해결)
- **Day 4**: Task 7 (타입 안정성)

### Week 4 (3일)
- **Day 1-2**: Task 8 (반응형 디자인)
- **Day 3**: 통합 테스트 및 검증

**총 소요 기간**: 17일 (3.5주)

---

## 📚 참고 자료

### 디자인 시스템
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [Stripe Design System](https://stripe.com/design)
- [Radix UI Primitives](https://www.radix-ui.com/)

### 성능 최적화
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)

### 접근성
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

## 🚨 주의사항

1. **점진적 적용**: 한 번에 모든 것을 바꾸지 말고 작은 단위로 반복
2. **테스트 우선**: 변경 전후 항상 테스트 실행
3. **백워드 호환성**: 기존 API와의 호환성 유지
4. **성능 측정**: 변경 후 항상 성능 측정 및 비교
5. **문서화**: 주요 결정 사항은 반드시 문서화
6. **코드 리뷰**: 중요한 변경은 팀원과 리뷰

---

**업데이트 이력**:
- 2025-10-22: 초안 작성 (Phase 11 준비)
