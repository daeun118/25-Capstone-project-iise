# ReadTune Design System

**버전**: 1.0
**작성일**: 2025-10-21
**목적**: 독서 여정 플랫폼을 위한 일관된 디자인 언어 정의

---

## 🎨 디자인 철학

**"독서와 음악이 만나는 밝고 감성적인 경험"**

### 핵심 가치
1. **Bright & Clean** - 밝고 깔끔한 인터페이스로 독서에 집중
2. **Elegant** - 세련되고 모던한 시각적 경험
3. **Emotional** - 독서 감정을 시각적으로 표현
4. **Accessible** - 모든 사용자가 편안하게 사용

### 디자인 방향

**기본 테마**: 라이트 모드 (밝고 깔끔한 느낌)
- 밝은 배경으로 독서 앱다운 편안함
- 화이트 카드로 콘텐츠 강조
- 다크 모드는 선택 옵션

**참고 디자인**:
- Welaaa의 **밝고 깔끔한 카드 레이아웃**
- Suno의 **모던한 타이포그래피**
- Mureka의 **앨범커버 중심 음악 카드 디자인**
  - 시각적 앨범아트가 각 음악의 정체성
  - 재생 수, 시간, 장르 등 메타데이터 명확 표시
  - 호버 시 재생 버튼 등 인터랙션 요소 노출
- **독서 앱의 편안함** + **음악 플랫폼 감성**

---

## 🌈 색상 시스템

### Background Colors (라이트 모드 기본)

**Primary Background**:
```css
--bg-primary: #fafafa     /* 메인 배경 (밝은 회색) */
--bg-secondary: #ffffff   /* 카드, 서피스 (순백) */
--bg-tertiary: #f5f5f5    /* 서브 섹션 배경 */
```

**다크 모드 (선택 옵션)**:
```css
.dark {
  --bg-primary: #0a0a0a     /* 메인 배경 */
  --bg-secondary: #1a1a1a   /* 카드 */
  --bg-tertiary: #2a2a2a    /* 서브 섹션 */
}
```

### Text Colors

**라이트 모드**:
```css
--text-primary: #1a1a1a     /* 주요 텍스트 (거의 검정) */
--text-secondary: #525252   /* 보조 텍스트 */
--text-tertiary: #737373    /* 메타데이터 */
--text-muted: #a3a3a3       /* 비활성 텍스트 */
```

**다크 모드**:
```css
.dark {
  --text-primary: #fafafa     /* 주요 텍스트 */
  --text-secondary: #d4d4d4   /* 보조 텍스트 */
  --text-tertiary: #a3a3a3    /* 메타데이터 */
  --text-muted: #737373       /* 비활성 텍스트 */
}
```

### Border & Divider

**라이트 모드**:
```css
--border-primary: #e5e5e5   /* 카드 테두리 */
--border-secondary: #f0f0f0 /* 미묘한 구분선 */
--border-focus: #6366f1     /* 포커스 상태 */
```

### Accent Colors - 독서 감정 표현

**Indigo (주요 액션 - 독서)**:
```css
--indigo-50: #eef2ff
--indigo-100: #e0e7ff
--indigo-500: #6366f1   /* 버튼, 링크 */
--indigo-600: #4f46e5   /* 호버 */
--indigo-700: #4338ca   /* 액티브 */
```

**Violet (음악 관련)**:
```css
--violet-50: #f5f3ff
--violet-100: #ede9fe
--violet-500: #8b5cf6   /* 음악 플레이어 */
--violet-600: #7c3aed   /* 음악 액션 */
```

**Amber (완독, 성취)**:
```css
--amber-50: #fffbeb
--amber-100: #fef3c7
--amber-500: #f59e0b    /* 완독 배지 */
--amber-600: #d97706    /* 별점 */
```

### Semantic Colors

**Success**:
```css
--green-50: #f0fdf4
--green-500: #22c55e
--green-600: #16a34a
```

**Warning**:
```css
--orange-50: #fff7ed
--orange-500: #f97316
```

**Error**:
```css
--red-50: #fef2f2
--red-500: #ef4444
--red-600: #dc2626
```

---

## 📝 타이포그래피

### Font Stack

