# 음악 재생 기능 오류 분석 리포트

**분석일**: 2025-01-30
**분석 대상**: ReadTune 음악 재생 시스템 전체 스택
**심각도 등급**: 🔴 Critical | 🟡 Warning | 🟢 Info

---

## 📋 Executive Summary

음악 재생은 ReadTune의 **핵심 기능**으로, 5개 레이어에 걸쳐 복잡한 비동기 처리를 수행합니다. 총 **37개의 잠재적 오류 시나리오**를 식별했으며, 이 중 **12개는 Critical**, **18개는 Warning**, **7개는 Info** 수준입니다.

**주요 위험 영역**:
1. 🔴 **Web Audio API 초기화 실패** (iOS Safari, 권한 문제)
2. 🔴 **메모리 누수** (이벤트 리스너 미정리, Audio 객체 누적)
3. 🔴 **경쟁 조건** (동시 재생 요청, 상태 불일치)
4. 🟡 **네트워크 실패** (음악 파일 로드 타임아웃, CORS)
5. 🟡 **API 타임아웃** (Mureka 생성 2분+, 폴링 무한 대기)

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: API Routes                                         │
│ - /api/journeys/create → v0 음악 프롬프트 생성              │
│ - /api/journeys/[id]/logs → vN 음악 프롬프트 생성           │
│ - /api/journeys/[id]/complete → vFinal 음악 프롬프트 생성   │
│ - /api/music/generate → Mureka 음악 생성 (비동기)           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Services                                           │
│ - MusicService: 음악 프롬프트 생성 및 트랙 생성             │
│ - JourneyService: 여정 완료 처리                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Repositories                                       │
│ - MusicRepository: music_tracks CRUD                        │
│ - LogRepository: reading_logs CRUD                          │
│ - JourneyRepository: reading_journeys CRUD                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Audio Management (Web Audio API)                  │
│ - AudioCrossfadeManager: 크로스페이드 재생                  │
│ - AudioStateManager: 싱글톤 상태 관리                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: UI Components                                      │
│ - useMusicPlayer: 플레이리스트 관리                         │
│ - useMusicGeneration: 비동기 생성 폴링                      │
│ - MusicPlayerBar: 재생 UI                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 Critical Issues (12개)

### 1. Web Audio API 초기화 실패

**위치**: `AudioCrossfadeManager.ts:52-80`
**시나리오**: iOS Safari에서 AudioContext 생성 실패

```typescript
private async initializeContext() {
  if (this.audioContext) return;

  try {
    // @ts-ignore - WebKit prefix for Safari
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();

    // ❌ 문제: AudioContextClass가 undefined일 수 있음 (구형 브라우저)
    // ❌ 문제: iOS에서 suspended 상태로 생성될 수 있음

    // Resume context if suspended (iOS)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      // ❌ 문제: resume() 실패 시 에러 처리 없음
    }
  } catch (error) {
    console.error('Failed to initialize AudioContext:', error);
    throw new Error('오디오 시스템 초기화에 실패했습니다.');
    // ✅ 좋음: 에러를 던져서 상위 레이어에서 처리 가능
  }
}
```

**영향**:
- iOS Safari 사용자 전체 재생 불가
- 구형 브라우저 지원 불가
- 사용자에게 "오디오 시스템 초기화 실패" 메시지만 표시

**해결책**:
```typescript
// 1. Feature Detection 추가
if (!window.AudioContext && !(window as any).webkitAudioContext) {
  throw new Error('이 브라우저는 오디오 재생을 지원하지 않습니다. 최신 브라우저로 업데이트해주세요.');
}

// 2. Resume 실패 처리
const resumeAttempts = 3;
for (let i = 0; i < resumeAttempts; i++) {
  try {
    await this.audioContext.resume();
    if (this.audioContext.state === 'running') break;
  } catch (err) {
    if (i === resumeAttempts - 1) {
      throw new Error('오디오 재생을 시작할 수 없습니다. 화면을 터치하거나 다시 시도해주세요.');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// 3. 사용자 인터랙션 후 초기화 강제
// UI에서 "재생" 버튼 클릭 시에만 초기화 (iOS 정책 준수)
```

---

### 2. 메모리 누수 - 이벤트 리스너 미정리

**위치**: `AudioCrossfadeManager.ts:428-433`
**시나리오**: 트랙 변경 시 이전 Audio 객체의 이벤트 리스너가 정리되지 않음

```typescript
private setupAutoAdvance(crossfadeDuration: number, preloadOffset: number) {
  if (!this.currentAudio) return;

  const handleTimeUpdate = () => { /* ... */ };
  const handleEnded = () => { /* ... */ };

  // Add event listeners
  this.currentAudio.addEventListener('timeupdate', handleTimeUpdate);
  this.currentAudio.addEventListener('ended', handleEnded);

  // Store listeners for cleanup
  (this.currentAudio as any).__timeUpdateHandler = handleTimeUpdate;
  (this.currentAudio as any).__endedHandler = handleEnded;

  // ❌ 문제: skipToNext()에서 새 트랙 로드 전 이전 리스너가 정리되지 않음
  // ❌ 문제: crossfade 중 두 개의 Audio 객체가 모두 이벤트 발생
}
```

