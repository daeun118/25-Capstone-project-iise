/**
 * AudioCrossfadeManager - Web Audio API를 사용한 크로스페이드 관리
 *
 * Features:
 * - Equal Power Crossfade (코사인/사인 곡선)
 * - 독서 최적화 페이드 시간 (5-6초)
 * - 트랙 프리로드 및 자동 진행
 * - 템포/분위기 기반 적응형 페이드
 */

interface AudioTrack {
  url: string;
  duration: number;
  genre?: string;
  mood?: string;
  tempo?: number;
}

interface CrossfadeOptions {
  duration?: number;      // 크로스페이드 시간 (ms)
  preloadOffset?: number; // 다음 트랙 프리로드 시간 (초)
  fadeType?: 'linear' | 'exponential' | 'equalPower';
}

/**
 * GlobalAudioContextManager - 전역 AudioContext 관리자
 *
 * ✅ Critical Issue #5 해결: AudioContext 최대 개수 초과 방지
 * - 브라우저당 AudioContext 최대 6개 제한 (Chrome)
 * - 싱글톤 패턴으로 단일 AudioContext 재사용
 * - 참조 카운팅으로 안전한 리소스 해제
 */
class GlobalAudioContextManager {
  private static instance: AudioContext | null = null;
  private static refCount = 0;

  /**
   * AudioContext 획득 (없으면 생성, 있으면 재사용)
   */
  public static acquire(): AudioContext {
    if (!this.instance || this.instance.state === 'closed') {
      // @ts-ignore - WebKit prefix for Safari
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error('이 브라우저는 오디오 재생을 지원하지 않습니다. 최신 브라우저로 업데이트해주세요.');
      }

      this.instance = new AudioContextClass();
      console.log('✅ Global AudioContext created');
    }

    this.refCount++;
    console.log(`📊 AudioContext refCount: ${this.refCount}`);
    return this.instance;
  }

  /**
   * AudioContext 해제 (참조 카운트 감소, 0이면 닫기)
   */
  public static release() {
    this.refCount--;
    console.log(`📊 AudioContext refCount: ${this.refCount}`);

    if (this.refCount === 0 && this.instance) {
      // ✅ 모든 참조가 해제되면 AudioContext 닫기
      this.instance.close();
      this.instance = null;
      console.log('🧹 Global AudioContext closed');
    }
  }

  /**
   * 현재 AudioContext 상태 확인 (디버깅용)
   */
  public static getStatus() {
    return {
      hasInstance: !!this.instance,
      state: this.instance?.state || 'none',
      refCount: this.refCount
    };
  }
}

export class AudioCrossfadeManager {
  private audioContext: AudioContext | null = null;
  private currentSource: MediaElementAudioSourceNode | null = null;
  private nextSource: MediaElementAudioSourceNode | null = null;
  private currentGain: GainNode | null = null;
  private nextGain: GainNode | null = null;
  private masterGain: GainNode | null = null;  // ✅ 마스터 볼륨 제어용
  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;

