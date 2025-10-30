/**
 * Music Generation Hook
 *
 * Handles async music generation workflow:
 * 1. Triggers music generation via API
 * 2. Polls for generation status
 * 3. Notifies when music is ready to play
 *
 * Usage:
 * ```tsx
 * const { triggerGeneration, status, progress } = useMusicGeneration();
 *
 * // After journey created with music track
 * await triggerGeneration(musicTrackId);
 *
 * // Status will update: pending → generating → completed
 * ```
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type MusicStatus = 'pending' | 'generating' | 'completed' | 'error';

interface MusicTrack {
  id: string;
  status: MusicStatus;
  file_url?: string;
  error_message?: string;
  duration?: number;
}

interface UseMusicGenerationReturn {
  /** Trigger music generation for a track */
  triggerGeneration: (trackId: string) => Promise<void>;
  /** Current generation status */
  status: MusicStatus | null;
  /** Progress percentage (estimated) */
  progress: number;
  /** Whether generation is currently active */
  isGenerating: boolean;
  /** Generated music file URL when complete */
  fileUrl: string | null;
  /** Error message if generation failed */
  error: string | null;
  /** Stop polling (useful for cleanup) */
  stopPolling: () => void;
}

export function useMusicGeneration(): UseMusicGenerationReturn {
  const [status, setStatus] = useState<MusicStatus | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const currentTrackId = useRef<string | null>(null);

  /**
   * Stop all polling and progress timers
   */
  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  /**
   * Simulate progress for better UX
   * Real progress tracking would require Mureka API progress updates
   */
  const startProgressSimulation = useCallback(() => {
    setProgress(0);

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 90%
        if (prev >= 90) return 90;
        if (prev >= 70) return prev + 0.5;
        if (prev >= 50) return prev + 1;
        return prev + 2;
      });
    }, 1000); // Update every second
  }, []);

  /**
   * Poll music track status
   */
  const pollTrackStatus = useCallback(async (trackId: string) => {
    try {
      const response = await fetch(`/api/music/${trackId}`);

      if (!response.ok) {
        throw new Error('음악 상태를 불러오는데 실패했습니다.');
      }

      const track: MusicTrack = await response.json();

      setStatus(track.status);

      if (track.status === 'completed') {
        // Generation complete!
        setFileUrl(track.file_url || null);
        setProgress(100);
        stopPolling();

        toast.success('음악 생성이 완료되었습니다!', {
          description: '이제 음악을 들을 수 있습니다.',
        });
      } else if (track.status === 'error') {
        // Generation failed
        setError(track.error_message || '음악 생성에 실패했습니다.');
        setProgress(0);
        stopPolling();

        toast.error('음악 생성에 실패했습니다', {
          description: track.error_message || '다시 시도해주세요.',
        });
      }
      // If status is 'pending' or 'generating', continue polling
    } catch (err) {
      console.error('[useMusicGeneration] Polling error:', err);
      // Don't stop polling on network errors - just log
    }
  }, [stopPolling]);

  /**
   * Trigger music generation for a track
   */
  const triggerGeneration = useCallback(async (trackId: string) => {
    try {
      // Reset state
      setStatus('pending');
      setFileUrl(null);
      setError(null);
      setProgress(0);
      currentTrackId.current = trackId;

      console.log(`[useMusicGeneration] Triggering generation for track ${trackId}`);

      // Start progress simulation
      startProgressSimulation();

      // Trigger generation (fire-and-forget)
      // We don't await this - just trigger it
      fetch(`/api/music/generate/${trackId}`, {
        method: 'POST',
      }).catch((err) => {
        console.error('[useMusicGeneration] Trigger error:', err);
        // Error handling is done via polling
      });

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

    } catch (err) {
      console.error('[useMusicGeneration] Generation trigger failed:', err);
      setError(err instanceof Error ? err.message : '음악 생성을 시작하는데 실패했습니다.');
      setStatus('error');
      stopPolling();

      toast.error('음악 생성을 시작할 수 없습니다', {
        description: '다시 시도해주세요.',
      });
    }
  }, [pollTrackStatus, startProgressSimulation, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    triggerGeneration,
    status,
    progress,
    isGenerating: status === 'generating' || status === 'pending',
    fileUrl,
    error,
    stopPolling,
  };
}
