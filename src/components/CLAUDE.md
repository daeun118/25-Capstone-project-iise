# BookBeats Component Library

**작성일**: 2025-10-21
**목적**: BookBeats 프로젝트의 재사용 가능한 컴포넌트 가이드
**테스트 페이지**: http://localhost:3000/test-design

---

## 📐 핵심 원칙

1. **컴포넌트 재사용 우선** - 기존 컴포넌트를 최대한 재사용
2. **Props 인터페이스 엄수** - TypeScript 인터페이스 준수
3. **Variant 시스템 활용** - variant prop으로 다양한 스타일 지원
4. **Lucide React 아이콘 사용** - emoji 절대 금지

---

## 📦 구현 완료 현황

### ✅ shadcn/ui 기본 컴포넌트 (필수)

**경로**: `@/components/ui/`

**주요 컴포넌트**:
- button, input, textarea, card, dialog, select
- badge, avatar, tabs, skeleton, progress
- checkbox, radio-group, slider, form
- dropdown-menu, popover, tooltip
- sonner (toast)
- carousel, sheet

**사용 예시**:
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Variants
<Button variant="outline" size="sm">버튼</Button>
<Badge variant="secondary">배지</Badge>
```

---

### ✅ 레이아웃 컴포넌트

#### AppLayout
전체 앱 레이아웃 래퍼. Header + Content + Footer 구조.

```typescript
import { AppLayout } from '@/components/layout/AppLayout';

<AppLayout>
  <div className="container py-8">
    {/* 페이지 내용 */}
  </div>
</AppLayout>
```

#### Header
상단 네비게이션. 로고, 탭 메뉴, 검색, 사용자 드롭다운, 다크모드 토글 포함.

```typescript
import { Header } from '@/components/layout/Header';
// AppLayout 내부에서 자동 사용됨
```

#### Footer
하단 푸터. 서비스 링크, 법적 고지, 소셜 링크 포함.

```typescript
import { Footer } from '@/components/layout/Footer';
// AppLayout 내부에서 자동 사용됨
```

---

### ✅ 공통 컴포넌트

#### LoadingSpinner
로딩 스피너. 3가지 크기 (sm, md, lg) 지원.

```typescript
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

<LoadingSpinner size="md" message="로딩 중..." />
```

#### EmptyState
빈 상태 표시. 아이콘, 메시지, 액션 버튼 포함.

```typescript
import { EmptyState } from '@/components/common/EmptyState';
import { BookOpen } from 'lucide-react';

<EmptyState
  icon={BookOpen}
  title="독서 여정이 없습니다"
  description="새로운 책으로 독서를 시작해보세요."
  action={{
    label: "도서 검색",
    onClick: () => openSearchDialog()
  }}
/>
```

#### Pagination
페이지네이션. ... 축약 표시 지원.

```typescript
import { Pagination } from '@/components/common/Pagination';

<Pagination
  currentPage={page}
  totalPages={20}
  onPageChange={setPage}
/>
```

#### ThemeToggle
다크모드 토글. localStorage 저장.

```typescript
import { ThemeToggle } from '@/components/common/ThemeToggle';

<ThemeToggle />
```

#### ErrorBoundary
에러 캐치 및 복구. React 클래스 컴포넌트.

```typescript
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### ConfirmDialog
확인/취소 다이얼로그. variant="destructive" 지원.

```typescript
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="게시물 삭제"
  description="정말 삭제하시겠습니까?"
  variant="destructive"
  confirmText="삭제"
  onConfirm={() => handleDelete()}
/>
```

#### FilterBar
카테고리 필터 + 정렬 + 검색.

```typescript
import { FilterBar } from '@/components/common/FilterBar';

<FilterBar
  categories={[
    { value: 'all', label: '전체' },
    { value: 'novel', label: '소설' }
  ]}
  selectedCategory={category}
  onCategoryChange={setCategory}
  sortOptions={[
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' }
  ]}
  selectedSort={sort}
  onSortChange={setSort}
  showSearch
  searchValue={search}
  onSearchChange={setSearch}
/>
```

