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

export class AudioCrossfadeManager {
  private audioContext: AudioContext | null = null;
  private currentSource: MediaElementAudioSourceNode | null = null;
  private nextSource: MediaElementAudioSourceNode | null = null;
  private currentGain: GainNode | null = null;
  private nextGain: GainNode | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private nextAudio: HTMLAudioElement | null = null;
  
  private playlist: AudioTrack[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private isCrossfading = false;
  
  // Callbacks
  private onTrackChange?: (index: number, track: AudioTrack) => void;
  private onPlaylistEnd?: () => void;
  private onError?: (error: Error) => void;
  
  constructor() {
    // AudioContext는 사용자 인터랙션 후에 초기화
  }
  
  /**
   * AudioContext 초기화 (사용자 인터랙션 필요)
   */
  private async initializeContext() {
    if (this.audioContext) return;
    
    try {
      // @ts-ignore - WebKit prefix for Safari
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // Create gain nodes
      this.currentGain = this.audioContext.createGain();
      this.nextGain = this.audioContext.createGain();
      
      // Connect to destination
      this.currentGain.connect(this.audioContext.destination);
      this.nextGain.connect(this.audioContext.destination);
      
      // Initialize gain values
      this.currentGain.gain.value = 1;
      this.nextGain.gain.value = 0;
      
      // Resume context if suspended (iOS)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      throw new Error('오디오 시스템 초기화에 실패했습니다.');
    }
  }
  
  /**
   * 트랙 로드
   */
  private async loadTrack(url: string, isNext: boolean = false): Promise<HTMLAudioElement> {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    
    return new Promise((resolve, reject) => {
      const handleCanPlay = () => {
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
        
        resolve(audio);
      };
      
      const handleError = (e: Event) => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
        reject(new Error(`Failed to load audio: ${url}`));
      };
      
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
      audio.src = url;
      audio.load();
    });
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
    
    if (this.currentAudio) {
      await this.currentAudio.play();
      this.onTrackChange?.(this.currentIndex, firstTrack);
    }
    
    // Setup auto-advance
    this.setupAutoAdvance(duration, preloadOffset);
  }
  
  /**
   * 자동 진행 설정
   */
  private setupAutoAdvance(crossfadeDuration: number, preloadOffset: number) {
    if (!this.currentAudio) return;
    
    const handleTimeUpdate = () => {
      if (!this.currentAudio || !this.isPlaying) return;
      
      const currentTime = this.currentAudio.currentTime;
      const duration = this.currentAudio.duration;
      const timeRemaining = duration - currentTime;
      
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
        });
      }
      
      // 크로스페이드 시작 시점
      const crossfadeStart = (crossfadeDuration / 1000) + 1; // 1초 여유
      if (
        this.nextAudio &&
        timeRemaining <= crossfadeStart &&
        !this.isCrossfading
      ) {
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
        this.isPlaying = false;
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
  public async skipToNext() {
    if (this.currentIndex >= this.playlist.length - 1) return;
    
    this.currentIndex++;
    const track = this.playlist[this.currentIndex];
    
    // Quick fade (500ms)
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    
    await this.loadTrack(track.url, false);
    if (this.currentAudio) {
      await this.currentAudio.play();
      this.onTrackChange?.(this.currentIndex, track);
    }
  }
  
  /**
   * 이전 트랙
   */
  public async skipToPrevious() {
    if (this.currentAudio && this.currentAudio.currentTime > 5) {
      // Restart current track if > 5s
      this.currentAudio.currentTime = 0;
    } else if (this.currentIndex > 0) {
      this.currentIndex--;
      const track = this.playlist[this.currentIndex];
      
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      
      await this.loadTrack(track.url, false);
      if (this.currentAudio) {
        await this.currentAudio.play();
        this.onTrackChange?.(this.currentIndex, track);
      }
    }
  }
  
  /**
   * 정리
   */
  public dispose() {
    this.pause();
    
    // Remove event listeners
    if (this.currentAudio) {
      const timeUpdateHandler = (this.currentAudio as any).__timeUpdateHandler;
      const endedHandler = (this.currentAudio as any).__endedHandler;
      if (timeUpdateHandler) {
        this.currentAudio.removeEventListener('timeupdate', timeUpdateHandler);
      }
      if (endedHandler) {
        this.currentAudio.removeEventListener('ended', endedHandler);
      }
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
    
    // Close context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    // Clear references
    this.audioContext = null;
    this.currentSource = null;
    this.nextSource = null;
    this.currentGain = null;
    this.nextGain = null;
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
}