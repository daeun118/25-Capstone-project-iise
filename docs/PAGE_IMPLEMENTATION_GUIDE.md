# BookBeats 페이지 구현 가이드

**작성일**: 2025-10-20
**목적**: 10개 핵심 페이지의 상세 구현 가이드
**전제**: 60개 공통 컴포넌트 구현 완료

---

## ✅ 구현 완료 페이지 (2/10)

1. ✅ **로그인 페이지** (`/login`) - Phase 2 완료
2. ✅ **회원가입 페이지** (`/signup`) - Phase 2 완료

---

## 📋 구현 대기 페이지 (8/10)

### 1️⃣ 홈페이지 `/` (Priority: P0)

**파일 경로**: `src/app/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ Hero Section (그라데이션 배경 + 타이틀 + CTA)
└─ Features Section (3컬럼 Card 그리드)
└─ How It Works (4단계 스텝)
└─ Featured Posts (PostCard 2개)
└─ CTA Section (회원가입 유도)
```

**사용 컴포넌트**:
- `AppLayout` - 전체 레이아웃
- `Button` - CTA 버튼
- `Card`, `CardHeader`, `CardTitle`, `CardDescription` - 특징 카드
- `PostCard` - 게시물 미리보기
- `BookOpen`, `Music`, `Users`, `Sparkles` - Lucide 아이콘

**주요 로직**:
- `'use client'` 필수 (Link 사용)
- Mock data로 `mockFeaturedPosts` 2개 정의
- 반응형: `md:` 브레이크포인트 활용

**스타일링 포인트**:
- Hero: `py-20`, `bg-gradient-to-br from-primary/10`
- Features: `grid md:grid-cols-3`
- How It Works: 단계별 연결선 (CSS absolute positioning)

---

### 2️⃣ 내 책장 `/library` (Priority: P0)

**파일 경로**: `src/app/(main)/library/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ Sidebar (독서 현황 통계)
└─ Main Content
    ├─ Tabs (읽는 중 / 완독)
    ├─ FilterBar (정렬)
    ├─ JourneyCard 그리드 (4컬럼)
    └─ Pagination
    └─ FloatingActionButton (새 여정 시작)
```

**사용 컴포넌트**:
- `AppLayout` - 전체 레이아웃
- `Sidebar` - 사이드바 (독서 통계)
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - 탭 전환
- `FilterBar` - 정렬 (카테고리 숨김)
- `JourneyCard` - 여정 카드
- `EmptyState` - 빈 상태
- `Pagination` - 페이지네이션
- `Button` (FAB) - 플로팅 버튼

**주요 로직**:
```tsx
const [activeTab, setActiveTab] = useState('reading'); // reading | completed
const [sort, setSort] = useState('latest'); // latest | oldest
const [page, setPage] = useState(1);

// Mock data
const mockJourneys = [/* 6-10개 */];
const filteredJourneys = mockJourneys.filter(j => j.status === activeTab);
```

**스타일링 포인트**:
- 2컬럼 레이아웃: `grid md:grid-cols-[240px_1fr]`
- FAB: `fixed bottom-6 right-6 z-50`
- JourneyCard 그리드: `grid md:grid-cols-2 lg:grid-cols-4`

---

### 3️⃣ 여정 시작 `/journey/new` (Priority: P0)

**파일 경로**: `src/app/(main)/journey/new/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ BookSearchDialog (자동 오픈)
└─ 선택 영역
    ├─ BookCard (선택한 책)
    ├─ MusicGenerationStatus (v0 생성 중)
    ├─ MusicPlayer (생성 완료)
    └─ Button (여정 시작하기)
```

**사용 컴포넌트**:
- `AppLayout`
- `BookSearchDialog`
- `BookCard` (variant="search")
- `MusicGenerationStatus`
- `MusicPlayer`
- `Button`
- `LoadingSpinner`

**주요 로직**:
```tsx
const [dialogOpen, setDialogOpen] = useState(true); // 자동 오픈
const [selectedBook, setSelectedBook] = useState(null);
const [musicStatus, setMusicStatus] = useState('idle'); // idle | generating | completed | error

// 책 선택 핸들러
const handleBookSelect = async (book) => {
  setSelectedBook(book);
  setDialogOpen(false);
  setMusicStatus('generating');

  // API 호출 (나중에 구현)
  // const response = await fetch('/api/journeys/create', { method: 'POST', body: JSON.stringify(book) });

  // Mock: 2초 후 완료
  setTimeout(() => setMusicStatus('completed'), 2000);
};

// 여정 시작 핸들러
const handleStartJourney = () => {
  toast.success('독서 여정이 시작되었습니다!');
  router.push('/library');
};
```