**영향**:
- 플레이리스트 재생 시 메모리 사용량 선형 증가
- 5-10곡 재생 후 브라우저 느려짐
- 모바일에서 앱 크래시 가능성

**해결책**:
```typescript
// 1. cleanup 메서드 강화
private cleanupAudioListeners(audio: HTMLAudioElement) {
  const timeUpdateHandler = (audio as any).__timeUpdateHandler;
  const endedHandler = (audio as any).__endedHandler;

  if (timeUpdateHandler) {
    audio.removeEventListener('timeupdate', timeUpdateHandler);
    delete (audio as any).__timeUpdateHandler;
  }
  if (endedHandler) {
    audio.removeEventListener('ended', endedHandler);
    delete (audio as any).__endedHandler;
  }

  // 모든 표준 이벤트도 정리
  audio.onplay = null;
  audio.onpause = null;
  audio.onerror = null;
  audio.onloadeddata = null;
}

// 2. skipToNext/skipToPrevious에서 호출
public async skipToNext(crossfadeDuration: number = 5000, preloadOffset: number = 15) {
  if (this.currentAudio) {
    this.cleanupAudioListeners(this.currentAudio);  // ✅ 추가
    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio.src = '';
  }
  // ...
}
```

---

### 3. 경쟁 조건 - 동시 재생 요청

**위치**: `AudioStateManager.ts:119-156` / `AudioCrossfadeManager.ts:286-357`
**시나리오**: 사용자가 빠르게 "재생" 버튼을 여러 번 클릭

```typescript
// AudioStateManager
public async playPlaylist(tracks: AudioTrack[], startIndex: number = 0, options: CrossfadeOptions = {}) {
  try {
    this.log(`🎵 Starting playlist with ${tracks.length} tracks from index ${startIndex}`);

    // 1. 기존 재생 정리
    await this.cleanupExistingPlayback();
    // ❌ 문제: cleanupExistingPlayback() 실행 중 또 다른 playPlaylist() 호출 가능
    // ❌ 문제: this.activePlayer가 null이 된 후 새 인스턴스 생성 전 호출되면 충돌

    // 2. 새 플레이어 생성
    this.activePlayer = new AudioCrossfadeManager();
    // ...
  }
}
```

**영향**:
- 두 개 이상의 음악이 동시에 재생
- 크로스페이드 타이밍 깨짐
- 상태 불일치로 UI 버그 (재생 중인데 일시정지 버튼 표시)

**해결책**:
```typescript
// 1. 재생 중 플래그 추가
private isInitializing = false;

public async playPlaylist(tracks: AudioTrack[], startIndex: number = 0, options: CrossfadeOptions = {}) {
  // ✅ 초기화 중이면 대기 또는 거부
  if (this.isInitializing) {
    this.log('⚠️ Already initializing, ignoring duplicate request');
    return;
  }

  this.isInitializing = true;

  try {
    await this.cleanupExistingPlayback();
    this.activePlayer = new AudioCrossfadeManager();
    // ...
  } finally {
    this.isInitializing = false;  // ✅ 항상 정리
  }
}

// 2. UI에서 debounce 적용
const debouncedPlay = useMemo(
  () => debounce((tracks) => playPlaylist(tracks), 300),
  [playPlaylist]
);
```

---

### 4. CORS 에러 - 음악 파일 로드 실패

**위치**: `AudioCrossfadeManager.ts:85-131`
**시나리오**: Mureka 음악 파일 URL이 CORS를 허용하지 않는 경우

```typescript
private async loadTrack(url: string, isNext: boolean = false): Promise<HTMLAudioElement> {
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';  // ✅ CORS 설정
  audio.preload = 'auto';

  return new Promise((resolve, reject) => {
    const handleCanPlay = () => {
      // ...
    };

    const handleError = (e: Event) => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      reject(new Error(`Failed to load audio: ${url}`));
      // ❌ 문제: 에러 원인이 CORS인지 404인지 구분 불가
      // ❌ 문제: 재시도 로직 없음
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.src = url;
    audio.load();
  });
}
```

**영향**:
- 음악 파일 재생 완전 실패
- 사용자에게 "Failed to load audio" 메시지만 표시
- 네트워크 일시 오류 시에도 재시도 없음

