# Typography System - Reading Experience Platform

**버전**: 1.0
**최종 수정**: 2025-10-20
**목적**: 가독성과 계층 구조가 명확한 타이포그래피 시스템

---

## 📖 타이포그래피 철학

### 디자인 원칙
1. **가독성 우선**: 긴 독서 경험을 고려한 편안한 글꼴과 간격
2. **명확한 계층**: 정보의 중요도가 시각적으로 명확히 구분
3. **브랜드 정체성**: 독서(세리프)와 현대성(산세리프)의 조화
4. **다국어 지원**: 한글과 영문의 조화로운 혼용

---

## 🔤 Font Families

### 1. Primary - Pretendard Variable (한글 + 영문 UI)
```css
font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

**특징**:
- 가변 폰트 (Variable Font) - 파일 크기 최적화
- 한글 최적화 폰트
- 9개 굵기 지원 (100-900)
- Apple SD Gothic Neo의 대체 폰트
- 본고딕과 유사한 느낌

**사용처**:
- UI 요소 (버튼, 레이블, 내비게이션)
- 카드 제목 및 메타데이터
- 폼 입력 필드
- 감정 태그

**CDN**:
```html
<link rel="stylesheet" as="style" crossorigin
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
```

---

### 2. Secondary - Inter (영문 본문)
```css
font-family: 'Inter', 'Pretendard Variable', sans-serif;
```

**특징**:
- Google Fonts에서 제공
- 가변 폰트 지원
- 가독성이 뛰어난 산세리프
- GitHub, Notion 등 사용

**사용처**:
- 영문 본문 텍스트
- 인용구 (영문)
- 설명 텍스트 (영문)

**CDN**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

### 3. Accent - Playfair Display (영문 제목)
```css
font-family: 'Playfair Display', 'Noto Serif KR', serif;
```

**특징**:
- 우아한 세리프 폰트
- 독서/문학적 분위기
- 큰 제목에 적합
- 대비가 높은 디자인

**사용처**:
- 페이지 메인 제목 (영문)
- 책 제목 강조 (영문)
- 특별한 헤더 (영문)
- 마케팅 문구

**CDN**:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
```

---

### 4. Fallback - Noto Serif KR (한글 제목 대체)
```css
font-family: 'Noto Serif KR', serif;
```

**특징**:
- 한글 세리프 폰트
- 문학적 느낌
- Playfair Display와 조화

**사용처**:
- 책 제목 (한글)
- 인상 깊은 구절 강조
- 특별한 헤더 (한글)

