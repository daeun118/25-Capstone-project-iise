import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music } from 'lucide-react';

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
}

export function Playlist({
  tracks,
  currentTrackId,
  isPlaying = false,
  onTrackSelect,
  onPlayPause,
}: PlaylistProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="size-5" />
          독서 플레이리스트
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {tracks.map((track) => {
            const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent cursor-pointer'
                }`}
                onClick={() => !isCurrent && onTrackSelect(track.id)}
              >
                <Button
                  size="icon"
                  variant={isCurrent ? 'default' : 'outline'}
                  className="shrink-0"
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
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {track.version}
                    </Badge>
                    {isCurrent && (
                      <Badge variant="default" className="text-xs">
                        재생 중
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-sm truncate">{track.title}</p>
                  {track.genre && track.mood && (
                    <p className="text-xs text-muted-foreground">
                      {track.genre} · {track.mood}
                    </p>
                  )}
                </div>

                <span className="text-sm text-muted-foreground shrink-0">
                  {formatDuration(track.duration)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
