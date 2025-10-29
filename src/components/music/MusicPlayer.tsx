'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Loader2 } from 'lucide-react';
import { Waveform } from './Waveform';
import { m } from 'framer-motion';

interface MusicPlayerProps {
  trackUrl: string;
  trackTitle: string;
  trackVersion?: string;
  showWaveform?: boolean;
}

export function MusicPlayer({
  trackUrl,
  trackTitle,
  trackVersion = 'v0',
  showWaveform = true,
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!trackUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // TODO: Howler.js 초기화
    audioRef.current = new Audio(trackUrl);

    const audio = audioRef.current;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setIsLoading(false);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    });

    // 초기 로딩 타임아웃 (10초)
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      clearTimeout(loadTimeout);
      audio.pause();
      audio.remove();
    };
  }, [trackUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = newVolume / 100;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume / 100;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 에러 상태 표시
  if (hasError) {
    return (
      <m.div
        className="space-y-4 p-6 rounded-lg bg-red-50 border border-red-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Music className="w-6 h-6 text-red-600" />
          </div>
          <p className="font-semibold text-red-900">음악 파일을 불러올 수 없습니다</p>
          <p className="text-sm text-red-700">
            음악 파일이 아직 생성 중이거나 URL이 유효하지 않습니다.
          </p>
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Track Info */}
      <div className="text-center space-y-2">
        <p className="font-bold text-base">{trackTitle}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-accent">
          <Music className="w-3.5 h-3.5 text-white" />
          <span className="text-sm font-semibold text-white">{trackVersion}</span>
        </div>
      </div>

      {/* Waveform */}
      {showWaveform && <Waveform audioUrl={trackUrl} height={80} />}

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full [&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg"
        />
        <div className="flex justify-between text-xs font-medium text-foreground/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <Button size="icon" variant="ghost" disabled className="opacity-50">
          <SkipBack className="size-5" />
        </Button>

        <m.div
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
        >
          <Button
            size="icon"
            className="size-14 rounded-full shadow-lg bg-gradient-accent text-white"
            onClick={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-6 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="size-6 text-white" fill="white" />
            ) : (
              <Play className="size-6 text-white ml-0.5" fill="white" />
            )}
          </Button>
        </m.div>

        <Button size="icon" variant="ghost" disabled className="opacity-50">
          <SkipForward className="size-5" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <Button size="icon" variant="ghost" onClick={toggleMute} className="size-9">
          {isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-32 [&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
        />
      </div>
    </m.div>
  );
}