**CDN**:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">
```

---

## 📏 Type Scale (1.25 비율)

### Scale Definitions
```css
/* 타입 스케일 - 1.25 비율 (Perfect Fourth) */
--font-size-xs:   12px;  /* 0.75rem */
--font-size-sm:   14px;  /* 0.875rem */
--font-size-base: 16px;  /* 1rem */
--font-size-lg:   18px;  /* 1.125rem */
--font-size-xl:   20px;  /* 1.25rem */
--font-size-2xl:  24px;  /* 1.5rem */
--font-size-3xl:  30px;  /* 1.875rem */
--font-size-4xl:  36px;  /* 2.25rem */
--font-size-5xl:  45px;  /* 2.8125rem - 추가 스케일 */
--font-size-6xl:  56px;  /* 3.5rem - 히어로 제목 */
```

### Usage Matrix

| Size | Pixels | Usage |
|------|--------|-------|
| **xs** | 12px | 감정 태그, 메타데이터, 캡션, 저작권 |
| **sm** | 14px | 보조 텍스트, 라벨, 작은 버튼 |
| **base** | 16px | 본문, 기본 버튼, 폼 입력 |
| **lg** | 18px | 강조 텍스트, 카드 부제목 |
| **xl** | 20px | 카드 제목, 부섹션 제목 |
| **2xl** | 24px | 섹션 제목, 중요 헤더 |
| **3xl** | 30px | 페이지 제목, 메인 헤더 |
| **4xl** | 36px | 히어로 제목, 랜딩 페이지 |
| **5xl** | 45px | 특별 강조 제목 (선택) |
| **6xl** | 56px | 히어로 메인 (선택) |

---

## 📐 Line Heights

### Definitions
```css
--line-height-none:    1.0;   /* 특수한 경우 */
--line-height-tight:   1.2;   /* 제목용 */
--line-height-snug:    1.375; /* 부제목용 */
--line-height-normal:  1.5;   /* UI 텍스트 */
--line-height-relaxed: 1.6;   /* 본문 (읽기 최적화) */
--line-height-loose:   1.75;  /* 긴 본문 */
```

### Usage Guidelines

**제목 (Headings)**:
- **line-height: 1.2** (tight)
- 왜? 큰 글자는 행간이 좁아도 읽기 편함
- 시각적으로 응집력 있음

**본문 (Body)**:
- **line-height: 1.6** (relaxed)
- 왜? 긴 텍스트 읽기에 최적
- 피로도 감소

**UI 요소 (Labels, Buttons)**:
- **line-height: 1.5** (normal)
- 왜? 버튼 높이 예측 가능
- 수직 정렬 용이

---

## ⚖️ Font Weights

### Definitions
```css
--font-weight-light:     300;  /* 부드러운 강조 */
--font-weight-regular:   400;  /* 기본 본문 */
--font-weight-medium:    500;  /* UI 요소 */
--font-weight-semibold:  600;  /* 부제목 */
--font-weight-bold:      700;  /* 제목, 강조 */
--font-weight-extrabold: 800;  /* 특별 강조 (선택) */
```

### Usage Matrix

| Weight | Value | Usage |
|--------|-------|-------|
| **Light** | 300 | 인용구, 부드러운 강조 |
| **Regular** | 400 | 본문, 설명 텍스트 |
| **Medium** | 500 | 버튼, 라벨, 감정 태그 |
| **SemiBold** | 600 | 카드 제목, 부섹션 |
| **Bold** | 700 | 페이지 제목, 강조 |
| **ExtraBold** | 800 | 히어로 제목 (선택) |

---

## 🎨 Typography Tokens

### Heading Styles

#### H1 - Page Title
```css
.heading-1 {
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 36px;        /* 4xl */
  font-weight: 700;       /* Bold */
  line-height: 1.2;       /* Tight */
  letter-spacing: -0.02em; /* Slight negative */
  color: var(--neutral-text-primary);
}
```

**Usage**: 페이지 메인 제목, 랜딩 히어로

---

#### H2 - Section Title
```css
.heading-2 {
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 30px;        /* 3xl */
  font-weight: 700;       /* Bold */
  line-height: 1.2;       /* Tight */
  letter-spacing: -0.01em;
  color: var(--neutral-text-primary);
}
```

**Usage**: 섹션 제목, 모달 제목

---

#### H3 - Subsection Title
```css
.heading-3 {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 24px;        /* 2xl */
  font-weight: 600;       /* SemiBold */
  line-height: 1.2;       /* Tight */
  letter-spacing: -0.01em;
  color: var(--neutral-text-primary);
}
```

**Usage**: 카드 섹션 제목, 폼 제목

---

#### H4 - Card Title
```css
.heading-4 {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 20px;        /* xl */
  font-weight: 600;       /* SemiBold */
  line-height: 1.3;       /* Snug */
  letter-spacing: -0.005em;
  color: var(--neutral-text-primary);
}
```

**Usage**: 독서 여정 카드 제목, 책 제목

---

#### H5 - Small Heading
```css
.heading-5 {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 18px;        /* lg */
  font-weight: 600;       /* SemiBold */
  line-height: 1.4;
  color: var(--neutral-text-primary);
}
```

**Usage**: 위젯 제목, 작은 섹션

---

#### H6 - Micro Heading
```css
.heading-6 {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 16px;        /* base */
  font-weight: 600;       /* SemiBold */
  line-height: 1.5;
  color: var(--neutral-text-primary);
}
```

**Usage**: 리스트 그룹 제목

---

### Body Styles

#### Body Large
```css
.body-large {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 18px;        /* lg */
  font-weight: 400;       /* Regular */
  line-height: 1.6;       /* Relaxed */
  color: var(--neutral-text-primary);
}
```

**Usage**: 인트로 텍스트, 중요 설명

---

#### Body (Default)
```css
.body {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 16px;        /* base */
  font-weight: 400;       /* Regular */
  line-height: 1.6;       /* Relaxed */
  color: var(--neutral-text-primary);
}
```

**Usage**: 기본 본문, 설명 텍스트

---

#### Body Small
```css
.body-small {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;        /* sm */
  font-weight: 400;       /* Regular */
  line-height: 1.5;       /* Normal */
  color: var(--neutral-text-secondary);
}
```

**Usage**: 보조 설명, 메타데이터

---

### Special Styles

#### Quote (인용구)
```css
.quote {
  font-family: 'Noto Serif KR', serif;
  font-size: 18px;        /* lg */
  font-weight: 400;       /* Regular */
  line-height: 1.75;      /* Loose */
  font-style: italic;
  color: var(--neutral-text-secondary);
  border-left: 4px solid var(--primary-300);
  padding-left: 20px;
  margin: 24px 0;
}
```

**Usage**: 인상 깊은 구절, 책 인용

---

#### Label
```css
.label {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;        /* sm */
  font-weight: 500;       /* Medium */
  line-height: 1.5;       /* Normal */
  letter-spacing: 0.01em;
  color: var(--neutral-text-secondary);
  text-transform: uppercase; /* 선택 */
}
```

**Usage**: 폼 라벨, 섹션 라벨

---

#### Caption
```css
.caption {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 12px;        /* xs */
  font-weight: 400;       /* Regular */
  line-height: 1.4;
  color: var(--neutral-text-tertiary);
}
```

**Usage**: 이미지 캡션, 타임스탬프, 저작권

---

#### Button
```css
.button-text {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 16px;        /* base */
  font-weight: 500;       /* Medium */
  line-height: 1.5;       /* Normal */
  letter-spacing: 0.005em;
}

