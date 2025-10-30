/**
 * AudioStateManager - 중앙 집중식 오디오 상태 관리자
 *
 * 싱글톤 패턴으로 전체 앱에서 단일 오디오 인스턴스만 유지
 * 모든 재생 요청을 중앙에서 관리하여 겹침 현상 방지
 */

import { AudioCrossfadeManager } from './audio-crossfade-manager';

export interface AudioTrack {
  url: string;
  duration: number;
  genre?: string;
  mood?: string;
  tempo?: number;
}

export interface CrossfadeOptions {
  duration?: number;
  preloadOffset?: number;
  fadeType?: 'linear' | 'exponential' | 'equalPower';
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTime: number;
  duration: number;
  playlistLength: number;
  mode: 'single' | 'playlist';
}

type StateChangeListener = (state: PlaybackState) => void;
type TrackChangeListener = (index: number, track: AudioTrack) => void;
type PlaylistEndListener = () => void;
type ErrorListener = (error: Error) => void;

export class AudioStateManager {
  private static instance: AudioStateManager;
  private activePlayer: AudioCrossfadeManager | null = null;
  private currentPlaylist: AudioTrack[] = [];
  private playbackState: PlaybackState = {
    isPlaying: false,
    currentTrackIndex: 0,
    currentTime: 0,
    duration: 0,
    playlistLength: 0,
    mode: 'single'
  };

  // Event listeners
  private stateChangeListeners: Set<StateChangeListener> = new Set();
  private trackChangeListeners: Set<TrackChangeListener> = new Set();
  private playlistEndListeners: Set<PlaylistEndListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  // ✅ 경쟁 조건 방지: 재생 초기화 중 플래그
  private isInitializing = false;

  // Debug mode
  private debugMode = false;

  private constructor() {
    // Private constructor for singleton
    this.initializeDebugMode();
  }

  /**
   * 싱글톤 인스턴스 획득
   */
  public static getInstance(): AudioStateManager {
    if (!AudioStateManager.instance) {
      AudioStateManager.instance = new AudioStateManager();
    }
    return AudioStateManager.instance;
  }

  /**
   * 디버그 모드 초기화
   */
  private initializeDebugMode() {
    if (typeof window !== 'undefined') {
      (window as any).__AUDIO_MANAGER__ = {
        getState: () => this.playbackState,
        getActivePlayer: () => this.activePlayer,
        forceStop: () => this.stopAll(),
        enableDebug: () => { this.debugMode = true; },
        disableDebug: () => { this.debugMode = false; }
      };
    }
  }

  /**
   * 기존 재생 정리
   */
  private async cleanupExistingPlayback(): Promise<void> {
    if (this.activePlayer) {
      this.log('🧹 Cleaning up existing playback');

      // Remove event listeners from old player
      this.activePlayer.onTrackChanged(() => {});
      this.activePlayer.onPlaylistEnded(() => {});
      this.activePlayer.onErrorOccurred(() => {});
      this.activePlayer.onTimeUpdated(() => {});

      // Dispose old player
      this.activePlayer.dispose();
      this.activePlayer = null;
    }

    // Reset state
    this.updateState({
      isPlaying: false,
      currentTime: 0,
      duration: 0
    });
  }

  /**
   * 플레이리스트 재생
   */
  public async playPlaylist(
    tracks: AudioTrack[],
    startIndex: number = 0,
    options: CrossfadeOptions = {}
  ): Promise<void> {
    // ✅ 초기화 중이면 대기 또는 거부
    if (this.isInitializing) {
      this.log('⚠️ Already initializing, ignoring duplicate request');
      return;
    }

    this.isInitializing = true;

    try {
      this.log(`🎵 Starting playlist with ${tracks.length} tracks from index ${startIndex}`);

      // 1. 기존 재생 정리
      await this.cleanupExistingPlayback();

      // 2. 새 플레이어 생성
      this.activePlayer = new AudioCrossfadeManager();
      this.currentPlaylist = tracks;

      // 3. 이벤트 핸들러 설정
      this.setupEventHandlers();

      // 4. 상태 업데이트
      this.updateState({
        playlistLength: tracks.length,
        currentTrackIndex: startIndex,
        mode: 'playlist'
      });

      // 5. 재생 시작
      await this.activePlayer.play(tracks, startIndex, options);

      this.updateState({
        isPlaying: true
      });

      this.log('✅ Playlist playback started successfully');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    } finally {
      // ✅ 항상 플래그 해제
      this.isInitializing = false;
    }
  }