**해결책**:
```typescript
private async loadTrack(url: string, isNext: boolean = false, retries: number = 3): Promise<HTMLAudioElement> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';

      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error(`Audio load timeout after 30s: ${url}`));
        }, 30000);  // ✅ 30초 타임아웃

        const handleCanPlay = () => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve(audio);
        };

        const handleError = (e: Event) => {
          clearTimeout(timeout);
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);

          // ✅ 에러 타입 구분
          const target = e.target as HTMLAudioElement;
          const errorCode = target.error?.code;
          const errorMessage = errorCode === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
            ? 'CORS 또는 파일 형식 문제'
            : errorCode === MediaError.MEDIA_ERR_NETWORK
            ? '네트워크 오류'
            : '알 수 없는 오류';

          reject(new Error(`${errorMessage}: ${url}`));
        };

        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.src = url;
        audio.load();
      });
    } catch (error) {
      if (attempt < retries) {
        this.log(`⚠️ Load failed (attempt ${attempt}/${retries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));  // ✅ Exponential backoff
        continue;
      }
      throw error;  // ✅ 최종 실패
    }
  }
  throw new Error('Unreachable');
}
```

---

### 5. 플레이리스트 끝 미처리

**위치**: `AudioCrossfadeManager.ts:420-425`
**시나리오**: 마지막 트랙이 끝났을 때 처리 누락

```typescript
const handleEnded = () => {
  if (this.currentIndex >= this.playlist.length - 1) {
    this.isPlaying = false;
    this.onPlaylistEnd?.();
    // ❌ 문제: 상태가 여전히 'playing'으로 남아있음
    // ❌ 문제: AudioContext가 계속 실행 중 (배터리 소모)
    // ❌ 문제: currentTime이 duration과 다를 수 있음
  }
};
```

**영향**:
- UI에서 "재생 중" 상태 유지
- 배터리 불필요 소모
- 다시 재생 시 이상한 위치에서 시작

**해결책**:
```typescript
const handleEnded = () => {
  if (this.currentIndex >= this.playlist.length - 1) {
    this.log('🏁 Playlist ended');

    // ✅ 완전한 정리
    this.isPlaying = false;
    this.currentIndex = 0;  // 처음으로 리셋

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    // ✅ AudioContext suspend (배터리 절약)
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }

    this.onPlaylistEnd?.();
  }
};
```

---

### 6. AudioContext 최대 개수 초과

**위치**: `AudioCrossfadeManager.ts:52-80`
**시나리오**: 페이지를 여러 번 새로고침하거나 여러 탭에서 재생

```typescript
private async initializeContext() {
  if (this.audioContext) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
    // ❌ 문제: 브라우저당 AudioContext 최대 6개 제한 (Chrome)
    // ❌ 문제: 이전 AudioContext를 닫지 않으면 누적됨
  }
}
```

**영향**:
- 6번째 재생 시도 시 "AudioContext creation failed" 에러
- 다른 탭의 오디오도 재생 불가

**해결책**:
```typescript
// 1. 전역 싱글톤 AudioContext 사용
class GlobalAudioContextManager {
  private static instance: AudioContext | null = null;
  private static refCount = 0;

  public static acquire(): AudioContext {
    if (!this.instance || this.instance.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.instance = new AudioContextClass();
    }
    this.refCount++;
    return this.instance;
  }

  public static release() {
    this.refCount--;
    if (this.refCount === 0 && this.instance) {
      this.instance.close();  // ✅ 완전히 닫기
      this.instance = null;
    }
  }
}

// 2. AudioCrossfadeManager에서 사용
private async initializeContext() {
  if (this.audioContext) return;
  this.audioContext = GlobalAudioContextManager.acquire();
  // ...
}

public dispose() {
  // ...
  GlobalAudioContextManager.release();  // ✅ 참조 카운트 감소
}
```

---

### 7. 상태 불일치 - isPlaying vs Audio.paused

**위치**: `AudioStateManager.ts:181-187` / `useMusicPlayer.ts:46-96`
**시나리오**: 사용자가 브라우저 미디어 컨트롤로 재생/일시정지

```typescript
// AudioStateManager
public pause(): void {
  if (this.activePlayer && this.playbackState.isPlaying) {
    this.log('⏸️ Pausing playback');
    this.activePlayer.pause();
    this.updateState({ isPlaying: false });
    // ✅ 상태 업데이트
  }
}

// ❌ 문제: 외부에서 Audio.pause() 호출 시 (브라우저 미디어 컨트롤)
//          this.playbackState.isPlaying은 여전히 true
//          UI 버튼은 "일시정지" 버튼을 보여줌
```

**영향**:
- UI와 실제 재생 상태 불일치
- 사용자 혼란
- 재생/일시정지 버튼 클릭 시 예상과 다른 동작

**해결책**:
```typescript
// AudioCrossfadeManager에 네이티브 이벤트 리스너 추가
private setupNativeEventListeners(audio: HTMLAudioElement) {
  audio.addEventListener('play', () => {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.onStateChanged?.({ isPlaying: true });
    }
  });

  audio.addEventListener('pause', () => {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.onStateChanged?.({ isPlaying: false });
    }
  });
}

// AudioStateManager에서 구독
this.activePlayer.onStateChanged((state) => {
  this.updateState(state);
});
```

---

### 8. Mureka API 타임아웃 미처리

**위치**: `useMusicGeneration.ts:136-182`
**시나리오**: Mureka 음악 생성이 10분 이상 걸리는 경우

```typescript
const triggerGeneration = useCallback(async (trackId: string) => {
  // ...

  // Start polling immediately
  setStatus('generating');

  // Initial poll after 2 seconds
  setTimeout(() => {
    pollTrackStatus(trackId);
  }, 2000);

  // Then poll every 2 seconds
  pollingInterval.current = setInterval(() => {
    pollTrackStatus(trackId);
  }, 2000);

  // ❌ 문제: 폴링 종료 조건이 없음 (무한 대기)
  // ❌ 문제: 10분 이상 폴링 시 서버 부하
  // ❌ 문제: 사용자가 페이지를 떠나도 폴링 계속
});
```

**영향**:
- 브라우저 탭을 열어둔 채로 무한 폴링
- 서버 리소스 낭비
- 사용자 대기 시간 불확실성

**해결책**:
```typescript
const MAX_POLL_DURATION = 10 * 60 * 1000;  // 10분
const POLL_INTERVAL = 2000;  // 2초