**스타일링 포인트**:
- 중앙 정렬: `max-w-4xl mx-auto`
- 단계별 표시: musicStatus에 따라 조건부 렌더링

---

### 4️⃣ 여정 상세 `/journey/[id]` (Priority: P0)

**파일 경로**: `src/app/(main)/journey/[id]/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ JourneyHeader (책 정보, 상태, 완독 버튼)
└─ Tabs (기록 / 플레이리스트)
    ├─ Tab 1: 기록
    │   ├─ LogForm
    │   ├─ MusicGenerationStatus
    │   └─ LogList
    ├─ Tab 2: 플레이리스트
    │   ├─ Playlist
    │   └─ MusicPlayer
└─ Dialog (CompleteForm)
```

**사용 컴포넌트**:
- `AppLayout`
- `JourneyHeader`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `LogForm`
- `MusicGenerationStatus`
- `LogList`
- `Playlist`
- `MusicPlayer`
- `Dialog` + `CompleteForm`
- `Button` (완독하기)

**주요 로직**:
```tsx
const { id } = useParams();
const [journey, setJourney] = useState(null);
const [logs, setLogs] = useState([]);
const [musicTracks, setMusicTracks] = useState([]);
const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
const [activeTab, setActiveTab] = useState('logs');

// 로그 추가 핸들러
const handleLogSubmit = async (logData) => {
  // API 호출 (나중에 구현)
  // await fetch(`/api/journeys/${id}/logs`, { method: 'POST', body: JSON.stringify(logData) });

  // Mock: 즉시 추가
  setLogs([...logs, { id: Date.now(), ...logData, version: logs.length + 1 }]);
  toast.success('독서 기록이 추가되었습니다!');
};

// 완독 핸들러
const handleComplete = async (completeData) => {
  // API 호출 (나중에 구현)
  // await fetch(`/api/journeys/${id}/complete`, { method: 'POST', body: JSON.stringify(completeData) });

  setJourney({ ...journey, status: 'completed', ...completeData });
  setCompleteDialogOpen(false);
  toast.success('독서 여정을 완료했습니다!');
};
```

**스타일링 포인트**:
- 2컬럼 탭 레이아웃
- LogForm은 읽는 중(reading) 상태에서만 표시
- 완독 버튼은 header에 고정

---

### 5️⃣ 게시판 `/feed` (Priority: P0)

**파일 경로**: `src/app/(main)/feed/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ FilterBar (카테고리, 정렬, 검색)
└─ PostCard 그리드 (3컬럼)
└─ Pagination
```

**사용 컴포넌트**:
- `AppLayout`
- `FilterBar`
- `PostCard`
- `EmptyState`
- `Pagination`

**주요 로직**:
```tsx
const [category, setCategory] = useState('all');
const [sort, setSort] = useState('latest'); // latest | popular
const [search, setSearch] = useState('');
const [page, setPage] = useState(1);

const categories = [
  { value: 'all', label: '전체' },
  { value: 'novel', label: '소설' },
  { value: 'essay', label: '에세이' },
  { value: 'selfdev', label: '자기계발' },
];

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
];

// Mock data
const mockPosts = [/* 12-20개 */];
const filteredPosts = mockPosts
  .filter(p => category === 'all' || p.journey.bookCategory === category)
  .filter(p => search === '' || p.journey.bookTitle.includes(search) || p.journey.bookAuthor.includes(search))
  .sort((a, b) => sort === 'latest' ? b.createdAt - a.createdAt : b.likesCount - a.likesCount);
```

**스타일링 포인트**:
- PostCard 그리드: `grid md:grid-cols-2 lg:grid-cols-3`
- FilterBar는 sticky: `sticky top-0 z-10`

---

### 6️⃣ 게시물 상세 `/feed/[id]` (Priority: P1)

**파일 경로**: `src/app/(main)/feed/[id]/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ PostDetail (도서 정보, 리뷰, 플레이리스트)
└─ InteractionBar (좋아요, 댓글, 스크랩)
└─ CommentForm
└─ CommentList
└─ SameBookPosts (같은 책 추천)
```

**사용 컴포넌트**:
- `AppLayout`
- `PostDetail`
- `InteractionBar`
- `CommentForm`
- `CommentList`
- `SameBookPosts`

**주요 로직**:
```tsx
const { id } = useParams();
const [post, setPost] = useState(null);
const [comments, setComments] = useState([]);
const [sameBookPosts, setSameBookPosts] = useState([]);

// 좋아요 토글
const handleLikeToggle = () => {
  setPost({ ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 });
};

// 댓글 추가
const handleCommentSubmit = (commentData) => {
  setComments([...comments, { id: Date.now(), ...commentData }]);
  setPost({ ...post, commentsCount: post.commentsCount + 1 });
};
```

