# Design Pattern Quick Reference

**프로젝트**: Reading Experience Platform
**용도**: 빠른 디자인 결정 참조 가이드

---

## 🎯 핵심 디자인 결정 (6가지)

### 1. 피드 레이아웃
**결정**: Adaptive Grid (데스크톱 3-4열, 모바일 2열)
**이유**: 일관성 + 큐레이션 느낌 + 간단한 구현
**레퍼런스**: Instagram, Behance, Spotify

### 2. 음악 플레이어
**결정**: 하단 고정 미니 플레이어 + 확장 모달
**이유**: 페이지 이동 시에도 음악 지속 + 모바일 친화적
**레퍼런스**: Spotify, YouTube Music, Apple Music

### 3. 카드 디자인
**결정**: Soft Shadow + 12px Radius + Hover Lift (-4px)
**이유**: 미묘한 깊이감 + 앨범커버 강조 + 클릭 유도
**레퍼런스**: Spotify, Apple Music, Pinterest

### 4. 감정 태그
**결정**: Soft Pill Chips (둥근 칩, 감정별 색상)
**이유**: 감정적 부드러움 + 시각적 구분 + 클릭 암시
**레퍼런스**: 밀리의 서재 Semantic Tokens, Material Design

### 5. 타임라인
**결정**: Vertical Timeline (세로 타임라인)
**이유**: 모바일 스크롤 친화 + 풍부한 콘텐츠 표시 + 스토리텔링
**레퍼런스**: Notion Timeline, Strava, Instagram Feed

### 6. 색상 톤
**결정**: 따뜻한 중립 톤 (Warm Neutral) + 감정별 Accent
**이유**: 독서의 아늑함 + 음악의 감성 + 브랜드 정체성
**레퍼런스**: 밀리의 서재, Instagram, Spotify 동적 색상

---

## 🎨 색상 팔레트

### Primary (독서 - Warm Orange)
- Main: `#F97316`
- Light: `#FDBA74`
- Dark: `#C2410C`

### Secondary (음악 - Purple)
- Main: `#8B5CF6`
- Light: `#C4B5FD`
- Dark: `#6D28D9`

### Neutral (따뜻한 그레이)
- Background: `#FAFAF9`
- Surface: `#FFFFFF`
- Text: `#1C1917`
- Border: `#E7E5E4`

### Emotion Colors
- 기쁨: `#F59E0B` (Amber)
- 슬픔: `#3B82F6` (Blue)
- 고독: `#6366F1` (Indigo)
- 설렘: `#EC4899` (Pink)
- 평온: `#10B981` (Green)
- 분노: `#EF4444` (Red)
- 두려움: `#6B7280` (Gray)
- 희망: `#34D399` (Emerald)

---

## 📐 간격 시스템

```
4px   - 미세 간격 (태그 내부 패딩)
8px   - 작은 간격 (아이콘-텍스트)
12px  - 기본 간격 (카드 내부)
16px  - 중간 간격 (요소 간)
24px  - 큰 간격 (섹션 간)
32px  - 매우 큰 간격
48px  - 섹션 구분
64px  - 페이지 구분
```

---

## 🔤 타이포그래피

### Font Family
- **UI**: Pretendard, Inter, sans-serif
- **Content**: Georgia, Noto Serif, serif
- **Icons**: Lucide React

### Font Scale
- XS: `12px` (감정 태그, 메타데이터)
- SM: `14px` (본문 보조)
- Base: `16px` (기본 본문)
- LG: `18px` (강조 텍스트)
- XL: `20px` (부제목)
- 2XL: `24px` (카드 제목)
- 3XL: `30px` (섹션 제목)
- 4XL: `36px` (페이지 제목)

---

## 💳 카드 구조

