'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioStateManager } from '@/services/audio-state-manager';
import { toast } from 'sonner';

export interface MusicTrack {
  id: string;
  title: string;
  fileUrl: string;
  duration: number;
  genre?: string;
  mood?: string;
  tempo?: number;
  artist?: string;
  albumCover?: string;
  version?: number;
  logType?: string;
}

export interface PlaylistOptions {
  crossfadeDuration?: number; // 크로스페이드 시간 (ms)
  preloadOffset?: number;     // 프리로드 시간 (초)
  autoPlay?: boolean;
  loop?: boolean;
  shuffle?: boolean;
}

export function useMusicPlayer() {
  // 싱글톤 AudioStateManager 인스턴스
  const audioManager = useRef(AudioStateManager.getInstance());

  // State
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // ✅ Critical Issue #10: Stale Closure 방지 - 최신 playlist 참조
  const playlistRef = useRef<MusicTrack[]>(playlist);
  playlistRef.current = playlist;
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlistMode, setPlaylistMode] = useState(false);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(true);
  const [crossfadeDuration, setCrossfadeDuration] = useState(5000); // 5초 기본값
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Subscribe to AudioStateManager events
  useEffect(() => {
    const manager = audioManager.current;

    // State change listener
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

    // Track change listener
    const unsubscribeTrack = manager.onTrackChange((index) => {
      console.log(`🎵 Track changed to index ${index}`);
      setCurrentTrackIndex(index);
      // ✅ 항상 최신 playlist 참조
      if (playlistRef.current.length > 0 && playlistRef.current[index]) {
        setCurrentTrack(playlistRef.current[index]);
        console.log(`🎵 Now playing: ${playlistRef.current[index].title}`);
      }
    });

    // Playlist end listener
    const unsubscribeEnd = manager.onPlaylistEnd(() => {
      console.log('🎵 Playlist ended');
      setIsPlaying(false);
      setPlaylistMode(false);
      toast.success('플레이리스트 재생이 완료되었습니다.');
    });

    // Error listener
    const unsubscribeError = manager.onError((error) => {
      console.error('🎵 Audio error:', error);
      toast.error('음악 재생 중 오류가 발생했습니다.');
      setIsPlaying(false);
      setIsLoading(false);
    });

    // Cleanup
    return () => {
      unsubscribeState();
      unsubscribeTrack();
      unsubscribeEnd();
      unsubscribeError();
    };
  }, []); // ✅ 한 번만 등록 (성능 최적화)

  /**
   * 플레이리스트 설정
   */
  const loadPlaylist = useCallback((tracks: MusicTrack[]) => {
    if (tracks.length === 0) {
      console.warn('Empty playlist provided');
      return;
    }

    setPlaylist(tracks);
    setCurrentTrackIndex(0);
    setCurrentTrack(tracks[0]);
    setPlaylistMode(true);

    console.log(`📚 Playlist loaded with ${tracks.length} tracks`);
  }, []);

  /**
   * 플레이리스트 재생 (크로스페이드 포함)
   */
  const playPlaylist = useCallback(async (
    tracks?: MusicTrack[],
    startIndex: number = 0,
    options: PlaylistOptions = {}
  ) => {
    try {
      setIsLoading(true);

      // 새 플레이리스트가 제공되면 로드
      if (tracks) {
        loadPlaylist(tracks);
      }

      // 플레이리스트가 없으면 에러
      if (!tracks && playlist.length === 0) {
        throw new Error('플레이리스트가 비어있습니다.');
      }

      const currentPlaylist = tracks || playlist;

      // 크로스페이드 설정
      const crossfadeOpts = {
        duration: crossfadeEnabled ? (options.crossfadeDuration || crossfadeDuration) : 0,
        preloadOffset: options.preloadOffset || 15,
        fadeType: 'equalPower' as const
      };

      // AudioStateManager를 통해 재생
      const audioTracks = currentPlaylist.map(track => ({
        url: track.fileUrl,
        duration: track.duration,
        genre: track.genre,
        mood: track.mood,
        tempo: track.tempo
      }));

      await audioManager.current.playPlaylist(audioTracks, startIndex, crossfadeOpts);

      setIsPlaying(true);
      setPlaylistMode(true);
      setCurrentTrackIndex(startIndex);
      setCurrentTrack(currentPlaylist[startIndex]);

      toast.success('플레이리스트 재생을 시작합니다.', {
        description: crossfadeEnabled ? '크로스페이드가 활성화되었습니다.' : undefined
      });

    } catch (error) {
      console.error('Failed to play playlist:', error);
      toast.error('플레이리스트 재생에 실패했습니다.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [playlist, crossfadeEnabled, crossfadeDuration, loadPlaylist]);

  /**
   * 단일 트랙 재생
   */
  const playTrack = useCallback(async (track: MusicTrack) => {
    try {
      setIsLoading(true);

      // AudioStateManager를 통해 재생
      const audioTrack = {
        url: track.fileUrl,
        duration: track.duration,
        genre: track.genre,
        mood: track.mood,
        tempo: track.tempo
      };

      await audioManager.current.playTrack(audioTrack);

      // Update local state
      setPlaylist([track]);
      setCurrentTrack(track);
      setCurrentTrackIndex(0);
      setPlaylistMode(false);
      setIsPlaying(true);

      toast.success('음악을 재생합니다.');

    } catch (error) {
      console.error('Failed to play track:', error);
      toast.error('음악 재생에 실패했습니다.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 일시정지
   */
  const pause = useCallback(() => {
    audioManager.current.pause();
    setIsPlaying(false);
  }, []);

  /**
   * 재개
   */
  const resume = useCallback(async () => {
    await audioManager.current.resume();
    setIsPlaying(true);
  }, []);

  /**
   * 재생/일시정지 토글
   */
  const togglePlayPause = useCallback(async () => {
    await audioManager.current.togglePlayPause();
  }, []);

  /**
   * 다음 트랙
   */
  const skipToNext = useCallback(async () => {
    if (audioManager.current.hasNext) {
      await audioManager.current.skipToNext();
    }
  }, []);

  /**
   * 이전 트랙
   */
  const skipToPrevious = useCallback(async () => {
    if (audioManager.current.hasPrevious) {
      await audioManager.current.skipToPrevious();
    }
  }, []);

  /**
   * 특정 트랙으로 이동
   */
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

      setCurrentTrackIndex(index);
      setCurrentTrack(playlist[index]);
    } catch (error) {
      console.error('Failed to skip to track:', error);
      toast.error('트랙 이동에 실패했습니다.');
    }
  }, [playlist, crossfadeEnabled, crossfadeDuration]);

  /**
   * 크로스페이드 설정
   */
  const configureCrossfade = useCallback((enabled: boolean, duration?: number) => {
    setCrossfadeEnabled(enabled);
    if (duration !== undefined) {
      setCrossfadeDuration(duration);
    }

    console.log(`🎵 Crossfade ${enabled ? 'enabled' : 'disabled'}${duration ? ` (${duration}ms)` : ''}`);
  }, []);

  /**
   * 플레이리스트 클리어
   */
  const clearPlaylist = useCallback(async () => {
    await audioManager.current.stopAll();

    setPlaylist([]);
    setCurrentTrack(null);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    setPlaylistMode(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    // State
    playlist,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    isLoading,
    playlistMode,
    crossfadeEnabled,
    crossfadeDuration,
    currentTime,
    duration,

    // Actions
    loadPlaylist,
    playPlaylist,
    playTrack,
    pause,
    resume,
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    skipToTrack,
    configureCrossfade,
    clearPlaylist,

    // Computed
    playlistLength: playlist.length,
    hasNext: audioManager.current.hasNext,
    hasPrevious: audioManager.current.hasPrevious,
  };
}