  private playlist: AudioTrack[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private isCrossfading = false;
  private volume = 0.7;  // ✅ 기본 볼륨 70% (0.0 ~ 1.0)
  private isMuted = false;  // ✅ 음소거 상태
  
  // Callbacks
  private onTrackChange?: (index: number, track: AudioTrack) => void;
  private onPlaylistEnd?: () => void;
  private onError?: (error: Error) => void;
  private onTimeUpdate?: (currentTime: number, duration: number) => void;
  private onStateChange?: (state: { isPlaying: boolean }) => void;  // ✅ Critical Issue #6
  
  constructor() {
    // AudioContext는 사용자 인터랙션 후에 초기화
  }
  
  /**
   * AudioContext 초기화 (사용자 인터랙션 필요)
   * ✅ Critical Issue #5 해결: 전역 싱글톤 AudioContext 사용
   */
  private async initializeContext() {
    if (this.audioContext) return;

    try {
      // ✅ 전역 싱글톤 AudioContext 획득
      this.audioContext = GlobalAudioContextManager.acquire();

      // Create gain nodes for crossfade
      this.currentGain = this.audioContext.createGain();
      this.nextGain = this.audioContext.createGain();

      // ✅ Create master gain node for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : this.volume;

      // ✅ Connect: crossfade gains → master gain → destination
      this.masterGain.connect(this.audioContext.destination);
      this.currentGain.connect(this.masterGain);
      this.nextGain.connect(this.masterGain);

      // Initialize crossfade gain values
      this.currentGain.gain.value = 1;
      this.nextGain.gain.value = 0;

      // ✅ Resume context if suspended (iOS) - 재시도 로직 추가
      if (this.audioContext.state === 'suspended') {
        const resumeAttempts = 3;
        let resumed = false;

        for (let i = 0; i < resumeAttempts; i++) {
          try {
            await this.audioContext.resume();

            // Check if state changed after resume
            if (this.audioContext.state !== 'suspended') {
              console.log('✅ AudioContext resumed successfully');
              resumed = true;
              break;
            }
          } catch (err) {
            if (i === resumeAttempts - 1) {
              throw new Error('오디오 재생을 시작할 수 없습니다. 화면을 터치하거나 다시 시도해주세요.');
            }
            // ✅ Exponential backoff
            await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
          }
        }

        if (!resumed) {
          throw new Error('오디오 재생을 시작할 수 없습니다. 화면을 터치하거나 다시 시도해주세요.');
        }
      }

      console.log(`✅ AudioContext initialized (state: ${this.audioContext.state})`);
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      const errorMessage = error instanceof Error ? error.message : '오디오 시스템 초기화에 실패했습니다.';
      throw new Error(errorMessage);
    }
  }
  
  /**
   * 트랙 로드 (재시도 로직 포함)
   * ✅ Critical Issue #11: 동시 다운로드 제한
   */
  private async loadTrack(url: string, isNext: boolean = false, retries: number = 3): Promise<HTMLAudioElement> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        // ✅ 다음 트랙은 metadata만 로드 (대역폭 절약)
        audio.preload = isNext ? 'metadata' : 'auto';

        return await new Promise<HTMLAudioElement>((resolve, reject) => {
          // ✅ 30초 타임아웃 추가
          const timeout = setTimeout(() => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);
            reject(new Error(`오디오 로드 타임아웃 (30초 초과): ${url}`));
          }, 30000);

          const handleCanPlay = () => {
            clearTimeout(timeout);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);

            if (!this.audioContext) {
              reject(new Error('AudioContext not initialized'));
              return;
            }

            // Create source node
            const source = this.audioContext.createMediaElementSource(audio);

            if (isNext) {
              this.nextAudio = audio;
              this.nextSource = source;
              if (this.nextGain) {
                source.connect(this.nextGain);
              }
            } else {
              this.currentAudio = audio;
              this.currentSource = source;
              if (this.currentGain) {
                source.connect(this.currentGain);
              }
            }

            // ✅ Critical Issue #6: 네이티브 play/pause 이벤트 리스너 설정
            this.setupNativeEventListeners(audio);

            resolve(audio);
          };

          const handleError = (e: Event) => {
            clearTimeout(timeout);
            audio.removeEventListener('canplaythrough', handleCanPlay);
            audio.removeEventListener('error', handleError);

            // ✅ 에러 타입 구분
            const target = e.target as HTMLAudioElement;
            const errorCode = target.error?.code;

            let errorMessage = '알 수 없는 오류';
            if (errorCode === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
              errorMessage = 'CORS 또는 파일 형식 문제';
            } else if (errorCode === MediaError.MEDIA_ERR_NETWORK) {
              errorMessage = '네트워크 오류';
            } else if (errorCode === MediaError.MEDIA_ERR_DECODE) {
              errorMessage = '오디오 디코딩 오류';
            } else if (errorCode === MediaError.MEDIA_ERR_ABORTED) {
              errorMessage = '오디오 로드 중단';
            }

            reject(new Error(`${errorMessage}: ${url}`));
          };