.button-text-small {
  font-size: 14px;        /* sm */
  font-weight: 500;
}
```

**Usage**: 버튼 텍스트

---

#### Link
```css
.link {
  font-weight: 500;       /* Medium */
  color: var(--primary-600);
  text-decoration: none;
  transition: color 0.2s;
}

.link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}
```

**Usage**: 하이퍼링크

---

## 📱 Responsive Typography

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) {  /* sm */
  :root {
    --font-size-4xl: 40px;
    --font-size-5xl: 48px;
  }
}

@media (min-width: 768px) {  /* md */
  :root {
    --font-size-4xl: 44px;
    --font-size-5xl: 56px;
  }
}

@media (min-width: 1024px) { /* lg */
  :root {
    --font-size-4xl: 48px;
    --font-size-5xl: 64px;
  }
}
```

### Fluid Typography (선택)
```css
/* Clamp for fluid scaling */
.heading-1-fluid {
  font-size: clamp(30px, 5vw, 48px);
}

.body-fluid {
  font-size: clamp(14px, 1.5vw, 18px);
}
```

---

## 🎯 Usage Guidelines

### 계층 구조 규칙

1. **한 페이지에 H1은 하나만**
   - SEO와 접근성
   - 페이지의 메인 주제

2. **계층 건너뛰지 않기**
   - H1 → H2 → H3 (O)
   - H1 → H3 (X)

3. **시각적 vs 의미적 계층**
   - 시각적: CSS로 조정
   - 의미적: HTML 태그 유지

---

### 가독성 최적화

#### 최적 Line Length
```css
.readable-content {
  max-width: 65ch;  /* 65 characters */
  /* 또는 */
  max-width: 720px; /* 픽셀 기준 */
}
```

**왜?**: 45-75자가 최적 읽기 길이

---

#### Paragraph Spacing
```css
p {
  margin-bottom: 1em; /* 1 line height */
}

p + p {
  margin-top: 1em;
}
```

---