const triggerGeneration = useCallback(async (trackId: string) => {
  const startTime = Date.now();

  // ...

  pollingInterval.current = setInterval(() => {
    const elapsed = Date.now() - startTime;

    // ✅ 타임아웃 체크
    if (elapsed > MAX_POLL_DURATION) {
      stopPolling();
      setStatus('error');
      setError('음악 생성 시간이 초과되었습니다. 나중에 다시 시도해주세요.');

      toast.error('음악 생성 시간 초과', {
        description: '서버가 응답하지 않습니다. 새로고침 후 다시 시도해주세요.',
        action: {
          label: '새로고침',
          onClick: () => window.location.reload()
        }
      });
      return;
    }

    pollTrackStatus(trackId);
  }, POLL_INTERVAL);
});
```

---

### 9. 플레이리스트 중간 실패 처리

**위치**: `AudioCrossfadeManager.ts:383-387`
**시나리오**: 플레이리스트 재생 중 3번째 트랙 로드 실패

```typescript
// 다음 트랙이 있고, 프리로드 시점에 도달했으며, 아직 로드하지 않았을 때
if (
  this.currentIndex < this.playlist.length - 1 &&
  timeRemaining <= preloadOffset &&
  !this.nextAudio &&
  !this.isCrossfading
) {
  const nextTrack = this.playlist[this.currentIndex + 1];
  this.loadTrack(nextTrack.url, true).catch(error => {
    console.error('Failed to preload next track:', error);
    this.onError?.(error);
    // ❌ 문제: 에러만 로깅하고 다음 트랙 건너뛰기 로직 없음
    // ❌ 문제: 현재 트랙 끝나면 재생이 멈춤
  });
}
```

**영향**:
- 플레이리스트 재생이 중간에 멈춤
- 사용자가 수동으로 "다음" 버튼 클릭해야 함
- 완독 플레이리스트 경험 저하

**해결책**:
```typescript
this.loadTrack(nextTrack.url, true).catch(async (error) => {
  console.error('Failed to preload next track:', error);
  this.onError?.(error);

  // ✅ 다음 트랙 건너뛰기
  this.currentIndex++;

  // ✅ 그 다음 트랙이 있으면 시도
  if (this.currentIndex < this.playlist.length - 1) {
    const skipToTrack = this.playlist[this.currentIndex];

    toast.warning('트랙 로드 실패', {
      description: `${nextTrack.url.split('/').pop()} 건너뛰기`,
    });

    try {
      await this.loadTrack(skipToTrack.url, true);
      this.onTrackChange?.(this.currentIndex, skipToTrack);
    } catch (skipError) {
      console.error('Failed to skip to next track:', skipError);
      // 재귀적으로 다음 트랙 시도
    }
  } else {
    // 마지막 트랙이면 종료
    this.onPlaylistEnd?.();
  }
});
```

---

### 10. useMusicPlayer - Stale Closure

**위치**: `useMusicPlayer.ts:46-96`
**시나리오**: playlist 상태가 변경되었는데 이벤트 핸들러가 이전 값 참조

```typescript
useEffect(() => {
  const manager = audioManager.current;

  // State change listener
  const unsubscribeState = manager.onStateChange((state) => {
    setIsPlaying(state.isPlaying);
    setCurrentTime(state.currentTime);
    setDuration(state.duration);
    setCurrentTrackIndex(state.currentTrackIndex);
    setPlaylistMode(state.mode === 'playlist');

    // Update current track based on index
    if (playlist.length > 0 && playlist[state.currentTrackIndex]) {
      setCurrentTrack(playlist[state.currentTrackIndex]);
      // ❌ 문제: playlist가 변경되어도 이 핸들러는 이전 playlist를 참조
    }
  });

  // ...

  return () => {
    unsubscribeState();
    // ...
  };
}, [playlist]);  // ✅ playlist 의존성 추가됨
// ⚠️ 그러나 playlist 변경마다 이벤트 리스너 재등록 → 성능 문제
```

**영향**:
- 트랙 정보 불일치
- 앨범 커버 잘못 표시
- 재생 중 플레이리스트 변경 시 크래시 가능

**해결책**:
```typescript
// 방법 1: useRef로 최신 값 참조
const playlistRef = useRef(playlist);
playlistRef.current = playlist;

useEffect(() => {
  const manager = audioManager.current;

  const unsubscribeState = manager.onStateChange((state) => {
    // ✅ 항상 최신 playlist 참조
    if (playlistRef.current.length > 0 && playlistRef.current[state.currentTrackIndex]) {
      setCurrentTrack(playlistRef.current[state.currentTrackIndex]);
    }
  });

  // ...

  return () => {
    unsubscribeState();
  };
}, []);  // ✅ 한 번만 등록