---

## ✅ 도메인 컴포넌트

### 인증 (Auth)
- **LoginForm**: 이메일/비밀번호 로그인 폼
- **SignupForm**: 회원가입 폼 (닉네임, 약관 동의 포함)
- **SocialLoginButtons**: Google, Kakao 소셜 로그인

### 도서 (Book)
- **BookSearchDialog**: Google Books API 검색 다이얼로그
- **BookCard**: 도서 정보 카드 (variant: search, library, compact)
- **BookCover**: 도서 표지 이미지 컴포넌트

### 독서 여정 (Journey)
- **JourneyCard**: 독서 여정 카드 (통계, 상태 포함)
- **JourneyHeader**: 독서 여정 상세 헤더
- **LogForm**: 독서 기록 작성 폼
- **LogList**: 독서 기록 목록
- **CompleteForm**: 완독 폼 (별점, 한줄평, 감상평)
- **EmotionTagSelector**: 감정 태그 선택기 (프리셋 + 커스텀)

### 음악 (Music)
- **MusicPlayer**: 음악 재생기 (재생/일시정지, 볼륨, 진행바)
- **Waveform**: 음악 웨이브폼 시각화 (Placeholder)
- **Playlist**: 음악 플레이리스트
- **MusicGenerationStatus**: 음악 생성 상태 표시

### 게시물 (Post)
- **PostCard**: 게시물 카드 (도서 정보, 리뷰 미리보기)
- **PostDetail**: 게시물 상세 (리뷰 전체, 플레이리스트, 댓글)
- **InteractionBar**: 상호작용 버튼 (좋아요, 댓글, 스크랩)
- **CommentList**: 댓글 목록
- **CommentForm**: 댓글 작성 폼
- **SameBookPosts**: 같은 책 게시물 목록

### 사용자 (User)
- **UserAvatar**: 사용자 아바타 (이니셜, 온라인 상태)
- **UserProfileDropdown**: 사용자 프로필 드롭다운 메뉴

### 데이터 표시
- **RatingDisplay**: 별점 표시/입력 컴포넌트
- **StatsCard**: 통계 카드 (아이콘, 트렌드 포함)

### 설정
- **AccessibilitySettings**: 접근성 설정 (글씨 크기, 줄 간격, 고대비)

---

## 💡 사용 가이드

### 1. 페이지 구현 워크플로우
```
1. src/components/CLAUDE.md 확인 (이 파일)
2. 필요한 컴포넌트 import
3. Props 인터페이스 준수
4. 기존 컴포넌트로 해결 안되면 variant 추가 고려
5. 새 컴포넌트 생성 (최후의 수단)
```

### 2. 컴포넌트 탐색
- **구현 여부 확인**: 이 문서의 "구현 완료 현황" 섹션 참고
- **테스트 페이지**: http://localhost:3000/test-design
- **세부 Props**: 컴포넌트 파일의 TypeScript 인터페이스 참고

### 3. 컴포넌트 Import 경로
```typescript
// shadcn/ui 기본
import { Button } from '@/components/ui/button';

// 레이아웃
import { AppLayout } from '@/components/layout/AppLayout';

// 공통
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// 아이콘
import { BookOpen, Heart, Search } from 'lucide-react';
```

---

## 🚫 금지 사항

1. **emoji 사용 금지** - 항상 Lucide React 아이콘 사용
2. **shadcn/ui 컴포넌트 직접 수정 금지** - 래퍼 컴포넌트 생성
3. **인라인 스타일 금지** - Tailwind CSS 클래스 사용
4. **Props 임의 변경 금지** - 정의된 인터페이스 준수

---

**참고**:
- shadcn/ui 문서: https://ui.shadcn.com/
- 디자인 시스템은 별도로 정의될 예정