**주 폰트 (한글 + 영문)**:
```css
font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**모노스페이스 (코드, 메타데이터)**:
```css
font-family: ui-monospace, "JetBrains Mono", "Fira Code", Consolas, monospace;
```

### Type Scale

| 이름 | 크기 | Line Height | 용도 |
|------|------|-------------|------|
| `display-2xl` | 64px | 1.1 | 히어로 타이틀 |
| `display-xl` | 56px | 1.1 | 메인 페이지 제목 |
| `display-lg` | 48px | 1.2 | 섹션 타이틀 |
| `display-md` | 36px | 1.25 | 카드 타이틀 |
| `display-sm` | 30px | 1.3 | 서브 타이틀 |
| `heading-xl` | 24px | 1.4 | H1 |
| `heading-lg` | 20px | 1.4 | H2 |
| `heading-md` | 18px | 1.5 | H3 |
| `heading-sm` | 16px | 1.5 | H4 |
| `body-lg` | 18px | 1.7 | 본문 강조 |
| `body-md` | 16px | 1.7 | 본문 기본 |
| `body-sm` | 14px | 1.6 | 본문 보조 |
| `caption` | 13px | 1.5 | 캡션, 메타데이터 |

### Font Weights

```css
--font-light: 300
--font-regular: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

---

## 📐 Spacing System

**4px 기준 스케일** (더 촘촘한 간격):
```css
--spacing-0.5: 0.125rem  /* 2px */
--spacing-1: 0.25rem     /* 4px */
--spacing-2: 0.5rem      /* 8px */
--spacing-3: 0.75rem     /* 12px */
--spacing-4: 1rem        /* 16px */
--spacing-5: 1.25rem     /* 20px */
--spacing-6: 1.5rem      /* 24px */
--spacing-7: 1.75rem     /* 28px */
--spacing-8: 2rem        /* 32px */
--spacing-10: 2.5rem     /* 40px */
--spacing-12: 3rem       /* 48px */
--spacing-16: 4rem       /* 64px */
--spacing-20: 5rem       /* 80px */
```

---

## 🎴 컴포넌트 패턴

### Cards

**Default Card** (라이트 모드):
- Background: `#ffffff` (순백)
- Border: `1px solid #e5e5e5`
- Border Radius: `12px`
- Padding: `20px`
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`

**Hover Card**:
- Transform: `translateY(-2px)`
- Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Border: `1px solid #d4d4d4`
- Transition: `all 0.2s ease`

**Book Card** (특수):
- Aspect Ratio: `2:3` (책 비율)
- Cover Image + Metadata
- Hover: 약간 확대 + shadow 증가
- Background: `white`

### Buttons

**Primary** (주요 액션):
- Background: `#6366f1` (indigo-500)
- Color: `white`
- Padding: `10px 20px`
- Border Radius: `8px`
- Font Weight: `600`
- Shadow: `0 1px 2px rgba(99,102,241,0.15)`
- Hover: `#4f46e5` (indigo-600) + `translateY(-1px)` + shadow 증가

**Secondary** (보조 액션):
- Background: `white`
- Border: `1px solid #e5e5e5`
- Color: `#525252`
- Hover: `background #fafafa` + `border #d4d4d4`

**Ghost** (미묘한 액션):
- Background: `transparent`
- Color: `#737373`
- Hover: `color #1a1a1a` + `background #f5f5f5`

### Inputs

**Text Input**:
- Background: `white`
- Border: `1px solid #e5e5e5`
- Border Radius: `8px`
- Padding: `10px 14px`
- Focus:
  - Border → `#6366f1` (indigo)
  - Shadow: `0 0 0 3px rgba(99,102,241,0.1)`

**Textarea**:
- 동일한 스타일
- Min Height: `100px`

---

## 🎵 음악 플레이어 디자인

### Player Card

**레이아웃**:
```
┌─────────────────────────────────────┐
│  [앨범커버]  제목                   │
│    64×64     작가               [♡] │
│           ━━━━━━━━●━━━━━  3:45     │
│           [◀] [▶/⏸] [▶]  [🔊]      │
└─────────────────────────────────────┘
```

**컬러 (라이트 모드)**:
- Background: `white`
- Border: `1px solid #e5e5e5`
- Progress Bar Background: `#f0f0f0`
- Progress Bar Fill: `#8b5cf6` (violet)
- Icons: `#525252` / Hover: `#1a1a1a`
- Active State: `#8b5cf6`

