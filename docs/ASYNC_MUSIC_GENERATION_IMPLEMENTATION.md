# Async Music Generation Implementation

**날짜**: 2025-10-21
**구현 방식**: Async API + Frontend Polling

---

## 📋 개요

Next.js API Routes에서 fire-and-forget async 패턴이 작동하지 않는 문제를 해결하기 위해, 전용 음악 생성 엔드포인트와 프론트엔드 폴링 방식을 도입했습니다.

### 기존 문제
- Next.js API Routes에서 `await` 없이 실행한 Promise는 응답 전송 후 종료됨
- Supabase Edge Functions는 150초 제한이 있어 Mureka의 500초 타임아웃을 수용할 수 없음

### 해결 방법
- **전용 API 엔드포인트**: `/api/music/generate/[id]` (maxDuration=300)
- **프론트엔드 Polling**: 2초마다 음악 트랙 상태 확인
- **Status State Machine**: pending → generating → completed/error

---

## 🔧 구현 세부사항

### 1. 데이터베이스 마이그레이션

**파일**: `supabase/migrations/add_generating_status_to_music_tracks.sql`

```sql
ALTER TABLE music_tracks
DROP CONSTRAINT IF EXISTS music_tracks_status_check;

ALTER TABLE music_tracks
ADD CONSTRAINT music_tracks_status_check
CHECK (status IN ('pending', 'generating', 'completed', 'error'));
```

**목적**: 중간 상태 'generating'을 추가하여 중복 생성 방지

---

### 2. 음악 생성 전용 API 엔드포인트

**파일**: `src/app/api/music/generate/[id]/route.ts`

**주요 기능**:
- maxDuration: 300초 (5분) 허용
- 동기 방식으로 전체 음악 생성 프로세스 실행
- 상태 업데이트: pending → generating → completed/error

**플로우**:
1. Track ID로 music_tracks 조회
2. 이미 완료된 경우 즉시 반환
3. Status를 'generating'으로 업데이트
4. Mureka API 호출 (30초~5분 소요)
5. 음악 파일 다운로드/버퍼 획득
6. Supabase Storage에 업로드
7. Track 상태를 'completed'로 업데이트 + file_url 저장
8. 에러 발생 시 'error' 상태로 업데이트

**코드 예시**:
```typescript
export const maxDuration = 300; // 5 minutes

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: trackId } = await params;
  const supabase = await createClient();

  // 1. Fetch track
  const { data: track } = await supabase
    .from('music_tracks')
    .select('*')
    .eq('id', trackId)
    .single();

  // 2. Update to generating
  await supabase
    .from('music_tracks')
    .update({ status: 'generating' })
    .eq('id', trackId);

  // 3. Generate music with Mureka
  const murekaResult = await generateBackgroundMusic({
    prompt: track.prompt,
    genre: track.genre,
    mood: track.mood,
    tempo: track.tempo,
    duration: 120,
  });

  // 4. Upload to Supabase Storage
  const uploadResult = await uploadMusicFile({
    fileData,
    fileName: `${trackId}.mp3`,
    journeyId,
    trackId,
  });

  // 5. Update to completed
  await supabase
    .from('music_tracks')
    .update({
      status: 'completed',
      file_url: uploadResult.publicUrl,
    })
    .eq('id', trackId);

  return NextResponse.json({ success: true });
}
```

---

### 3. Music Service 업데이트

**파일**: `src/services/music.service.ts`

**변경 사항**:
- `generateMusicFileAsync()` 메서드 제거
- v0, vN, vFinal 생성 시 pending 상태의 track만 생성
- 실제 음악 생성은 프론트엔드에서 트리거

**Before**:
```typescript
// 문제있는 fire-and-forget 패턴
this.generateMusicFileAsync(musicTrack.id, journeyId, promptData)
  .catch((error) => {
    console.error(`Failed to generate music:`, error);
  });
```

**After**:
```typescript
// 프론트엔드 트리거 방식
console.log(`[MusicService] Music track ${musicTrack.id} created with pending status`);
console.log(`[MusicService] Frontend should trigger /api/music/generate/${musicTrack.id}`);

return { musicTrack, log };
```

---

### 4. 프론트엔드 Music Generation Hook

**파일**: `src/hooks/useMusicGeneration.ts`

**주요 기능**:
- 음악 생성 트리거 (fire-and-forget POST)
- 2초 간격 상태 폴링
- 진행률 시뮬레이션 (0→90%)
- 완료/에러 시 Toast 알림
- 자동 cleanup (unmount 시)

