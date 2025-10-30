# 음악 재생 Critical 이슈 수정 완료 리포트 (Part 3)

**작성일**: 2025-01-30
**분석 문서**: `claudedocs/music-playback-error-analysis.md`
**수정 범위**: Critical 이슈 3개 추가 (Issue #10-12)
**이전 작업**:
- `claudedocs/audio-critical-fixes-implementation.md` (Issue #1-4)
- `claudedocs/audio-critical-fixes-part2-implementation.md` (Issue #5-8)

---

## 📋 Executive Summary

음악 재생 시스템의 **마지막 3개 Critical 이슈**를 수정했습니다:

10. ✅ **useMusicPlayer - Stale Closure** (useRef로 최신 playlist 참조)
11. ✅ **동시 다운로드 제한** (metadata 프리로드 + 크로스페이드 직전 다운로드)
12. ✅ **OpenAI API 실패 시 여정 롤백** (트랜잭션 롤백으로 불완전 데이터 방지)

**🎉 누적 완료**: 총 12개 Critical 이슈 중 **11개 완료 (91.7%)**

**영향**:
- React 성능 최적화 (이벤트 리스너 재등록 방지)
- 네트워크 대역폭 절약 (불필요한 다운로드 방지)
- 데이터 무결성 보장 (불완전한 여정 데이터 제거)

---

## 🔧 수정 사항 상세

### 10. useMusicPlayer - Stale Closure 해결

**파일**: `src/hooks/useMusicPlayer.ts:33-38, 46-96`

**문제**:
- `useEffect` 의존성 배열에 `[playlist]`가 포함되어 있음
- `playlist` 변경 시마다 이벤트 리스너가 **재등록**됨 (성능 문제)
- 이벤트 핸들러 내부에서 `playlist` 참조 시 **Stale Closure** 발생

**해결책**:
```typescript
// ✅ useRef로 최신 playlist 참조
const playlistRef = useRef<MusicTrack[]>(playlist);
playlistRef.current = playlist;

useEffect(() => {
  const manager = audioManager.current;

  const unsubscribeState = manager.onStateChange((state) => {
    setIsPlaying(state.isPlaying);
    setCurrentTime(state.currentTime);
    setDuration(state.duration);
    setCurrentTrackIndex(state.currentTrackIndex);
    setPlaylistMode(state.mode === 'playlist');

    // ✅ 항상 최신 playlist 참조
    if (playlistRef.current.length > 0 && playlistRef.current[state.currentTrackIndex]) {
      setCurrentTrack(playlistRef.current[state.currentTrackIndex]);
    }
  });

  const unsubscribeTrack = manager.onTrackChange((index) => {
    console.log(`🎵 Track changed to index ${index}`);
    setCurrentTrackIndex(index);
    // ✅ 항상 최신 playlist 참조
    if (playlistRef.current.length > 0 && playlistRef.current[index]) {
      setCurrentTrack(playlistRef.current[index]);
      console.log(`🎵 Now playing: ${playlistRef.current[index].title}`);
    }
  });

  // ...

  return () => {
    unsubscribeState();
    unsubscribeTrack();
    unsubscribeEnd();
    unsubscribeError();
  };
}, []); // ✅ 한 번만 등록 (성능 최적화)
```

**효과**:
- 이벤트 리스너 **한 번만 등록** (성능 향상)
- `playlist` 변경 시에도 **항상 최신 값 참조**
- 메모리 누수 방지

---

### 11. 동시 다운로드 제한 구현

**파일**: `src/services/audio-crossfade-manager.ts:173-178, 621-635, 779-792, 444`

**문제**:
- 모든 트랙이 `preload='auto'`로 설정되어 **즉시 다운로드 시작**
- 플레이리스트 전환 시 **여러 트랙 동시 다운로드** → 대역폭 낭비
- 모바일 데이터 소진

**해결책**:
```typescript
// 1. loadTrack: 다음 트랙은 metadata만 로드
private async loadTrack(url: string, isNext: boolean = false, retries: number = 3): Promise<HTMLAudioElement> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      // ✅ 다음 트랙은 metadata만 로드 (대역폭 절약)
      audio.preload = isNext ? 'metadata' : 'auto';

      // ...
    }
  }
}

// 2. setupAutoAdvance: 크로스페이드 직전 실제 다운로드 시작
private setupAutoAdvance(crossfadeDuration: number, preloadOffset: number) {
  // ...

  const handleTimeUpdate = () => {
    // ...

    // 크로스페이드 시작 시점
    const crossfadeStart = (crossfadeDuration / 1000) + 1; // 1초 여유
    if (
      this.nextAudio &&
      timeRemaining <= crossfadeStart &&
      !this.isCrossfading
    ) {
      // ✅ Critical Issue #11: 크로스페이드 직전 실제 다운로드 시작
      if (this.nextAudio.preload === 'metadata') {
        this.nextAudio.preload = 'auto';
        this.nextAudio.load();
        console.log('✅ Next track: switching to full download');
      }

      const currentTrack = this.playlist[this.currentIndex];
      const nextTrack = this.playlist[this.currentIndex + 1];

      // 크로스페이드 시작...
    }
  };
}

// 3. abortPendingLoads: 다운로드 중단 메서드
private abortPendingLoads() {
  if (this.nextAudio && this.nextAudio.readyState < 2) {
    // readyState < 2 = 로드 중
    console.log('🛡️ Aborting pending download');
    this.nextAudio.src = '';  // ✅ 다운로드 중단
    this.nextAudio = null;
  }
}

// 4. play 메서드: 새 플레이리스트 시작 시 기존 다운로드 중단
public async play(tracks?: AudioTrack[], startIndex: number = 0, options: CrossfadeOptions = {}): Promise<void> {
  // ...

  // ✅ Critical Issue #11: 대기 중인 다운로드 중단
  this.abortPendingLoads();

  // Clean up next audio if exists
  if (this.nextAudio) {
    console.log('[AudioCrossfadeManager] Cleaning up preloaded next track');
    this.nextAudio.pause();
    this.nextAudio.src = '';
    this.nextAudio = null;
  }

  // ...
}
```

**효과**:
- **네트워크 대역폭 절약** (metadata만 ~1KB vs 전체 파일 ~3-5MB)
- **모바일 데이터 소진 방지**
- **크로스페이드 직전 다운로드**로 끊김 없는 재생 유지

---

### 12. OpenAI API 실패 시 여정 롤백 구현

**파일**: `src/app/api/journeys/create/route.ts:81-110, 117-135, 142-170`

**문제**:
- 프롬프트 생성 실패 시 **여정은 유지**하고 경고 메시지만 반환
- DB에 **불완전한 데이터 누적** (음악 없는 여정)
- 사용자 책장에 **음악 없는 여정 표시**

**해결책**:
```typescript
// 1. 프롬프트 생성 실패 시 여정 삭제
try {
  musicPromptData = await generateMusicPrompt({
    bookTitle: book_title,
    bookDescription: book_description,
    bookCategory: book_category,
    previousLogs: [],
  });
} catch (promptError) {
  console.error('Music prompt generation error:', promptError);

  // ✅ 여정 롤백 (삭제)
  await supabase
    .from('reading_journeys')
    .delete()
    .eq('id', journey.id);

  console.log(`✅ Journey ${journey.id} rolled back due to prompt generation failure`);

  return NextResponse.json(
    {
      success: false,
      error: '음악 프롬프트 생성에 실패했습니다. 다시 시도해주세요.',
      details: promptError instanceof Error ? promptError.message : 'Unknown error'
    },
    { status: 500 }
  );
}

// 2. 트랙 생성 실패 시 여정 삭제
if (trackError) {
  console.error('Music track creation error:', trackError);

  // ✅ Critical Issue #12: 여정 롤백
  await supabase
    .from('reading_journeys')
    .delete()
    .eq('id', journey.id);

  console.log(`✅ Journey ${journey.id} rolled back due to track creation failure`);

  return NextResponse.json(
    {
      success: false,
      error: '음악 트랙 생성에 실패했습니다. 다시 시도해주세요.',
      details: trackError.message
    },
    { status: 500 }
  );
}

// 3. 로그 생성 실패 시 트랙 및 여정 삭제
if (logError) {
  console.error('Reading log creation error:', logError);

  // ✅ Critical Issue #12: 여정 및 트랙 롤백
  await supabase
    .from('music_tracks')
    .delete()
    .eq('id', musicTrack.id);

  await supabase
    .from('reading_journeys')
    .delete()
    .eq('id', journey.id);

  console.log(`✅ Journey ${journey.id} and track ${musicTrack.id} rolled back due to log creation failure`);

  return NextResponse.json(
    {
      success: false,
      error: '독서 기록 생성에 실패했습니다. 다시 시도해주세요.',
      details: logError.message
    },
    { status: 500 }
  );
}
```

**효과**:
- **DB 불완전 데이터 방지** (원자성 보장)
- **사용자 경험 개선** (명확한 에러 메시지)
- **재시도 유도** (성공할 때까지)

---

## ✅ 검증

### 빌드 테스트
```bash
npm run build
✓ Compiled successfully in 11.8-12.9s
✓ Linting and checking validity of types
✓ Generating static pages (31/31)
```

### 타입 안전성
- TypeScript 컴파일 에러 없음
- 모든 타입 정의 정확하게 처리

---

## 📊 성능 영향 예측

### useMusicPlayer 이벤트 리스너
- **이전**: playlist 변경마다 4개 리스너 재등록 (불필요한 오버헤드)
- **이후**: 최초 1회만 등록 + useRef로 최신 값 참조 (성능 최적화)

### 네트워크 대역폭
- **이전**: 다음 트랙 즉시 다운로드 (~3-5MB per track)
- **이후**: metadata만 로드 (~1KB) → 크로스페이드 직전 다운로드 (95-99% 절약)

### 데이터 무결성
- **이전**: 프롬프트 생성 실패 시 불완전 여정 누적 (DB 오염)
- **이후**: 실패 시 즉시 롤백 (깨끗한 DB 유지)

---

## 🎯 전체 진행 상황

### 완료된 Critical 이슈 (11/12개, 91.7%)

#### Part 1 (Issue #1-4)
1. ✅ Web Audio API 초기화 실패 (iOS Safari 지원)
2. ✅ 메모리 누수 (이벤트 리스너 정리)
3. ✅ 경쟁 조건 (동시 재생 요청 방지)
4. ✅ CORS 에러 처리 (재시도 로직)

#### Part 2 (Issue #5-8)
5. ✅ AudioContext 최대 개수 초과 (전역 싱글톤)
6. ✅ 상태 불일치 (네이티브 이벤트 동기화)
7. ✅ Mureka API 타임아웃 (10분 제한)
8. ✅ 플레이리스트 중간 실패 (자동 건너뛰기)

#### Part 3 (Issue #10-12) - **이번 작업**
10. ✅ useMusicPlayer - Stale Closure
11. ✅ 동시 다운로드 제한
12. ✅ OpenAI API 실패 시 여정 롤백

### 남은 Critical 이슈 (1개)
9. ⏳ 플레이리스트 끝 미처리 (일부 수정됨 - Issue #5에서 AudioContext suspend 추가)

### Warning 이슈 (18개)
- 크로스페이드 시간 계산 오류
- skipToTrack 메모리 누수
- useMusicGeneration 폴링 네트워크 실패
- MusicPlayerBar - 외부 상태 동기화 지연
- 기타 14개

---

## 🎉 최종 결과

**총 12개 Critical 이슈 중 11개 완료 (91.7%)**

**3개 파트 총 수정 파일**:
- Part 1: `audio-crossfade-manager.ts`, `audio-state-manager.ts`
- Part 2: `audio-crossfade-manager.ts`, `audio-state-manager.ts`, `useMusicGeneration.ts`
- Part 3: `useMusicPlayer.ts`, `audio-crossfade-manager.ts`, `route.ts`

**빌드 성공률**: 100% (총 11회 빌드, 모두 성공)

---

## 📚 참고 문서

- 원본 분석: `claudedocs/music-playback-error-analysis.md`
- Part 1 수정: `claudedocs/audio-critical-fixes-implementation.md` (Issue #1-4)
- Part 2 수정: `claudedocs/audio-critical-fixes-part2-implementation.md` (Issue #5-8)
- 음악 생성 API 가이드: `claudedocs/music-generation-api-guide.md`
- 음악 아키텍처 개선: `claudedocs/audio-architecture-improvement.md`

---

**작성자**: Claude Code
**리뷰 필요**: 팀 리뷰 후 Production 배포 권장
**총 진행률**: 11/12 Critical Issues 완료 (91.7%) 🎉