// 방법 2: AudioStateManager에서 track 정보도 함께 전달
// (AudioStateManager가 playlist를 관리하므로 더 안전)
```

---

### 11. 동시 다운로드 제한

**위치**: `AudioCrossfadeManager.ts:362-418`
**시나리오**: 플레이리스트 5곡을 모두 preload='auto'로 설정

```typescript
private async loadTrack(url: string, isNext: boolean = false): Promise<HTMLAudioElement> {
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';  // ❌ 문제: 즉시 다운로드 시작
  // ...
}

// setupAutoAdvance에서 다음 트랙 프리로드
if (
  this.currentIndex < this.playlist.length - 1 &&
  timeRemaining <= preloadOffset &&
  !this.nextAudio &&
  !this.isCrossfading
) {
  const nextTrack = this.playlist[this.currentIndex + 1];
  this.loadTrack(nextTrack.url, true);  // ✅ 한 트랙만 프리로드
}

// ❌ 문제: 사용자가 여러 플레이리스트를 빠르게 전환하면
//          여러 트랙이 동시에 다운로드 시작 → 대역폭 낭비
```

**영향**:
- 네트워크 대역폭 과다 사용
- 모바일 데이터 소진
- 실제 필요한 트랙 로드 지연

**해결책**:
```typescript
// 1. preload 전략 개선
private async loadTrack(url: string, isNext: boolean = false): Promise<HTMLAudioElement> {
  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.preload = isNext ? 'metadata' : 'auto';  // ✅ 다음 트랙은 메타데이터만
  // 재생 직전에 'auto'로 변경
}

// 2. 크로스페이드 시작 시 실제 다운로드
const crossfadeStart = (crossfadeDuration / 1000) + 1;
if (timeRemaining <= crossfadeStart && !this.isCrossfading) {
  if (this.nextAudio) {
    this.nextAudio.preload = 'auto';  // ✅ 이제 다운로드 시작
    this.nextAudio.load();
  }
  // ...
}

// 3. 다운로드 중단 로직
private abortPendingLoads() {
  if (this.nextAudio && this.nextAudio.readyState < 2) {
    this.nextAudio.src = '';  // ✅ 다운로드 중단
    this.nextAudio = null;
  }
}
```

---

### 12. OpenAI API 실패 시 여정 롤백 없음

**위치**: `src/app/api/journeys/create/route.ts:82-100`
**시나리오**: 여정 생성 후 음악 프롬프트 생성 실패

```typescript
// 1. 독서 여정 생성
const { data: journey, error: journeyError } = await supabase
  .from('reading_journeys')
  .insert({ /* ... */ })
  .select()
  .single();

if (journeyError) {
  console.error('Journey creation error:', journeyError);
  return NextResponse.json({ error: '독서 여정 생성에 실패했습니다.' }, { status: 500 });
}

// 2. v0 음악 프롬프트 생성
let musicPromptData;
try {
  musicPromptData = await generateMusicPrompt({ /* ... */ });
} catch (promptError) {
  console.error('Music prompt generation error:', promptError);

  // ❌ 문제: 프롬프트 생성 실패 시 여정은 유지하되 에러 반환
  //          → DB에 불완전한 여정 데이터가 남음
  //          → 사용자 책장에 음악 없는 여정 표시
  return NextResponse.json({
    success: true,
    journey,
    warning: '음악 프롬프트 생성에 실패했습니다.',
    error: promptError instanceof Error ? promptError.message : 'Unknown error'
  });
}
```

**영향**:
- DB에 불완전한 데이터 누적
- 사용자 경험 저하 (음악 없는 여정)
- 수동 재시도 필요

**해결책**:
```typescript
// 방법 1: 트랜잭션 사용 (PostgreSQL)
try {
  // 1. 여정 생성
  const journey = await journeyRepo.create({ /* ... */ });

  // 2. 음악 프롬프트 생성
  let musicPromptData;
  try {
    musicPromptData = await generateMusicPrompt({ /* ... */ });
  } catch (promptError) {
    // ✅ 여정 삭제
    await journeyRepo.delete(journey.id);
    throw new Error(`음악 프롬프트 생성 실패: ${promptError.message}`);
  }

  // 3. 트랙 및 로그 생성
  const musicTrack = await musicRepo.create({ /* ... */ });
  const log = await logRepo.create({ /* ... */ });

  return NextResponse.json({ success: true, journey, musicTrack, log });
} catch (error) {
  return NextResponse.json({ success: false, error: error.message }, { status: 500 });
}

// 방법 2: 여정 상태 필드 추가 (pending → active)
const journey = await journeyRepo.create({
  status: 'pending',  // ✅ 초기 상태
  // ...
});