**사용 예시**:
```typescript
const { triggerGeneration, status, progress, fileUrl } = useMusicGeneration();

// 여정 생성 후 음악 생성 트리거
if (data.musicTrack?.id) {
  triggerGeneration(data.musicTrack.id);
}
```

**내부 동작**:
```typescript
export function useMusicGeneration() {
  const triggerGeneration = useCallback(async (trackId: string) => {
    // 1. Progress 시뮬레이션 시작
    startProgressSimulation();

    // 2. 음악 생성 트리거 (fire-and-forget)
    fetch(`/api/music/generate/${trackId}`, { method: 'POST' })
      .catch((err) => console.error(err));

    // 3. 2초마다 상태 폴링
    pollingInterval.current = setInterval(() => {
      pollTrackStatus(trackId);
    }, 2000);
  }, []);

  const pollTrackStatus = useCallback(async (trackId: string) => {
    const response = await fetch(`/api/music/${trackId}`);
    const track: MusicTrack = await response.json();

    if (track.status === 'completed') {
      setProgress(100);
      stopPolling();
      toast.success('음악 생성이 완료되었습니다!');
    } else if (track.status === 'error') {
      stopPolling();
      toast.error('음악 생성에 실패했습니다');
    }
  }, []);

  return {
    triggerGeneration,
    status,
    progress,
    isGenerating: status === 'generating' || status === 'pending',
    fileUrl,
    error,
  };
}
```

---

### 5. UI 통합

#### 5.1 여정 생성 페이지

**파일**: `src/app/(main)/journey/new/page.tsx`

```typescript
const { triggerGeneration } = useMusicGeneration();

const handleBookSelect = async (book: any) => {
  const response = await fetch('/api/journeys/create', {
    method: 'POST',
    body: JSON.stringify({ book_title, ... }),
  });

  const data = await response.json();

  if (data.success && data.journey) {
    toast.success('독서 여정이 시작되었습니다! v0 음악을 생성하고 있습니다.');

    // 음악 생성 트리거
    if (data.musicTrack?.id) {
      triggerGeneration(data.musicTrack.id);
    }

    router.push(`/journey/${data.journey.id}`);
  }
};
```

#### 5.2 여정 상세 페이지

**파일**: `src/app/(main)/journey/[id]/page.tsx`

**기능**:
- 생성 중인 트랙 추적 (`generatingTracks` Set)
- 2초마다 자동 폴링 (생성 중인 트랙이 있을 때만)
- 독서 기록 추가 시 음악 생성 트리거

```typescript
const [generatingTracks, setGeneratingTracks] = useState<Set<string>>(new Set());
const { triggerGeneration } = useMusicGeneration();

// 생성 중인 트랙이 있으면 폴링 시작
useEffect(() => {
  if (generatingTracks.size === 0) return;

  const pollInterval = setInterval(async () => {
    await fetchJourney();
  }, 2000);

  return () => clearInterval(pollInterval);
}, [generatingTracks]);

// fetchJourney에서 생성 중인 트랙 추적
const fetchJourney = async () => {
  const logsData = await fetch(`/api/journeys/${journeyId}/logs`);
  const logs = logsData.logs || [];

  const newGeneratingTracks = new Set<string>();
  logs.forEach((log) => {
    if (log.music_track?.status === 'pending' || log.music_track?.status === 'generating') {
      newGeneratingTracks.add(log.music_track.id);
    }
  });
  setGeneratingTracks(newGeneratingTracks);
};

// 독서 기록 추가 시
const handleSubmitLog = async (data) => {
  const result = await fetch(`/api/journeys/${journeyId}/logs`, { ... });

  if (result.musicTrack?.id) {
    triggerGeneration(result.musicTrack.id);
  }

  await fetchJourney();
};
```

#### 5.3 LogList 컴포넌트

**파일**: `src/components/journey/LogList.tsx`

**UI 개선**:
- 'generating' 상태에 Loader2 스피너 아이콘 표시
- 'error' 상태에 AlertCircle 아이콘 + destructive variant
- 'completed' 상태에 Music 아이콘 + default variant

```typescript
<Badge
  variant={
    track.status === 'completed' ? 'default' :
    track.status === 'error' ? 'destructive' :
    'secondary'
  }
>
  {track.status === 'pending' || track.status === 'generating' ? (
    <>
      <Loader2 className="size-3 mr-1 animate-spin" />
      음악 생성 중
    </>
  ) : track.status === 'completed' ? (
    <>
      <Music className="size-3 mr-1" />
      음악 준비됨
    </>
  ) : (
    <>
      <AlertCircle className="size-3 mr-1" />
      생성 실패
    </>
  )}
</Badge>
```

