'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioCrossfadeManager } from '@/services/audio-crossfade-manager';
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
  const audioManagerRef = useRef<AudioCrossfadeManager | null>(null);
  
  // State
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlistMode, setPlaylistMode] = useState(false);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(true);
  const [crossfadeDuration, setCrossfadeDuration] = useState(5000); // 5초 기본값
  
  // Initialize audio manager
  useEffect(() => {
    audioManagerRef.current = new AudioCrossfadeManager();
    
    // Set event handlers
    audioManagerRef.current.onTrackChanged((index, track) => {
      setCurrentTrackIndex(index);
      if (playlist[index]) {
        setCurrentTrack(playlist[index]);
        console.log(`🎵 Now playing: ${playlist[index].title}`);
      }
    });
    
    audioManagerRef.current.onPlaylistEnded(() => {
      console.log('🎵 Playlist ended');
      setIsPlaying(false);
      setPlaylistMode(false);
      toast.success('플레이리스트 재생이 완료되었습니다.');
    });
    
    audioManagerRef.current.onErrorOccurred((error) => {
      console.error('🎵 Audio error:', error);
      toast.error('음악 재생 중 오류가 발생했습니다.');
      setIsPlaying(false);
    });
    
    return () => {
      audioManagerRef.current?.dispose();
    };
  }, []);
  
  // Update playlist in audio manager when it changes
  useEffect(() => {
    if (playlist.length > 0 && audioManagerRef.current) {
      const audioTracks = playlist.map(track => ({
        url: track.fileUrl,
        duration: track.duration,
        genre: track.genre,
        mood: track.mood,
        tempo: track.tempo
      }));
      audioManagerRef.current.setPlaylist(audioTracks);
    }
  }, [playlist]);
  
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
      
      if (!audioManagerRef.current) {
        throw new Error('오디오 시스템이 초기화되지 않았습니다.');
      }
      
      // 크로스페이드 설정
      const crossfadeOpts = {
        duration: crossfadeEnabled ? (options.crossfadeDuration || crossfadeDuration) : 0,
        preloadOffset: options.preloadOffset || 15,
        fadeType: 'equalPower' as const
      };
      
      // 오디오 트랙 변환
      const audioTracks = currentPlaylist.map(track => ({
        url: track.fileUrl,
        duration: track.duration,
        genre: track.genre,
        mood: track.mood,
        tempo: track.tempo
      }));
      
      // 재생 시작
      await audioManagerRef.current.play(audioTracks, startIndex, crossfadeOpts);
      
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
      
      // 단일 트랙 플레이리스트로 변환
      await playPlaylist([track], 0, { crossfadeDuration: 0 });
      setPlaylistMode(false);
      
    } catch (error) {
      console.error('Failed to play track:', error);
      toast.error('음악 재생에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [playPlaylist]);
  
  /**
   * 일시정지
   */
  const pause = useCallback(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.pause();
      setIsPlaying(false);
    }
  }, []);
  
  /**
   * 재개
   */
  const resume = useCallback(async () => {
    if (audioManagerRef.current) {
      await audioManagerRef.current.resume();
      setIsPlaying(true);
    }
  }, []);
  
  /**
   * 재생/일시정지 토글
   */
  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await resume();
    }
  }, [isPlaying, pause, resume]);
  
  /**
   * 다음 트랙
   */
  const skipToNext = useCallback(async () => {
    if (audioManagerRef.current && playlist.length > 0) {
      await audioManagerRef.current.skipToNext();
    }
  }, [playlist]);
  
  /**
   * 이전 트랙
   */
  const skipToPrevious = useCallback(async () => {
    if (audioManagerRef.current && playlist.length > 0) {
      await audioManagerRef.current.skipToPrevious();
    }
  }, [playlist]);
  
  /**
   * 특정 트랙으로 이동
   */
  const skipToTrack = useCallback(async (index: number) => {
    if (index < 0 || index >= playlist.length) {
      console.warn('Invalid track index');
      return;
    }
    
    // 현재 재생 중지
    pause();
    
    // 새 인덱스에서 재생
    await playPlaylist(undefined, index);
  }, [playlist, pause, playPlaylist]);
  
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
  const clearPlaylist = useCallback(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.dispose();
      audioManagerRef.current = new AudioCrossfadeManager();
    }
    
    setPlaylist([]);
    setCurrentTrack(null);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    setPlaylistMode(false);
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
    hasNext: currentTrackIndex < playlist.length - 1,
    hasPrevious: currentTrackIndex > 0,
  };
}