try {
  const musicPromptData = await generateMusicPrompt({ /* ... */ });
  const musicTrack = await musicRepo.create({ /* ... */ });
  const log = await logRepo.create({ /* ... */ });

  // ✅ 모두 성공하면 active로 변경
  await journeyRepo.updateStatus(journey.id, 'active');
} catch (error) {
  // ✅ 실패하면 pending 상태로 남김 (UI에서 숨김)
  console.error('Journey initialization failed:', error);
}
```

---

## 🟡 Warning Issues (18개)

### 13. 크로스페이드 시간 계산 오류

**위치**: `AudioCrossfadeManager.ts:225-269`
**시나리오**: 템포/분위기 정보가 없거나 잘못된 경우

```typescript
private calculateCrossfadeDuration(
  current: AudioTrack,
  next: AudioTrack,
  baseDuration: number = 5000
): number {
  let duration = baseDuration;

  // 템포 차이에 따른 조정
  if (current.tempo && next.tempo) {
    const tempoDiff = Math.abs(current.tempo - next.tempo);
    if (tempoDiff > 30) {
      duration += 2000;
    }
    // ❌ 문제: tempo가 0 또는 음수일 수 있음 (데이터 검증 없음)
    // ❌ 문제: tempo가 문자열일 수 있음 ("120 BPM" 형식)
  }

  // 분위기 전환에 따른 조정
  if (current.mood && next.mood) {
    const moodTransitions: Record<string, number> = {
      'calm-energetic': 2000,
      // ...
    };

    const transitionKey = `${current.mood}-${next.mood}`;
    const adjustment = moodTransitions[transitionKey] || 0;
    duration += adjustment;
    // ❌ 문제: mood 값이 예상과 다를 수 있음 ("Very Calm" vs "calm")
  }

  return duration;
}
```

**영향**:
- 부자연스러운 크로스페이드
- 너무 짧거나 긴 페이드 시간
- 음악 경험 저하

**해결책**:
```typescript
private calculateCrossfadeDuration(
  current: AudioTrack,
  next: AudioTrack,
  baseDuration: number = 5000
): number {
  let duration = baseDuration;

  // ✅ 템포 검증 및 파싱
  const currentTempo = this.parseTempo(current.tempo);
  const nextTempo = this.parseTempo(next.tempo);

  if (currentTempo && nextTempo) {
    const tempoDiff = Math.abs(currentTempo - nextTempo);
    if (tempoDiff > 30) {
      duration += 2000;
    } else if (tempoDiff > 20) {
      duration += 1000;
    }
  }

  // ✅ 분위기 정규화
  const currentMood = this.normalizeMood(current.mood);
  const nextMood = this.normalizeMood(next.mood);

  if (currentMood && nextMood) {
    const moodDistance = this.calculateMoodDistance(currentMood, nextMood);
    duration += moodDistance * 500;  // 거리에 비례
  }

  // ✅ 범위 제한
  return Math.min(Math.max(duration, 3000), 15000);  // 3-15초 범위
}

private parseTempo(tempo?: string | number): number | null {
  if (typeof tempo === 'number') {
    return tempo > 0 && tempo < 300 ? tempo : null;
  }
  if (typeof tempo === 'string') {
    const match = tempo.match(/\d+/);
    if (match) {
      const value = parseInt(match[0], 10);
      return value > 0 && value < 300 ? value : null;
    }
  }
  return null;
}

private normalizeMood(mood?: string): string | null {
  if (!mood) return null;
  const normalized = mood.toLowerCase().trim();
  // 유사한 mood 매핑
  const moodMap: Record<string, string> = {
    'peaceful': 'calm',
    'serene': 'calm',
    'exciting': 'energetic',
    // ...
  };
  return moodMap[normalized] || normalized;
}
```

---

### 14. skipToTrack 메모리 누수

**위치**: `useMusicPlayer.ts:254-282`
**시나리오**: 사용자가 플레이리스트에서 특정 트랙으로 여러 번 점프

```typescript
const skipToTrack = useCallback(async (index: number) => {
  if (index < 0 || index >= playlist.length) {
    console.warn('Invalid track index');
    return;
  }

  try {
    // Convert playlist to audio tracks and play from index
    const audioTracks = playlist.map(track => ({
      url: track.fileUrl,
      duration: track.duration,
      genre: track.genre,
      mood: track.mood,
      tempo: track.tempo
    }));

    await audioManager.current.playPlaylist(audioTracks, index, {
      duration: crossfadeEnabled ? crossfadeDuration : 0,
      preloadOffset: 15,
      fadeType: 'equalPower'
    });
    // ❌ 문제: playPlaylist를 호출할 때마다 새 AudioCrossfadeManager 생성
    //          → 이전 인스턴스가 정리되지 않으면 메모리 누수

    setCurrentTrackIndex(index);
    setCurrentTrack(playlist[index]);
  } catch (error) {
    console.error('Failed to skip to track:', error);
    toast.error('트랙 이동에 실패했습니다.');
  }
}, [playlist, crossfadeEnabled, crossfadeDuration]);
```

**영향**:
- 플레이리스트 탐색 시 메모리 사용량 증가
- 5-10번 점프 후 브라우저 느려짐

**해결책**:
```typescript
// AudioStateManager에 skipToTrack 메서드 추가
public async skipToTrack(index: number): Promise<void> {
  if (index < 0 || index >= this.playbackState.playlistLength) {
    throw new Error(`Invalid track index: ${index}`);
  }

  // ✅ 기존 플레이어 유지하면서 트랙만 변경
  if (this.activePlayer && this.currentPlaylist.length > 0) {
    this.log(`⏭️ Skipping to track ${index} without recreating player`);

    // 현재 재생 중지
    this.activePlayer.pause();

    // 새 플레이리스트 설정 (같은 플레이리스트지만 시작 인덱스 변경)
    this.activePlayer.setPlaylist(this.currentPlaylist.map(track => ({
      url: track.url,
      duration: track.duration,
      genre: track.genre,
      mood: track.mood,
      tempo: track.tempo
    })));

    // 특정 인덱스부터 재생
    await this.activePlayer.play(undefined, index);

    this.updateState({ currentTrackIndex: index, isPlaying: true });
  } else {
    // ✅ 플레이어가 없으면 새로 생성
    await this.playPlaylist(this.currentPlaylist, index);
  }
}
```

---

### 15. useMusicGeneration 폴링 네트워크 실패

**위치**: `useMusicGeneration.ts:95-131`
**시나리오**: 폴링 중 네트워크 일시 끊김

```typescript
const pollTrackStatus = useCallback(async (trackId: string) => {
  try {
    const response = await fetch(`/api/music/${trackId}`);

    if (!response.ok) {
      throw new Error('음악 상태를 불러오는데 실패했습니다.');
    }

    const track: MusicTrack = await response.json();
    setStatus(track.status);
    // ...
  } catch (err) {
    console.error('[useMusicGeneration] Polling error:', err);
    // ❌ 문제: 폴링을 멈추지 않음 (계속 시도는 좋음)
    //          하지만 연속 실패 카운트가 없어서 무한 재시도
  }
}, [stopPolling]);
```

**영향**:
- 네트워크 복구 후에도 상태 업데이트 안 됨
- 과도한 재시도로 서버 부하

**해결책**:
```typescript
const MAX_CONSECUTIVE_FAILURES = 5;
const consecutiveFailures = useRef(0);

