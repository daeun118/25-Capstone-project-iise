# Tailwind CSS v4 & Database 마이그레이션 가이드

**최종 업데이트**: 2025-01-22

---

## 📋 목차

1. [Database Migration - music_tracks 필드 확장](#1-database-migration)
2. [Tailwind CSS v4 마이그레이션](#2-tailwind-css-v4-마이그레이션)

---

## 1. Database Migration

### 문제: music_tracks 필드 길이 제한

**에러 메시지**:
```
PostgreSQL Error 22001: value too long for type character varying(200)
```

**원인**:
`music_tracks` 테이블 필드들이 GPT-4o-mini 생성 콘텐츠를 담기에 부족:
- `description` VARCHAR(200) - GPT가 200자 이상 설명 생성
- `genre` VARCHAR(50) - "classical crossover with electronic elements" 같은 복합 장르
- `mood` VARCHAR(50) - "contemplative and melancholic with undertones of hope" 같은 상세 무드

### 해결: 필드 크기 확장

```sql
-- Migration: Fix music_tracks field length constraints
-- Date: 2025-01-22

ALTER TABLE music_tracks
  ALTER COLUMN description TYPE TEXT;

ALTER TABLE music_tracks
  ALTER COLUMN genre TYPE VARCHAR(100);

ALTER TABLE music_tracks
  ALTER COLUMN mood TYPE VARCHAR(100);

COMMENT ON COLUMN music_tracks.description IS 'AI-generated description of the music (no length limit)';
COMMENT ON COLUMN music_tracks.genre IS 'Music genre (up to 100 characters)';
COMMENT ON COLUMN music_tracks.mood IS 'Emotional mood (up to 100 characters)';
```

### 실행 방법

#### Option 1: Supabase Dashboard (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. SQL Editor 열기
4. 위 SQL 복사 & 실행
5. 성공 메시지 확인: "Success. No rows returned"

#### Option 2: Supabase CLI

```bash
# Supabase CLI 설치 (필요시)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref oelgskajaisratnbffip

# 마이그레이션 실행
supabase db push

# 타입 재생성
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts
```

### 검증

```sql
-- 스키마 확인
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'music_tracks'
AND column_name IN ('description', 'genre', 'mood');
```

**예상 결과**:
```
description | text    | null
genre       | varchar | 100
mood        | varchar | 100
```

---

## 2. Tailwind CSS v4 마이그레이션

### 주요 변경사항

**Next.js 15 + Tailwind CSS v4 업그레이드**
- Tailwind CSS v3 → v4
- PostCSS 설정 변경
- CSS 변수 기반 색상 시스템

### 1단계: 패키지 업데이트

```bash
npm install -D tailwindcss@next @tailwindcss/postcss@next
```

### 2단계: PostCSS 설정

**postcss.config.mjs**:
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

### 3단계: Tailwind 설정 제거

Tailwind CSS v4는 `tailwind.config.ts` 파일이 **불필요**합니다.
모든 설정은 CSS에서 `@theme` 지시어로 관리합니다.

```bash
# tailwind.config.ts 삭제 (v4에서는 사용 안 함)
rm tailwind.config.ts
```

### 4단계: globals.css 업데이트

**src/app/globals.css**:
```css
@import "tailwindcss";

@theme {
  /* 색상 변수 정의 */
  --color-primary: #3b82f6;
  --color-secondary: #10b981;

  /* 다크 모드 색상 */
  .dark {
    --color-primary: #60a5fa;
    --color-secondary: #34d399;
  }
}

/* 기타 글로벌 스타일 */
```

### 5단계: CSS 변수 사용

**Before (v3)**:
```tsx
<div className="bg-blue-500 text-white">
```

**After (v4)**:
```tsx
<div className="bg-[var(--color-primary)] text-white">
// 또는
<div style={{ backgroundColor: 'var(--color-primary)' }}>
```

### 6단계: 빌드 테스트

```bash
# 빌드 확인
npm run build

# 개발 서버 시작
npm run dev
```

---

## 마이그레이션 체크리스트

### Database

- [ ] music_tracks 테이블 스키마 업데이트
- [ ] 스키마 변경 검증
- [ ] TypeScript 타입 재생성
- [ ] 기존 데이터 정상 작동 확인

### Tailwind CSS v4

- [ ] tailwindcss@next 설치
- [ ] postcss.config.mjs 업데이트
- [ ] tailwind.config.ts 제거
- [ ] globals.css @theme 설정
- [ ] 빌드 성공 확인
- [ ] 스타일 정상 작동 확인

---

## 문제 해결

### 문제 1: Tailwind 빌드 에러

**에러**: `Cannot find module '@tailwindcss/postcss'`

**해결**:
```bash
npm install -D @tailwindcss/postcss@next
rm -rf .next
npm run dev
```

### 문제 2: CSS 변수 적용 안 됨

**원인**: @theme 블록 위치 오류

**해결**: `@import "tailwindcss"` 다음에 `@theme` 위치

```css
@import "tailwindcss";

@theme {
  /* 여기에 변수 정의 */
}
```

### 문제 3: DB 타입 불일치

**에러**: TypeScript 타입 오류

**해결**:
```bash
# 타입 재생성
supabase gen types typescript --project-id oelgskajaisratnbffip > src/types/database.ts

# 개발 서버 재시작
npm run dev
```

---

## 참고 문서

- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/docs/v4-beta)
- [Supabase CLI 문서](https://supabase.com/docs/guides/cli)
- [Next.js 15 마이그레이션 가이드](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