          audio.addEventListener('canplaythrough', handleCanPlay);
          audio.addEventListener('error', handleError);
          audio.src = url;
          audio.load();
        });
      } catch (error) {
        if (attempt < retries) {
          console.log(`⚠️ 트랙 로드 실패 (시도 ${attempt}/${retries}), 재시도 중...`);
          // ✅ Exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        // ✅ 최종 실패
        throw error;
      }
    }
    throw new Error('Unreachable');
  }
  
  /**
   * Equal Power Crossfade (프로페셔널 품질)
   */
  private async crossfade(duration: number = 5000): Promise<void> {
    if (!this.audioContext || !this.currentGain || !this.nextGain) {
      throw new Error('Audio system not initialized');
    }
    
    if (!this.nextAudio || !this.currentAudio) {
      return;
    }
    
    if (this.isCrossfading) {
      console.log('Already crossfading, skipping...');
      return;
    }
    
    this.isCrossfading = true;
    const startTime = this.audioContext.currentTime;
    const endTime = startTime + (duration / 1000);
    
    // Clear any existing automation
    this.currentGain.gain.cancelScheduledValues(startTime);
    this.nextGain.gain.cancelScheduledValues(startTime);
    
    // Set initial values
    this.currentGain.gain.setValueAtTime(1, startTime);
    this.nextGain.gain.setValueAtTime(0, startTime);
    
    // Equal Power Crossfade using cosine/sine curves
    // More complex but provides constant perceived loudness
    const steps = 100; // More steps = smoother fade
    const stepDuration = duration / steps / 1000;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const time = startTime + (i * stepDuration);
      
      // Cosine fade out (current track)
      const fadeOutValue = Math.cos(progress * Math.PI / 2);
      
      // Sine fade in (next track)
      const fadeInValue = Math.sin(progress * Math.PI / 2);
      
      this.currentGain.gain.setValueAtTime(fadeOutValue, time);
      this.nextGain.gain.setValueAtTime(fadeInValue, time);
    }
    
    // Start playing next track
    try {
      await this.nextAudio.play();
    } catch (error) {
      console.error('Failed to play next track:', error);
      this.isCrossfading = false;
      throw error;
    }
    
    // Schedule cleanup after crossfade
    setTimeout(() => {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      this.swapTracks();
      this.isCrossfading = false;
    }, duration);
  }
  
  /**
   * 트랙 교체
   */
  private swapTracks() {
    // Move next to current
    this.currentAudio = this.nextAudio;
    this.currentSource = this.nextSource;
    
    if (this.currentGain) {
      this.currentGain.gain.value = 1;
    }
    
    // Clear next
    this.nextAudio = null;
    this.nextSource = null;
    
    if (this.nextGain) {
      this.nextGain.gain.value = 0;
    }
  }
  
  /**
   * 템포/분위기 기반 크로스페이드 시간 계산
   */
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
        duration += 2000; // 템포 차이가 크면 2초 추가
      } else if (tempoDiff > 20) {
        duration += 1000; // 중간 차이는 1초 추가
      }
    }
    
    // 분위기 전환에 따른 조정
    if (current.mood && next.mood) {
      const moodTransitions: Record<string, number> = {
        'calm-energetic': 2000,
        'melancholic-joyful': 1500,
        'contemplative-upbeat': 2000,
        'peaceful-dramatic': 2500,
      };
      
      const transitionKey = `${current.mood}-${next.mood}`;
      const reverseKey = `${next.mood}-${current.mood}`;
      
      const adjustment = moodTransitions[transitionKey] || moodTransitions[reverseKey] || 0;
      duration += adjustment;
    }
    
    // v0 → v1: 여정 시작 (긴 페이드)
    if (this.currentIndex === 0) {
      duration = Math.max(duration, 8000);
    }
    
    // vN → vFinal: 피날레 전환 (가장 긴 페이드)
    if (this.currentIndex === this.playlist.length - 2) {
      duration = Math.max(duration, 10000);
    }
    
    return duration;
  }
  
  /**
   * 플레이리스트 설정
   */
  public setPlaylist(tracks: AudioTrack[]) {
    this.playlist = tracks;
    this.currentIndex = 0;
  }
  
  /**
   * 플레이리스트 재생
   */
  public async play(
    tracks?: AudioTrack[],
    startIndex: number = 0,
    options: CrossfadeOptions = {}
  ): Promise<void> {
    // 🔥 중요: 새 재생 전 기존 오디오 정리
    if (this.currentAudio) {
      console.log('[AudioCrossfadeManager] Stopping existing playback before new play');

      // Pause and reset current audio
      if (!this.currentAudio.paused) {
        this.currentAudio.pause();
      }
      this.currentAudio.currentTime = 0;

      // Remove event listeners
      const timeUpdateHandler = (this.currentAudio as any).__timeUpdateHandler;
      const endedHandler = (this.currentAudio as any).__endedHandler;
      if (timeUpdateHandler) {
        this.currentAudio.removeEventListener('timeupdate', timeUpdateHandler);
      }
      if (endedHandler) {
        this.currentAudio.removeEventListener('ended', endedHandler);
      }

      // Clear source
      this.currentAudio.src = '';
      this.currentAudio = null;
    }

    // ✅ Critical Issue #11: 대기 중인 다운로드 중단
    this.abortPendingLoads();

    // Clean up next audio if exists
    if (this.nextAudio) {
      console.log('[AudioCrossfadeManager] Cleaning up preloaded next track');
      this.nextAudio.pause();
      this.nextAudio.src = '';
      this.nextAudio = null;
    }

    // Reset states
    this.isCrossfading = false;
    this.currentSource = null;
    this.nextSource = null;

    if (tracks) {
      this.setPlaylist(tracks);
    }

    if (this.playlist.length === 0) {
      throw new Error('No tracks in playlist');
    }

    const {
      duration = 5000,
      preloadOffset = 15,
      fadeType = 'equalPower'
    } = options;

    // Initialize audio context on first play
    await this.initializeContext();

    this.currentIndex = startIndex;
    this.isPlaying = true;

    // Load and play first track
    const firstTrack = this.playlist[this.currentIndex];
    await this.loadTrack(firstTrack.url, false);

    // After loadTrack, currentAudio should be set
    if (this.currentAudio) {
      await (this.currentAudio as HTMLAudioElement).play();
      this.onTrackChange?.(this.currentIndex, firstTrack);
    }

    // Setup auto-advance
    this.setupAutoAdvance(duration, preloadOffset);
  }
  
  /**
   * 이벤트 리스너 정리 (메모리 누수 방지)
   */
  private cleanupAudioListeners(audio: HTMLAudioElement | null) {
    if (!audio) return;

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

    // ✅ 모든 표준 이벤트도 정리
    audio.onplay = null;
    audio.onpause = null;
    audio.onerror = null;
    audio.onloadeddata = null;
    audio.oncanplay = null;
    audio.oncanplaythrough = null;

    // ✅ Critical Issue #6: play/pause 이벤트 리스너 정리
    const playHandler = (audio as any).__playHandler;
    const pauseHandler = (audio as any).__pauseHandler;

    if (playHandler) {
      audio.removeEventListener('play', playHandler);
      delete (audio as any).__playHandler;
    }

    if (pauseHandler) {
      audio.removeEventListener('pause', pauseHandler);
      delete (audio as any).__pauseHandler;
    }
  }

  /**
   * 네이티브 play/pause 이벤트 리스너 설정
   * ✅ Critical Issue #6 해결: 브라우저 미디어 컨트롤과 상태 동기화
   */
  private setupNativeEventListeners(audio: HTMLAudioElement) {
    // ✅ play 이벤트 리스너 (브라우저 미디어 컨트롤)
    const playHandler = () => {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.onStateChange?.({ isPlaying: true });
        console.log('🎵 Native play event detected');
      }
    };

    // ✅ pause 이벤트 리스너 (브라우저 미디어 컨트롤)
    const pauseHandler = () => {
      if (this.isPlaying) {
        this.isPlaying = false;
        this.onStateChange?.({ isPlaying: false });
        console.log('⏸️ Native pause event detected');
      }
    };

    // 이벤트 리스너 추가
    audio.addEventListener('play', playHandler);
    audio.addEventListener('pause', pauseHandler);

    // 나중에 정리를 위해 참조 저장
    (audio as any).__playHandler = playHandler;
    (audio as any).__pauseHandler = pauseHandler;
  }

  /**
   * 자동 진행 설정
   */
  private setupAutoAdvance(crossfadeDuration: number, preloadOffset: number) {
    if (!this.currentAudio) return;

    // ✅ 기존 리스너 정리 후 새로 설정
    this.cleanupAudioListeners(this.currentAudio);

    const handleTimeUpdate = () => {
      if (!this.currentAudio || !this.isPlaying) return;

      const currentTime = this.currentAudio.currentTime;
      const duration = this.currentAudio.duration;
      const timeRemaining = duration - currentTime;

      // Emit time update callback
      this.onTimeUpdate?.(currentTime, duration);

      // 다음 트랙이 있고, 프리로드 시점에 도달했으며, 아직 로드하지 않았을 때
      if (
        this.currentIndex < this.playlist.length - 1 &&
        timeRemaining <= preloadOffset &&
        !this.nextAudio &&
        !this.isCrossfading
      ) {
        const nextTrack = this.playlist[this.currentIndex + 1];
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
              // 실패한 트랙 건너뛰기 시도도 실패 - 에러만 로깅
              this.onError?.(skipError as Error);
            }
          } else {
            // 마지막 트랙이면 종료
            console.log('🏁 Last track failed to load, ending playlist');
            this.onPlaylistEnd?.();
          }
        });
      }

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

        const adaptiveDuration = this.calculateCrossfadeDuration(
          currentTrack,
          nextTrack,
          crossfadeDuration
        );

        this.crossfade(adaptiveDuration).then(() => {
          this.currentIndex++;
          this.onTrackChange?.(this.currentIndex, nextTrack);

          // Continue to next track
          if (this.currentIndex < this.playlist.length - 1) {
            this.setupAutoAdvance(crossfadeDuration, preloadOffset);
          }
        }).catch(error => {
          console.error('Crossfade failed:', error);
          this.onError?.(error);
        });
      }
    };

    const handleEnded = () => {
      if (this.currentIndex >= this.playlist.length - 1) {
        this.log('🏁 Playlist ended');

        // ✅ 완전한 정리
        this.isPlaying = false;
        this.currentIndex = 0; // 처음으로 리셋

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

    // Add event listeners
    this.currentAudio.addEventListener('timeupdate', handleTimeUpdate);
    this.currentAudio.addEventListener('ended', handleEnded);

    // Store listeners for cleanup
    (this.currentAudio as any).__timeUpdateHandler = handleTimeUpdate;
    (this.currentAudio as any).__endedHandler = handleEnded;
  }

  private log(message: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AudioCrossfadeManager] ${message}`);
    }
  }
  
  /**
   * 일시정지
   */
  public pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    if (this.nextAudio) {
      this.nextAudio.pause();
    }
    this.isPlaying = false;
  }
  
  /**
   * 재개
   */
  public async resume() {
    if (this.currentAudio) {
      await this.currentAudio.play();
      this.isPlaying = true;
    }
  }
  
  /**
   * 다음 트랙
   */
  public async skipToNext(crossfadeDuration: number = 5000, preloadOffset: number = 15) {
    if (this.currentIndex >= this.playlist.length - 1) return;

    this.currentIndex++;
    const track = this.playlist[this.currentIndex];

    // ✅ 이벤트 리스너 정리
    this.cleanupAudioListeners(this.currentAudio);

    // Quick fade (500ms)
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.src = '';
    }

    await this.loadTrack(track.url, false);
    if (this.currentAudio) {
      await this.currentAudio.play();
      this.onTrackChange?.(this.currentIndex, track);

      // ✅ Setup auto-advance for time updates and next track preloading
      this.setupAutoAdvance(crossfadeDuration, preloadOffset);
    }
  }
  
  /**
   * 이전 트랙
   */
  public async skipToPrevious(crossfadeDuration: number = 5000, preloadOffset: number = 15) {
    if (this.currentAudio && this.currentAudio.currentTime > 5) {
      // Restart current track if > 5s
      this.currentAudio.currentTime = 0;
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
      const track = this.playlist[this.currentIndex];

      // ✅ 이벤트 리스너 정리
      this.cleanupAudioListeners(this.currentAudio);

      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      }

      await this.loadTrack(track.url, false);
      if (this.currentAudio) {
        await this.currentAudio.play();
        this.onTrackChange?.(this.currentIndex, track);

        // ✅ Setup auto-advance for time updates and next track preloading
        this.setupAutoAdvance(crossfadeDuration, preloadOffset);
      }
    }
  }
  
  /**
   * 대기 중인 다운로드 중단
   * ✅ Critical Issue #11: 사용자가 플레이리스트 전환 시 불필요한 다운로드 중단
   */
  private abortPendingLoads() {
    if (this.nextAudio && this.nextAudio.readyState < 2) {
      // readyState < 2 = 로드 중
      console.log('🛡️ Aborting pending download');
      this.nextAudio.src = '';  // ✅ 다운로드 중단
      this.nextAudio = null;
    }
  }

  /**
   * 볼륨 설정 (0-100)
   * ✅ Critical Issue #12 해결: 마스터 볼륨 제어
   */
  public setVolume(volume: number) {
    // Clamp volume to 0-100
    this.volume = Math.max(0, Math.min(100, volume)) / 100;

    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = this.volume;
      this.log(`🔊 Volume set to ${Math.round(this.volume * 100)}%`);
    }
  }

  /**
   * 음소거 설정
   */
  public setMuted(muted: boolean) {
    this.isMuted = muted;

    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.volume;
      this.log(`🔇 Mute ${muted ? 'ON' : 'OFF'}`);
    }
  }

  /**
   * 음소거 토글
   */
  public toggleMute() {
    this.setMuted(!this.isMuted);
  }

  /**
   * 정리
   */
  public dispose() {
    this.pause();

    // ✅ 이벤트 리스너 정리
    this.cleanupAudioListeners(this.currentAudio);
    this.cleanupAudioListeners(this.nextAudio);

    if (this.currentAudio) {
      this.currentAudio.src = '';
    }

    if (this.nextAudio) {
      this.nextAudio.src = '';
    }

    // Disconnect nodes
    if (this.currentSource) {
      this.currentSource.disconnect();
    }
    if (this.nextSource) {
      this.nextSource.disconnect();
    }
    if (this.currentGain) {
      this.currentGain.disconnect();
    }
    if (this.nextGain) {
      this.nextGain.disconnect();
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
    }

    // ✅ Critical Issue #5 해결: GlobalAudioContextManager 해제
    // 참조 카운트 감소, 모든 참조가 해제되면 자동으로 닫힘
    if (this.audioContext) {
      GlobalAudioContextManager.release();
    }

    // Clear references
    this.audioContext = null;
    this.currentSource = null;
    this.nextSource = null;
    this.currentGain = null;
    this.nextGain = null;
    this.masterGain = null;
    this.currentAudio = null;
    this.nextAudio = null;
    this.playlist = [];
  }
  
  // Event handlers
  public onTrackChanged(callback: (index: number, track: AudioTrack) => void) {
    this.onTrackChange = callback;
  }

  public onPlaylistEnded(callback: () => void) {
    this.onPlaylistEnd = callback;
  }

  public onErrorOccurred(callback: (error: Error) => void) {
    this.onError = callback;
  }

  public onTimeUpdated(callback: (currentTime: number, duration: number) => void) {
    this.onTimeUpdate = callback;
  }

  public onStateChanged(callback: (state: { isPlaying: boolean }) => void) {
    this.onStateChange = callback;
  }
  
  // Getters
  public get isPlayingNow() {
    return this.isPlaying;
  }

  public get currentTrackIndex() {
    return this.currentIndex;
  }

  public get playlistLength() {
    return this.playlist.length;
  }

  public get currentTrack() {
    return this.playlist[this.currentIndex] || null;
  }

  public get currentVolume() {
    return Math.round(this.volume * 100);
  }

  public get muted() {
    return this.isMuted;
  }
}