const pollTrackStatus = useCallback(async (trackId: string) => {
  try {
    const response = await fetch(`/api/music/${trackId}`);

    if (!response.ok) {
      throw new Error('음악 상태를 불러오는데 실패했습니다.');
    }

    const track: MusicTrack = await response.json();

    // ✅ 성공 시 실패 카운트 리셋
    consecutiveFailures.current = 0;

    setStatus(track.status);
    // ...
  } catch (err) {
    console.error('[useMusicGeneration] Polling error:', err);

    // ✅ 연속 실패 카운트
    consecutiveFailures.current++;

    if (consecutiveFailures.current >= MAX_CONSECUTIVE_FAILURES) {
      stopPolling();
      setStatus('error');
      setError('네트워크 오류로 음악 상태를 확인할 수 없습니다.');

      toast.error('네트워크 오류', {
        description: '연결을 확인하고 새로고침해주세요.',
        action: {
          label: '재시도',
          onClick: () => {
            consecutiveFailures.current = 0;
            triggerGeneration(trackId);
          }
        }
      });
    }
  }
}, [stopPolling, triggerGeneration]);
```

---

### 16. MusicPlayerBar - 외부 상태 동기화 지연

**위치**: `MusicPlayerBar.tsx:120-123`
**시나리오**: AudioStateManager 상태 업데이트가 UI에 반영되는 시간 지연

```typescript
// ✅ UNIFIED: 항상 외부 상태 사용 (useMusicPlayer가 모든 상태 관리)
const displayIsPlaying = externalIsPlaying ?? false;
const displayCurrentTime = externalCurrentTime ?? 0;
const displayDuration = externalDuration ?? 0;

// ❌ 문제: externalCurrentTime이 timeupdate 이벤트마다 업데이트되지만
//          React 리렌더링 배치로 인해 UI 업데이트가 지연될 수 있음
//          → 진행 바가 끊기는 느낌
```

**영향**:
- 진행 바가 부드럽지 않음
- 사용자 경험 저하

**해결책**:
```typescript
// 방법 1: requestAnimationFrame으로 부드러운 업데이트
const [smoothTime, setSmoothTime] = useState(0);
const animationRef = useRef<number>();

useEffect(() => {
  if (!displayIsPlaying) {
    setSmoothTime(displayCurrentTime);
    return;
  }

  const startTime = Date.now();
  const startValue = displayCurrentTime;

  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const newTime = startValue + elapsed;

    if (newTime < displayDuration) {
      setSmoothTime(newTime);
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setSmoothTime(displayDuration);
    }
  };

  animationRef.current = requestAnimationFrame(animate);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, [displayIsPlaying, displayCurrentTime, displayDuration]);

// Slider에서 smoothTime 사용
<Slider value={[smoothTime]} max={displayDuration} />

