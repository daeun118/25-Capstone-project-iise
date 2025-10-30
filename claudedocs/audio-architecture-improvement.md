# 음악 재생 아키텍처 개선 - 중앙 집중식 오디오 상태 관리

**작성일**: 2025-01-30
**작성자**: Claude
**상태**: ✅ 구현 완료

## 문제 상황

사용자가 음악 재생 중 다른 노래를 재생하면 여러 노래가 겹쳐서 나오는 현상이 발생했습니다. 이는 다음과 같은 복잡한 UI 구조 때문이었습니다:

1. **독서 플레이리스트** - 개별 트랙 재생 버튼
2. **독서 여정 타임라인** - 각 로그의 음악 재생
3. **하단 재생바** - 이전/다음/재생 컨트롤

각 컴포넌트가 독립적으로 AudioCrossfadeManager를 제어하려 하면서 충돌이 발생했습니다.

## 근본 원인

1. **기존 재생 정리 누락**: `AudioCrossfadeManager.play()` 메서드가 새 재생 시작 전 기존 오디오를 정리하지 않음
2. **다중 인스턴스 가능성**: 여러 컴포넌트에서 독립적으로 재생 제어
3. **상태 동기화 부재**: 컴포넌트 간 재생 상태 공유 메커니즘 없음

## 해결 방안: 중앙 집중식 오디오 상태 관리

### 1. AudioStateManager (싱글톤 패턴)

```typescript
// src/services/audio-state-manager.ts
export class AudioStateManager {
  private static instance: AudioStateManager;
  private activePlayer: AudioCrossfadeManager | null = null;

  // 싱글톤으로 전체 앱에서 단일 인스턴스만 유지
  public static getInstance(): AudioStateManager {
    if (!AudioStateManager.instance) {
      AudioStateManager.instance = new AudioStateManager();
    }
    return AudioStateManager.instance;
  }

  // 새 재생 전 항상 기존 재생 정리
  private async cleanupExistingPlayback(): Promise<void> {
    if (this.activePlayer) {
      this.activePlayer.dispose();
      this.activePlayer = null;
    }
  }
}
```

### 2. AudioCrossfadeManager 개선

```typescript
// src/services/audio-crossfade-manager.ts
public async play(...) {
  // 🔥 중요: 새 재생 전 기존 오디오 정리
  if (this.currentAudio) {
    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio.src = '';
    this.currentAudio = null;
  }

  if (this.nextAudio) {
    this.nextAudio.pause();
    this.nextAudio.src = '';
    this.nextAudio = null;
  }

  // 이후 새 재생 시작...
}
```

### 3. useMusicPlayer Hook 리팩토링

```typescript
// src/hooks/useMusicPlayer.ts
export function useMusicPlayer() {
  // 싱글톤 AudioStateManager 사용
  const audioManager = useRef(AudioStateManager.getInstance());

  // 이벤트 구독으로 상태 동기화
  useEffect(() => {
    const unsubscribe = audioManager.current.onStateChange((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTrackIndex(state.currentTrackIndex);
      // ...
    });

    return () => unsubscribe();
  }, []);
}
```

## 구현 결과

### 장점

1. **완벽한 격리**: 단일 AudioStateManager가 모든 재생 제어
2. **자동 정리**: 새 재생 시작 시 기존 오디오 자동 정리
3. **상태 동기화**: 모든 UI 컴포넌트가 동일한 상태 구독
4. **메모리 안전**: 이벤트 리스너 및 오디오 인스턴스 정확한 정리
5. **디버깅 지원**: `window.__AUDIO_MANAGER__` 전역 디버그 인터페이스

### 디버깅 도구

브라우저 콘솔에서 사용 가능:

```javascript
// 현재 상태 확인
__AUDIO_MANAGER__.getState()

// 강제 정지
__AUDIO_MANAGER__.forceStop()

// 디버그 모드 활성화
__AUDIO_MANAGER__.enableDebug()
```

## 아키텍처 다이어그램

```
┌──────────────────────────────────────────┐
│             UI Components                 │
│  (Playlist, Timeline, Player Bar)         │
└─────────────────┬────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ useMusicPlayer │ (Hook)
         │    - State     │
         │    - Actions   │
         └────────┬───────┘
                  │
                  ▼
      ┌───────────────────────┐
      │  AudioStateManager    │ (Singleton)
      │  - Central Control    │
      │  - State Management   │
      │  - Event Distribution │
      └───────────┬───────────┘
                  │
                  ▼
     ┌────────────────────────┐
     │ AudioCrossfadeManager  │
     │  - Web Audio API       │
     │  - Crossfade Logic     │
     │  - Audio Playback      │
     └────────────────────────┘
```

## 마이그레이션 가이드

기존 코드에서 새 아키텍처로 전환:

### Before
```typescript
// 직접 AudioCrossfadeManager 사용
const audioManager = new AudioCrossfadeManager();
await audioManager.play(tracks);
```

### After
```typescript
// useMusicPlayer Hook 사용
const musicPlayer = useMusicPlayer();
await musicPlayer.playPlaylist(tracks);
```

## 테스트 시나리오

1. ✅ 플레이리스트에서 개별 트랙 재생 → 기존 재생 정지 후 새 트랙 재생
2. ✅ 재생 중 다른 트랙 클릭 → 겹침 없이 전환
3. ✅ 타임라인에서 음악 재생 → 플레이리스트 UI 동기화
4. ✅ 하단 재생바 이전/다음 → 모든 UI 업데이트
5. ✅ 전체 재생 → V0에서 V1로 자동 전환 (크로스페이드)

## 성능 최적화

- **메모리 관리**: 이벤트 리스너 자동 정리
- **오디오 버퍼 재사용**: 불필요한 재로딩 방지
- **상태 업데이트 최적화**: 실제 변경 시에만 리렌더링

## 향후 개선 사항

1. **오프라인 캐싱**: Service Worker로 음악 파일 캐싱
2. **백그라운드 재생**: Web Audio API Background Processing
3. **고급 이퀄라이저**: 사용자 정의 오디오 필터
4. **재생 히스토리**: 최근 재생 목록 저장

## 결론

중앙 집중식 오디오 상태 관리 시스템 도입으로 음악 재생 겹침 문제를 근본적으로 해결했습니다. 싱글톤 패턴과 이벤트 기반 아키텍처로 모든 UI 컴포넌트가 일관된 재생 상태를 유지할 수 있게 되었습니다.