**스타일링 포인트**:
- max-w-4xl 중앙 정렬
- PostDetail + InteractionBar + CommentList 순서

---

### 7️⃣ 마이페이지 `/my` (Priority: P1)

**파일 경로**: `src/app/(main)/my/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ Tabs (프로필 / 설정)
    ├─ Tab 1: 프로필
    │   ├─ UserAvatar (size="xl")
    │   ├─ 사용자 정보 (닉네임, 이메일)
    │   ├─ StatsCard 그리드 (4컬럼)
    │   └─ Button (프로필 편집)
    ├─ Tab 2: 설정
    │   ├─ AccessibilitySettings
    │   ├─ ThemeToggle
    │   └─ Button (로그아웃)
```

**사용 컴포넌트**:
- `AppLayout`
- `Tabs`
- `UserAvatar` (size="xl")
- `StatsCard`
- `AccessibilitySettings`
- `ThemeToggle`
- `Button`
- `Dialog` (프로필 편집)
- `Input` (닉네임 변경)

**주요 로직**:
```tsx
const [user, setUser] = useState({ nickname: '사용자', email: 'user@example.com' });
const [stats, setStats] = useState({
  reading: 5,
  completed: 12,
  musicGenerated: 48,
  likesReceived: 156,
});
const [editDialogOpen, setEditDialogOpen] = useState(false);

const handleNicknameChange = (newNickname) => {
  setUser({ ...user, nickname: newNickname });
  setEditDialogOpen(false);
  toast.success('닉네임이 변경되었습니다.');
};

const handleLogout = () => {
  // 로그아웃 로직 (나중에 구현)
  toast.success('로그아웃되었습니다.');
  router.push('/');
};
```

**스타일링 포인트**:
- StatsCard 그리드: `grid md:grid-cols-2 lg:grid-cols-4`
- 프로필 영역 중앙 정렬

---

### 8️⃣ 보관함 `/my/bookmarks` (Priority: P1)

**파일 경로**: `src/app/(main)/my/bookmarks/page.tsx`

**레이아웃 구조**:
```tsx
AppLayout
└─ FilterBar (정렬만)
└─ PostCard 그리드 (3컬럼)
└─ Pagination
```

**사용 컴포넌트**:
- `AppLayout`
- `FilterBar` (showCategory=false, showSearch=false)
- `PostCard`
- `EmptyState`
- `Pagination`

**주요 로직**:
```tsx
const [sort, setSort] = useState('latest');
const [page, setPage] = useState(1);

// Mock data
const mockBookmarkedPosts = [/* 6-10개 */];
```

**스타일링 포인트**:
- `/feed`와 유사하지만 내가 스크랩한 게시물만

---

## 🛠️ 구현 순서 (권장)

### Phase 2 (인증) - ✅ 완료
1. ✅ 로그인 페이지
2. ✅ 회원가입 페이지

### Phase 3 (핵심 독서 플로우)
3. 홈페이지 (/) - 랜딩 페이지
4. 여정 시작 (/journey/new) - 책 선택 + v0 생성
5. 여정 상세 (/journey/[id]) - 기록 작성 + vN 생성
6. 내 책장 (/library) - 여정 목록

### Phase 5 (커뮤니티)
7. 게시판 (/feed) - 게시물 목록
8. 게시물 상세 (/feed/[id]) - 상세 + 댓글

### Phase 6 (사용자)
9. 마이페이지 (/my) - 프로필 + 설정
10. 보관함 (/my/bookmarks) - 스크랩 목록

---

## 📝 구현 시 주의사항

### ✅ DO
1. **컴포넌트 재사용 최우선**: `src/components/CLAUDE.md` 참고
2. **Mock Data 활용**: API 없어도 UI 작동하도록
3. **'use client' 명시**: 상태 관리 필요한 페이지만
4. **Props 인터페이스 준수**: 컴포넌트 문서 확인
5. **Lucide React 아이콘**: emoji 절대 금지

### ❌ DON'T
1. **새 컴포넌트 만들지 말기**: 기존 컴포넌트로 해결
2. **API 먼저 구현하지 말기**: UI 먼저 완성 후 연동
3. **인라인 스타일 금지**: Tailwind CSS만 사용
4. **shadcn/ui 직접 수정 금지**: Props로 커스터마이징

---

## 🎯 다음 단계

1. **홈페이지 구현**: 이 가이드의 1️⃣ 섹션 참고
2. **localhost:3006** 접속하여 확인
3. **단계적 구현**: Phase 3 → Phase 5 → Phase 6 순서

**모든 컴포넌트가 준비되어 있으므로, 페이지 조립만 하면 됩니다!** 🎉