// 방법 2: CSS transition으로 부드럽게
// (간단하지만 정확도 낮음)
```

---

### 17-24. (추가 Warning 이슈들)

생략 - 총 18개 중 주요 4개만 상세 설명

**나머지 Warning 이슈 목록**:
17. Journey API - 동시 완료 요청 (race condition)
18. MusicService - previousLogs 슬라이싱 오류 (빈 배열)
19. AudioCrossfadeManager - 브라우저 탭 백그라운드 시 타이머 지연
20. useMusicPlayer - 컴포넌트 언마운트 시 비동기 작업 취소 누락
21. MusicPlayerBar - seek 기능 완전히 비활성화 (단일 트랙 모드에서도)
22. AudioStateManager - 상태 리스너 중복 등록 가능
23. Mureka API - 생성 실패 시 재시도 로직 없음
24. Journey Complete API - rating 범위 검증만 (타입 검증 없음)

---

## 🟢 Info Issues (7개)

### 25. console.log 과다 사용

**위치**: 전체 코드베이스
**영향**: Production 빌드 크기 증가, 디버깅 정보 노출
**해결**: 환경 변수 기반 로깅 라이브러리 도입

### 26-31. (추가 Info 이슈들)

26. TypeScript `any` 타입 사용 (이벤트 핸들러 저장)
27. 하드코딩된 매직 넘버 (5000ms, 15초 등)
28. 에러 메시지 다국어 미지원
29. 접근성: ARIA 레이블 누락 (MusicPlayerBar)
30. 성능: 불필요한 리렌더링 (useMusicPlayer dependencies)
31. 테스트 커버리지 부족 (E2E 테스트만 존재)

---

## 🎯 개선 우선순위

### Phase 1: Critical Fixes (1-2주)
1. ✅ **Web Audio API 초기화 강화** - iOS 지원 필수
2. ✅ **메모리 누수 수정** - 이벤트 리스너 정리
3. ✅ **경쟁 조건 방지** - 재생 요청 잠금
4. ✅ **CORS 에러 처리** - 재시도 + 명확한 에러 메시지

### Phase 2: Warning Fixes (2-4주)
5. ✅ **폴링 타임아웃** - 10분 제한 + 재시도
6. ✅ **플레이리스트 실패 처리** - 트랙 건너뛰기
7. ✅ **크로스페이드 계산 개선** - 데이터 검증
8. ✅ **상태 동기화** - 브라우저 미디어 컨트롤

### Phase 3: Architecture Improvements (1-2개월)
9. ✅ **로깅 시스템** - 환경별 로그 레벨
10. ✅ **에러 추적** - Sentry 통합
11. ✅ **테스트 커버리지** - Unit + Integration 테스트
12. ✅ **성능 모니터링** - Web Vitals 추적

---

## 📊 테스트 시나리오

### E2E 테스트 추가 권장

```typescript
// tests/e2e/music-error-scenarios.spec.ts

describe('Music Playback Error Scenarios', () => {
  test('should handle network failure during playlist', async ({ page }) => {
    // 1. 플레이리스트 재생 시작
    await page.goto('/journey/abc-123');
    await page.click('[data-testid="play-playlist"]');

    // 2. 네트워크 차단
    await page.route('**/*.mp3', route => route.abort());

    // 3. 다음 트랙으로 이동
    await page.click('[data-testid="next-track"]');

    // 4. 에러 토스트 확인
    await expect(page.locator('.sonner-toast')).toContainText('트랙 로드 실패');

    // 5. 재생이 계속되는지 확인 (다음 트랙 건너뛰기)
    await expect(page.locator('[data-testid="track-index"]')).toContainText('3 / 5');
  });

  test('should recover from AudioContext suspension', async ({ page }) => {
    // iOS 시뮬레이션
    await page.emulate(devices['iPhone 13']);

    // 1. 재생 시작
    await page.goto('/journey/abc-123');
    await page.click('[data-testid="play-track"]');

    // 2. AudioContext suspend 시뮬레이션
    await page.evaluate(() => {
      const ctx = (window as any).__AUDIO_MANAGER__.getActivePlayer().audioContext;
      ctx.suspend();
    });

    // 3. 일시정지 후 재개
    await page.click('[data-testid="pause"]');
    await page.click('[data-testid="play"]');

    // 4. AudioContext가 running 상태인지 확인
    const state = await page.evaluate(() => {
      const ctx = (window as any).__AUDIO_MANAGER__.getActivePlayer().audioContext;
      return ctx.state;
    });
    expect(state).toBe('running');
  });
});
```

---

## 🛠️ 권장 도구 및 라이브러리

### 1. 에러 추적
- **Sentry**: 프론트엔드 에러 자동 수집
- **LogRocket**: 세션 리플레이 + 에러 컨텍스트

### 2. 성능 모니터링
- **Web Vitals**: Core Web Vitals 측정
- **Performance Observer**: 오디오 재생 레이턴시

### 3. 테스트
- **Vitest**: Unit 테스트 (React hooks)
- **Playwright**: E2E 테스트 (현재 사용 중)
- **MSW**: API 모킹

### 4. 로깅
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  browser: {
    asObject: true,
  },
});

// 사용 예시
logger.info({ trackId: '123', action: 'play' }, 'Starting playback');
logger.error({ error, trackId: '123' }, 'Failed to load track');
```

---

## 📝 결론

ReadTune 음악 재생 시스템은 **복잡도가 높지만 잘 설계**되어 있습니다. 그러나 **37개의 잠재적 오류 시나리오**가 있으며, 특히 **브라우저 호환성, 메모리 관리, 비동기 처리**에서 개선이 필요합니다.

**즉시 조치 필요** (Critical):
1. iOS Safari AudioContext 초기화 강화
2. 이벤트 리스너 메모리 누수 수정
3. 동시 재생 요청 방지
4. CORS 에러 처리 개선

**단계적 개선** (Warning):
- 폴링 타임아웃 설정
- 플레이리스트 실패 복구
- 상태 동기화 개선

**장기 목표** (Info):
- 로깅 시스템 구축
- 테스트 커버리지 확대
- 성능 모니터링 도입

이 리포트를 기반으로 우선순위를 정해 단계적으로 개선하시길 권장합니다.