  /**
   * 단일 트랙 재생
   */
  public async playTrack(track: AudioTrack): Promise<void> {
    try {
      this.log(`🎵 Playing single track: ${track.url}`);

      // 단일 트랙을 플레이리스트로 변환하여 재생
      await this.playPlaylist([track], 0, { duration: 0 });

      // 모드를 single로 변경
      this.updateState({ mode: 'single' });

      this.log('✅ Single track playback started');
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * 일시정지
   */
  public pause(): void {
    if (this.activePlayer && this.playbackState.isPlaying) {
      this.log('⏸️ Pausing playback');
      this.activePlayer.pause();
      this.updateState({ isPlaying: false });
    }
  }

  /**
   * 재개
   */
  public async resume(): Promise<void> {
    if (this.activePlayer && !this.playbackState.isPlaying) {
      this.log('▶️ Resuming playback');
      await this.activePlayer.resume();
      this.updateState({ isPlaying: true });
    }
  }

  /**
   * 재생/일시정지 토글
   */
  public async togglePlayPause(): Promise<void> {
    if (this.playbackState.isPlaying) {
      this.pause();
    } else {
      await this.resume();
    }
  }

  /**
   * 다음 트랙
   */
  public async skipToNext(crossfadeDuration: number = 5000, preloadOffset: number = 15): Promise<void> {
    if (this.activePlayer && this.playbackState.currentTrackIndex < this.playbackState.playlistLength - 1) {
      this.log('⏭️ Skipping to next track');
      await this.activePlayer.skipToNext(crossfadeDuration, preloadOffset);
    }
  }

  /**
   * 이전 트랙
   */
  public async skipToPrevious(crossfadeDuration: number = 5000, preloadOffset: number = 15): Promise<void> {
    if (this.activePlayer && this.playbackState.currentTrackIndex > 0) {
      this.log('⏮️ Skipping to previous track');
      await this.activePlayer.skipToPrevious(crossfadeDuration, preloadOffset);
    }
  }

  /**
   * 특정 트랙으로 이동
   */
  public async skipToTrack(index: number): Promise<void> {
    if (index < 0 || index >= this.playbackState.playlistLength) {
      throw new Error(`Invalid track index: ${index}`);
    }

    this.log(`⏭️ Skipping to track ${index}`);

    // 현재 플레이리스트로 재생 재시작
    await this.playPlaylist(this.currentPlaylist, index);
  }

  /**
   * 모든 재생 중지
   */
  public async stopAll(): Promise<void> {
    this.log('🛑 Stopping all playback');
    await this.cleanupExistingPlayback();
    this.currentPlaylist = [];
    this.updateState({
      playlistLength: 0,
      currentTrackIndex: 0,
      mode: 'single'
    });
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    if (!this.activePlayer) return;

    this.activePlayer.onTrackChanged((index, track) => {
      this.log(`🎵 Track changed to index ${index}`);
      this.updateState({ currentTrackIndex: index });
      this.trackChangeListeners.forEach(listener => listener(index, track));
    });

    this.activePlayer.onTimeUpdated((currentTime, duration) => {
      this.updateState({ currentTime, duration });
    });

    this.activePlayer.onPlaylistEnded(() => {
      this.log('🏁 Playlist ended');
      this.updateState({ isPlaying: false });
      this.playlistEndListeners.forEach(listener => listener());
    });

    this.activePlayer.onErrorOccurred((error) => {
      this.handleError(error);
    });

    // ✅ Critical Issue #6 해결: 네이티브 play/pause 이벤트와 상태 동기화
    this.activePlayer.onStateChanged((state) => {
      this.log(`🔄 State changed: isPlaying=${state.isPlaying}`);
      this.updateState({ isPlaying: state.isPlaying });
    });
  }

  /**
   * 상태 업데이트
   */
  private updateState(partialState: Partial<PlaybackState>): void {
    const oldState = { ...this.playbackState };
    this.playbackState = { ...this.playbackState, ...partialState };

    // Notify listeners only if state actually changed
    if (JSON.stringify(oldState) !== JSON.stringify(this.playbackState)) {
      this.stateChangeListeners.forEach(listener => listener(this.playbackState));
    }
  }

  /**
   * 에러 처리
   */
  private handleError(error: Error): void {
    console.error('🚨 AudioStateManager Error:', error);
    this.errorListeners.forEach(listener => listener(error));
  }

  /**
   * 디버그 로깅
   */
  private log(message: string): void {
    if (this.debugMode || process.env.NODE_ENV === 'development') {
      console.log(`[AudioStateManager] ${message}`);
    }
  }

  // === Event Subscription Methods ===

  public onStateChange(listener: StateChangeListener): () => void {
    this.stateChangeListeners.add(listener);
    // Return unsubscribe function
    return () => this.stateChangeListeners.delete(listener);
  }

  public onTrackChange(listener: TrackChangeListener): () => void {
    this.trackChangeListeners.add(listener);
    return () => this.trackChangeListeners.delete(listener);
  }

  public onPlaylistEnd(listener: PlaylistEndListener): () => void {
    this.playlistEndListeners.add(listener);
    return () => this.playlistEndListeners.delete(listener);
  }

  public onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  // === Getters ===

  public get state(): PlaybackState {
    return { ...this.playbackState };
  }

  public get currentTrack(): AudioTrack | null {
    if (this.currentPlaylist.length === 0) return null;
    return this.currentPlaylist[this.playbackState.currentTrackIndex] || null;
  }

  public get playlist(): AudioTrack[] {
    return [...this.currentPlaylist];
  }

  public get hasNext(): boolean {
    return this.playbackState.currentTrackIndex < this.playbackState.playlistLength - 1;
  }

  public get hasPrevious(): boolean {
    return this.playbackState.currentTrackIndex > 0;
  }

  public get isPlaying(): boolean {
    return this.playbackState.isPlaying;
  }
}