---

## 🌊 전체 플로우

### v0 음악 생성 (여정 시작)
```
1. 사용자가 책 선택 → POST /api/journeys/create
2. API: journey, music_track (pending), reading_log v0 생성
3. API: { journey, musicTrack } 반환
4. Frontend: triggerGeneration(musicTrack.id) 호출
5. Frontend: POST /api/music/generate/{id} (fire-and-forget)
6. Frontend: 여정 상세 페이지로 이동
7. Backend: 음악 생성 시작 (30초~5분)
   - Status: pending → generating
   - Mureka API 호출
   - Supabase Storage 업로드
   - Status: generating → completed
8. Frontend: 2초마다 폴링하여 상태 확인
9. Frontend: completed 되면 toast 알림 + 음악 재생 가능
```

### vN 음악 생성 (독서 기록 추가)
```
1. 사용자가 독서 기록 작성 → POST /api/journeys/{id}/logs
2. API: reading_log, music_track (pending) 생성
3. API: { log, musicTrack } 반환
4. Frontend: triggerGeneration(musicTrack.id) 호출
5. Frontend: POST /api/music/generate/{id} (fire-and-forget)
6. Frontend: fetchJourney() 호출하여 UI 갱신
7. Backend: 음악 생성 (v0와 동일)
8. Frontend: 폴링으로 상태 확인 → 완료 시 알림
```

---

## ⚙️ 기술적 세부사항

### Status State Machine
```
pending    : 초기 상태, 음악 생성 대기 중
  ↓
generating : 음악 생성 진행 중 (Mureka API 호출)
  ↓
completed  : 음악 생성 완료, file_url 사용 가능
error      : 음악 생성 실패
```

### 타임아웃 설정
- **Next.js API Route**: maxDuration = 300 (5분)
- **Mureka Client**: timeout = 300초 (5분)
- **Frontend Polling**: 2초 간격
- **Progress Simulation**: 1초당 업데이트 (0→90%)

### 에러 처리
- **Mureka API 실패**: status='error', error_message 저장
- **Storage 업로드 실패**: status='error', 에러 메시지 저장
- **Network 에러**: Frontend polling 계속 시도 (중단 안 함)

---

## ✅ 구현 완료 목록

- [x] 데이터베이스 마이그레이션 ('generating' status 추가)
- [x] 전용 API 엔드포인트 생성 (`/api/music/generate/[id]`)
- [x] Music Service 업데이트 (fire-and-forget 제거)
- [x] useMusicGeneration Hook 생성
- [x] 여정 생성 페이지 통합
- [x] 여정 상세 페이지 통합 (폴링 포함)
- [x] LogList UI 업데이트 (생성 중 표시)
- [ ] End-to-end 테스트 (Playwright)

---

## 🧪 테스트 계획

### 시나리오 1: 여정 생성 + v0 음악 생성
1. 로그인
2. 도서 검색 → 책 선택
3. 여정 생성 API 호출
4. 음악 생성 트리거 확인
5. 여정 상세 페이지로 이동
6. 폴링 시작 확인
7. 음악 생성 완료까지 대기 (최대 5분)
8. 음악 재생 가능 확인

### 시나리오 2: 독서 기록 추가 + vN 음악 생성
1. 기존 여정 접속
2. 독서 기록 작성
3. vN 음악 생성 트리거 확인
4. 폴링으로 상태 업데이트 확인
5. 완료 시 toast 알림 확인

### 시나리오 3: 에러 처리
1. Mureka API 에러 시뮬레이션
2. status='error' 확인
3. UI에서 "생성 실패" 표시 확인

---

## 📊 성능 고려사항

### 장점
- ✅ 사용자는 음악 생성을 기다리지 않고 다른 작업 가능
- ✅ 완료 시 즉시 재생 가능
- ✅ 여러 음악을 동시에 생성 가능 (병렬 처리)
- ✅ 에러 발생 시 명확한 피드백

### 최적화 포인트
- 폴링 간격: 2초 (조정 가능)
- 진행률 시뮬레이션: UX 개선 (실제 진행률 아님)
- 자동 cleanup: 메모리 누수 방지

### 향후 개선 방향
- WebSocket 또는 Server-Sent Events로 실시간 알림
- 실제 진행률 추적 (Mureka API가 지원하는 경우)
- 음악 생성 큐 시스템 (동시 생성 제한)

---

**작성자**: Claude Code
**검증 상태**: 구현 완료, 테스트 대기 중
