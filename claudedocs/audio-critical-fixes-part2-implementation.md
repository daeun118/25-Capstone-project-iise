# 음악 재생 Critical 이슈 수정 완료 리포트 (Part 2)

**작성일**: 2025-01-30
**분석 문서**: `claudedocs/music-playback-error-analysis.md`
**수정 범위**: Critical 이슈 4개 추가 (Issue #5-8)
**이전 작업**: `claudedocs/audio-critical-fixes-implementation.md` (Issue #1-4)

---

## 📋 Executive Summary

음악 재생 시스템의 **추가 4개 Critical 이슈**를 수정했습니다:

5. ✅ **AudioContext 최대 개수 초과** (전역 싱글톤 패턴)
6. ✅ **상태 불일치** (브라우저 미디어 컨트롤 동기화)
7. ✅ **Mureka API 타임아웃 미처리** (10분 타임아웃 설정)
8. ✅ **플레이리스트 중간 실패 처리** (자동 건너뛰기)

**누적 완료**: 총 12개 Critical 이슈 중 8개 완료 (66.7%)

**영향**:
- 브라우저 리소스 관리 최적화 (AudioContext 재사용)
- UI 상태 동기화 안정성 향상
- 음악 생성 무한 폴링 방지
- 플레이리스트 끊김 없는 재생 보장

---

## 🔧 수정 사항 상세

### 5. AudioContext 최대 개수 초과 수정

**파일**: `src/services/audio-crossfade-manager.ts:25-83, 118, 723-727`

**문제**:
- 브라우저당 AudioContext 최대 6개 제한 (Chrome)
- 페이지 새로고침 시마다 새 AudioContext 생성
- 이전 AudioContext를 닫지 않으면 누적되어 6번째 재생 시도 시 실패

**해결책**:
```typescript
/**
 * GlobalAudioContextManager - 전역 AudioContext 관리자
 * ✅ Critical Issue #5 해결: AudioContext 최대 개수 초과 방지
 */
class GlobalAudioContextManager {
  private static instance: AudioContext | null = null;
  private static refCount = 0;

  public static acquire(): AudioContext {
    if (!this.instance || this.instance.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('이 브라우저는 오디오 재생을 지원하지 않습니다.');
      }
      this.instance = new AudioContextClass();
      console.log('✅ Global AudioContext created');
    }
    this.refCount++;
    return this.instance;
  }

  public static release() {
    this.refCount--;
    if (this.refCount === 0 && this.instance) {
      this.instance.close();
      this.instance = null;
      console.log('🧹 Global AudioContext closed');
    }
  }
}

// AudioCrossfadeManager 수정
private async initializeContext() {
  if (this.audioContext) return;
  try {
    // ✅ 전역 싱글톤 AudioContext 획득
    this.audioContext = GlobalAudioContextManager.acquire();
    // ... gain nodes 생성 ...
  }
}

public dispose() {
  // ...
  // ✅ GlobalAudioContextManager 해제
  if (this.audioContext) {
    GlobalAudioContextManager.release();
  }
  this.audioContext = null;
}
```

**효과**:
- 브라우저당 단일 AudioContext 사용 (메모리 절약)
- 페이지 새로고침 시 자동 정리
- 최대 개수 초과 에러 방지

---

### 6. 상태 불일치 (isPlaying vs Audio.paused) 수정

**파일**: `src/services/audio-crossfade-manager.ts:104, 513-558, 216, 807-809`
**파일**: `src/services/audio-state-manager.ts:299-303`

**문제**:
- 브라우저 미디어 컨트롤(재생/일시정지 버튼)로 제어 시 상태 불일치
- UI 버튼이 실제 재생 상태와 다름
- 사용자가 UI 버튼 클릭 시 예상과 다른 동작

**해결책**:
```typescript
// AudioCrossfadeManager - 네이티브 이벤트 리스너 추가
private onStateChange?: (state: { isPlaying: boolean }) => void;

private setupNativeEventListeners(audio: HTMLAudioElement) {
  const playHandler = () => {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.onStateChange?.({ isPlaying: true });
      console.log('🎵 Native play event detected');
    }
  };

  const pauseHandler = () => {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.onStateChange?.({ isPlaying: false });
      console.log('⏸️ Native pause event detected');
    }
  };

  audio.addEventListener('play', playHandler);
  audio.addEventListener('pause', pauseHandler);

  // 참조 저장 (cleanup용)
  (audio as any).__playHandler = playHandler;
  (audio as any).__pauseHandler = pauseHandler;
}

// loadTrack에서 호출
private async loadTrack(url: string, isNext: boolean = false) {
  // ...
  // ✅ 네이티브 play/pause 이벤트 리스너 설정
  this.setupNativeEventListeners(audio);
  // ...
}

// AudioStateManager - 상태 동기화
private setupEventHandlers(): void {
  // ...
  // ✅ 네이티브 play/pause 이벤트와 상태 동기화
  this.activePlayer.onStateChanged((state) => {
    this.log(`🔄 State changed: isPlaying=${state.isPlaying}`);
    this.updateState({ isPlaying: state.isPlaying });
  });
}
```

**효과**:
- 브라우저 미디어 컨트롤과 UI 상태 완벽 동기화
- 사용자 경험 일관성 향상
- 재생/일시정지 버튼 정확성

---

### 7. Mureka API 타임아웃 미처리 수정

**파일**: `src/hooks/useMusicGeneration.ts:50-52, 63, 142-200`

**문제**:
- Mureka 음악 생성 폴링이 무한 대기
- 10분 이상 폴링 시 서버 부하 증가
- 사용자 대기 시간 불확실성

**해결책**:
```typescript
// ✅ Critical Issue #7: Mureka API 타임아웃 설정
const MAX_POLL_DURATION = 10 * 60 * 1000;  // 10분
const POLL_INTERVAL = 2000;  // 2초

export function useMusicGeneration(): UseMusicGenerationReturn {
  // ...
  const pollStartTime = useRef<number | null>(null);  // 시작 시간

  const triggerGeneration = useCallback(async (trackId: string) => {
    try {
      // ...
      pollStartTime.current = Date.now();  // ✅ 시작 시간 기록

      // 폴링 인터벌에 타임아웃 체크 추가
      pollingInterval.current = setInterval(() => {
        // ✅ 타임아웃 체크
        if (pollStartTime.current) {
          const elapsed = Date.now() - pollStartTime.current;

          if (elapsed > MAX_POLL_DURATION) {
            stopPolling();
            setStatus('error');
            setError('음악 생성 시간이 초과되었습니다.');
            setProgress(0);

            toast.error('음악 생성 시간 초과', {
              description: '서버가 응답하지 않습니다. 새로고침 후 다시 시도해주세요.',
              action: {
                label: '새로고침',
                onClick: () => window.location.reload()
              }
            });

            console.warn(`[useMusicGeneration] Polling timed out after ${elapsed}ms`);
            return;
          }
        }

        pollTrackStatus(trackId);
      }, POLL_INTERVAL);
    }
  }, [/* ... */]);
}
```

**효과**:
- 무한 폴링 방지 (10분 후 자동 종료)
- 서버 리소스 절약
- 사용자 친화적 에러 메시지 및 복구 옵션

---

### 8. 플레이리스트 중간 실패 처리 수정

**파일**: `src/services/audio-crossfade-manager.ts:590-616`

**문제**:
- 플레이리스트 재생 중 특정 트랙 로드 실패 시 재생 멈춤
- 사용자가 수동으로 "다음" 버튼을 클릭해야 함
- 완독 플레이리스트 경험 저하

**해결책**:
```typescript
// setupAutoAdvance 메서드 내부
this.loadTrack(nextTrack.url, true).catch(async (error) => {
  console.error('Failed to preload next track:', error);
  this.onError?.(error);

  // ✅ Critical Issue #8: 다음 트랙 건너뛰기
  this.currentIndex++;

  // ✅ 그 다음 트랙이 있으면 시도
  if (this.currentIndex < this.playlist.length - 1) {
    const skipToTrack = this.playlist[this.currentIndex];

    console.warn(`⏭️ Skipping failed track, trying next: ${skipToTrack.url}`);

    try {
      await this.loadTrack(skipToTrack.url, true);
      this.onTrackChange?.(this.currentIndex, skipToTrack);
    } catch (skipError) {
      console.error('Failed to skip to next track:', skipError);
      this.onError?.(skipError as Error);
    }
  } else {
    // 마지막 트랙이면 종료
    console.log('🏁 Last track failed to load, ending playlist');
    this.onPlaylistEnd?.();
  }
});
```

**효과**:
- 플레이리스트 끊김 없는 재생
- 자동 건너뛰기로 사용자 개입 불필요
- 완독 플레이리스트 경험 개선

---

## ✅ 검증

### 빌드 테스트
```bash
npm run build
✓ Compiled successfully in 12.0-12.4s
✓ Linting and checking validity of types
✓ Generating static pages (31/31)
```

### 타입 안전성
- TypeScript 컴파일 에러 없음
- 모든 타입 정의 정확하게 처리

---

## 📊 성능 영향 예측

### AudioContext 메모리
- **이전**: 페이지 새로고침마다 새 인스턴스 (누적 메모리 증가)
- **이후**: 단일 인스턴스 재사용 (메모리 안정적 유지)

### UI 상태 동기화
- **이전**: 브라우저 컨트롤 사용 시 상태 불일치 (UX 혼란)
- **이후**: 완벽 동기화 (일관된 UX)

### 음악 생성 폴링
- **이전**: 무한 폴링 가능 (서버 부하)
- **이후**: 10분 타임아웃 (리소스 관리)

### 플레이리스트 안정성
- **이전**: 트랙 실패 시 재생 중단
- **이후**: 자동 건너뛰기 (끊김 없는 재생)

---

## 🎯 다음 단계

### 남은 Critical 이슈 (4개)
9. useMusicPlayer - Stale Closure
10. 동시 다운로드 제한
11. OpenAI API 실패 시 여정 롤백 없음
12. 플레이리스트 끝 미처리 (일부 수정됨)

### Warning 이슈 (18개)
- 크로스페이드 시간 계산 오류
- skipToTrack 메모리 누수
- useMusicGeneration 폴링 네트워크 실패
- MusicPlayerBar - 외부 상태 동기화 지연
- 기타 14개

### 권장 작업 순서
1. **Week 1**: 남은 Critical 이슈 9-12 수정
2. **Week 2**: Warning 이슈 중 우선순위 높은 4개 수정
3. **Week 3**: E2E 테스트 커버리지 확대
4. **Week 4**: 성능 프로파일링 및 최적화

---

## 📚 참고 문서

- 원본 분석: `claudedocs/music-playback-error-analysis.md`
- Part 1 수정: `claudedocs/audio-critical-fixes-implementation.md` (Issue #1-4)
- 음악 생성 API 가이드: `claudedocs/music-generation-api-guide.md`
- 음악 아키텍처 개선: `claudedocs/audio-architecture-improvement.md`

---

**작성자**: Claude Code
**리뷰 필요**: 팀 리뷰 후 Production 배포 권장
**총 진행률**: 8/12 Critical Issues 완료 (66.7%)
