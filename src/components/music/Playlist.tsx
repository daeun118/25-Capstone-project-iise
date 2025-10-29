import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music, Disc3, Sparkles, Clock } from 'lucide-react';
import { m } from 'framer-motion';

interface MusicTrack {
  id: string;
  version: string;
  title: string;
  url: string;
  genre?: string;
  mood?: string;
  duration?: number;
}

interface PlaylistProps {
  tracks: MusicTrack[];
  currentTrackId?: string;
  isPlaying?: boolean;
  onTrackSelect: (trackId: string) => void;
  onPlayPause?: () => void;
  showHeader?: boolean;
}

export function Playlist({
  tracks,
  currentTrackId,
  isPlaying = false,
  onTrackSelect,
  onPlayPause,
  showHeader = true,
}: PlaylistProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const content = (
    <div className="space-y-3">
      {tracks.map((track, index) => {
        const isCurrent = track.id === currentTrackId;

        return (
          <m.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative"
          >
            <div
              className={`
                relative overflow-hidden p-4 rounded-xl cursor-pointer
                transition-all duration-300
                ${
                  isCurrent
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-green-500/50 shadow-lg shadow-green-500/10'
                    : 'bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm border border-purple-200/30 hover:shadow-xl hover:shadow-purple-500/10 hover:scale-[1.02] hover:border-purple-300/50'
                }
              `}
              onClick={() => !isCurrent && onTrackSelect(track.id)}
            >
              {/* Mini Waveform Animation (재생 중) */}
              {isCurrent && isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-60">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <Button
                  size="icon"
                  variant={isCurrent ? 'default' : 'outline'}
                  className={`
                    shrink-0 w-12 h-12 rounded-full shadow-md
                    transition-all duration-300 border-0
                    ${
                      isCurrent && isPlaying
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 animate-pulse ring-4 ring-green-400/30 text-white'
                        : isCurrent
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCurrent) {
                      onPlayPause?.();
                    } else {
                      onTrackSelect(track.id);
                    }
                  }}
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5 ml-0.5" />
                  )}
                </Button>

                {/* Track Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Version Badge + Playing Status */}
                  <div className="flex items-center gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold shadow-md"
                      style={{
                        background: isCurrent
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white',
                      }}
                    >
                      {track.version}
                    </div>
                    {isCurrent && (
                      <m.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-medium"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        재생 중
                      </m.div>
                    )}
                  </div>

                  {/* Title */}
                  <p className={`font-bold text-base truncate ${
                    isCurrent ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {track.title}
                  </p>

                  {/* Genre & Mood */}
                  {track.genre && track.mood && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Disc3 className="w-4 h-4 text-primary" />
                        <span className="font-medium">{track.genre}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">{track.mood}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="shrink-0 flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium tabular-nums">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            </div>
          </m.div>
        );
      })}
    </div>
  );

  if (!showHeader) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="size-5" />
          독서 플레이리스트
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