---

## 📱 반응형 Breakpoints

```css
--screen-sm: 640px    /* Mobile */
--screen-md: 768px    /* Tablet */
--screen-lg: 1024px   /* Desktop */
--screen-xl: 1280px   /* Large Desktop */
--screen-2xl: 1536px  /* XL Desktop */
```

### 레이아웃 패턴

**Mobile (< 768px)**:
- Single column
- Full width cards
- Fixed header with shadow
- 16px 좌우 패딩

**Tablet (768px ~ 1024px)**:
- 2 column grid
- Sidebar collapsible
- 24px 좌우 패딩

**Desktop (> 1024px)**:
- 3-4 column grid
- Fixed sidebar (260px)
- Max width container (1280px)
- 32px 좌우 패딩

---

## ✨ 애니메이션 & 트랜지션

### Duration

```css
--transition-fast: 150ms
--transition-base: 200ms
--transition-slow: 300ms
--transition-slower: 500ms
```

### Easing

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-out: cubic-bezier(0.0, 0, 0.2, 1)
--ease-in: cubic-bezier(0.4, 0, 1, 1)
```

### 주요 애니메이션

**Page Transition**:
- Fade in: `opacity 0 → 1` (300ms)
- Slide up: `translateY(10px) → 0` (200ms)

**Card Hover**:
- Transform: `translateY(-2px)` (200ms)
- Shadow increase (200ms)

**Button Hover**:
- Transform: `translateY(-1px)` (150ms)
- Background color change (150ms)

---

## 🌙 다크모드 (선택 옵션)

**원칙**:
1. 라이트모드를 기본(default)으로 설정
2. 다크모드는 선택 옵션
3. 모든 컴포넌트는 라이트모드 우선 디자인

**구현**:
- Tailwind의 `dark:` prefix 사용
- `localStorage`에 사용자 설정 저장
- 시스템 설정 감지 지원

**다크모드 색상**:
- 배경: `#0a0a0a` (거의 검정)
- 카드: `#1a1a1a`
- 텍스트: `#fafafa`
- 보더: `#2a2a2a`

---

## 🎯 접근성 (Accessibility)

### 대비율
- Normal Text: 최소 4.5:1 (AAA)
- Large Text: 최소 3:1 (AA)
- UI Components: 최소 3:1

### 키보드 네비게이션
- 모든 인터랙티브 요소 `focus-visible` 스타일
- Focus ring: `2px solid #6366f1` + `4px offset`
- Tab order 논리적 순서
- Skip to main content 링크

### 스크린 리더
- Semantic HTML 사용 (header, main, nav, footer)
- ARIA labels 적절히 사용
- Alt text for images
- Live regions for dynamic content

---

## 📦 컴포넌트 라이브러리

**기본**: shadcn/ui (Radix UI 기반)
- Button, Input, Card, Dialog, Tabs, Select 등
- 완전히 커스터마이징 가능
- Tailwind CSS 완전 통합
- 접근성 기본 제공

**아이콘**: Lucide React
- 일관된 스타일
- 가벼운 용량
- 커스터마이징 가능

**음악 재생**: Howler.js
- 크로스 브라우저 지원
- 간편한 API

---

## 🎨 디자인 토큰 정리

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.07)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15)
```

### Border Radius

```css
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px
```

---

## 📋 구현 우선순위

### Phase 1: 기초 시스템 ✅
1. globals.css 색상 변수 정의
2. 타이포그래피 시스템 구축
3. 기본 컴포넌트 스타일링 (Button, Card, Input)

### Phase 2: 레이아웃
1. Header/Footer 디자인
2. Grid 시스템 구축
3. 반응형 레이아웃

### Phase 3: 도메인 컴포넌트
1. BookCard 디자인
2. JourneyCard 디자인
3. MusicPlayer 디자인
4. PostCard 디자인

---

**참고**: 이 디자인 시스템은 살아있는 문서입니다. 프로젝트 진행에 따라 지속적으로 업데이트됩니다.

**핵심 원칙**: 밝고 깔끔하며, 독서에 집중할 수 있는 편안한 환경을 제공합니다.