#### Text Color Contrast
```css
/* 본문 */
.text-primary {
  color: var(--neutral-text-primary);  /* 14.8:1 contrast ✅ */
}

/* 보조 텍스트 */
.text-secondary {
  color: var(--neutral-text-secondary); /* 8.2:1 contrast ✅ */
}

/* 약한 텍스트 */
.text-tertiary {
  color: var(--neutral-text-tertiary);  /* 4.6:1 contrast ✅ */
}
```

---

### 감정 태그 타이포그래피
```css
.emotion-tag {
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 12px;        /* xs */
  font-weight: 500;       /* Medium */
  line-height: 1.4;
  letter-spacing: 0.01em;
  padding: 4px 12px;
  border-radius: 16px;    /* Full pill */
}
```

---

## 🔧 Implementation

### CSS Variables
```css
:root {
  /* Font Families */
  --font-primary: 'Pretendard Variable', -apple-system, sans-serif;
  --font-secondary: 'Inter', var(--font-primary);
  --font-accent: 'Playfair Display', 'Noto Serif KR', serif;
  --font-mono: 'SF Mono', 'Consolas', 'Monaco', monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */

  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;
  --line-height-loose: 1.75;

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Letter Spacing */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0em;
  --letter-spacing-wide: 0.01em;
}
```

---

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        primary: ['Pretendard Variable', 'sans-serif'],
        secondary: ['Inter', 'Pretendard Variable', 'sans-serif'],
        accent: ['Playfair Display', 'Noto Serif KR', 'serif'],
        mono: ['SF Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.4' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.01em',
      },
    },
  },
};
```

---

### React/TypeScript Components
```tsx
// Typography.tsx
import React from 'react';

export const H1: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="font-accent text-4xl font-bold leading-tight tracking-tight text-neutral-text-primary">
    {children}
  </h1>
);

export const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="font-primary text-base font-regular leading-relaxed text-neutral-text-primary">
    {children}
  </p>
);

export const EmotionTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 text-xs font-medium leading-snug tracking-wide rounded-full">
    {children}
  </span>
);
```

---

## ♿ Accessibility

### Font Size Minimums
- **절대 최소**: 12px (감정 태그, 캡션만)
- **본문 최소**: 16px (권장)
- **중요 텍스트**: 18px+ (권장)

### Contrast Requirements
- **본문 텍스트**: 4.5:1 (WCAG AA)
- **큰 텍스트 (18pt+)**: 3:1 (WCAG AA)
- **UI 요소**: 3:1 (WCAG AA)

### User Preferences
```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Respect font size preferences */
html {
  font-size: 100%; /* Allow browser zoom */
}
```

---

## 📊 Typography Checklist

### Implementation Checklist
- [ ] Pretendard Variable CDN 로드
- [ ] Inter Google Fonts 로드
- [ ] Playfair Display Google Fonts 로드
- [ ] Noto Serif KR Fallback 로드
- [ ] CSS Variables 정의
- [ ] Tailwind Config 업데이트
- [ ] Typography 컴포넌트 생성
- [ ] 반응형 조정 테스트
- [ ] 다크 모드 텍스트 대비 검증
- [ ] 접근성 검사 (WAVE, Lighthouse)

### Quality Checklist
- [ ] 모든 텍스트 WCAG AA 기준 충족
- [ ] 계층 구조 명확
- [ ] 일관된 간격 적용
- [ ] 한글/영문 조화로움
- [ ] 긴 본문 읽기 편안함
- [ ] 모바일 가독성 확인

---

## 🚀 Next Steps

1. **Font Loading 최적화**
   - Font Display: swap
   - Preload critical fonts
   - Subset fonts (한글 필수 글자만)

2. **Performance**
   - Variable fonts 사용으로 파일 크기 감소
   - WOFF2 format 사용
   - Font loading strategy 최적화

3. **Testing**
   - 다양한 디바이스 테스트
   - 실제 콘텐츠로 검증
   - 사용자 피드백 수집

---

**도구**:
- [Google Fonts](https://fonts.google.com/)
- [Pretendard](https://github.com/orioncactus/pretendard)
- [Type Scale Calculator](https://type-scale.com/)
- [Modular Scale](https://www.modularscale.com/)

**버전 히스토리**:
- v1.0 (2025-10-20): 초기 타이포그래피 시스템 정의