```
┌─────────────────────────┐
│   [앨범커버 이미지]      │  ← 비주얼 중심
│   3:4 비율              │
├─────────────────────────┤
│ 책 제목 (2XL, Bold)     │  ← 계층 구조
│ 저자 (SM, Secondary)    │
├─────────────────────────┤
│ 🎵 v0 → v1 → v2 → vFinal │  ← 독서 진행
│ [기쁨] [고독] [평온]    │  ← 감정 태그 (Pill)
├─────────────────────────┤
│ ♥ 123  💬 45  🔖 67     │  ← 상호작용
└─────────────────────────┘

Shadow: Soft (hover시 lift)
Radius: 12px
Padding: 16px
Gap: 12px
```

---

## 🎵 음악 플레이어 구조

### Mini Player (하단 고정)
```
┌─────────────────────────────────────┐
│ [앨범] | 곡 정보 | ⏮️ ⏸️ ⏭️ | 🔊 📄 │
└─────────────────────────────────────┘
Height: 80px
Position: fixed bottom-0
Backdrop: blur(10px) + opacity 95%
```

### Full Player (확장 모달)
```
┌─────────────────────────┐
│                         │
│   [대형 앨범커버]        │
│                         │
├─────────────────────────┤
│   곡 제목               │
│   책 정보               │
├─────────────────────────┤
│   ━━━━●━━━━━━━         │  ← Progress bar
│   1:23 / 3:45           │
├─────────────────────────┤
│   ⏮️  ⏸️  ⏭️  🔁  ❤️   │  ← Controls
├─────────────────────────┤
│   Playlist              │
│   - v0: 시작의 음악      │
│   - v1: 첫 기록         │
│   - v2: 현재 (재생 중)  │
└─────────────────────────┘
Backdrop: blur + warm gradient
Animation: slide-up (Framer Motion)
```

---

## 📅 타임라인 구조

```
    ●── v0: 시작의 음악
    │   "노인과 바다를 시작했습니다"
    │   🎵 [재생]
    │
    ●── v1: 첫 번째 기록
    │   "노인은 외로웠지만..."
    │   [고독] [의지]
    │   🎵 [재생]
    │
    ◉── v2: 현재 읽는 중 (펄스 애니메이션)
    │   "마침내 물고기가..."
    │   [긴장] [희망]
    │
    ○── v3: 앞으로 추가될 기록

선 색상: Gradient (Purple → Pink)
점 크기: 16px
간격: 40px
애니메이션: 현재 기록은 pulse
```

---

## 🎯 핵심 원칙

1. **단순성 우선**: 복잡한 기능보다 핵심 경험에 집중
2. **비주얼 중심**: 책 표지 + 앨범커버가 주인공
3. **감정 중심**: 감정 태그 색상으로 시각화
4. **플레이리스트 경험**: 독서 여정 = 음악 플레이리스트
5. **커뮤니티**: 직관적 상호작용 (더블 탭, 댓글, 스크랩)
6. **반응형**: 모바일 우선 설계

---

## ⚠️ 회피 사항 (Anti-Patterns)

- ❌ Goodreads: 과도한 색상, 작은 글꼴, 복잡한 내비게이션
- ❌ 밀리의 서재: 정보 과다, 복잡한 구조
- ❌ Spotify (2025): 기능 과다로 인한 클러터
- ❌ Strava (2025): 지나친 비주얼로 정보 손실

---

## 🚀 구현 체크리스트

### Phase 1: Foundation
- [ ] Tailwind config 설정 (색상, 간격, 타이포그래피)
- [ ] CSS 변수 정의
- [ ] 기본 컴포넌트 스타일

### Phase 2: Core Components
- [ ] JourneyCard 컴포넌트
- [ ] EmotionTag 컴포넌트
- [ ] MiniPlayer 컴포넌트
- [ ] VerticalTimeline 컴포넌트

### Phase 3: Layout
- [ ] Feed Grid 레이아웃
- [ ] Hover/Active 인터랙션
- [ ] Responsive breakpoints

### Phase 4: Polish
- [ ] Framer Motion 애니메이션
- [ ] 스켈레톤 로딩
- [ ] 에러 상태

---

**상세 문서**: [design-decisions.md](./design-decisions.md)
**레퍼런스**: [references.md](./references.md)
