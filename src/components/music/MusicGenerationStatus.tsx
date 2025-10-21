import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Music } from 'lucide-react';

interface MusicGenerationStatusProps {
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress?: number;
  version?: string;
  errorMessage?: string;
}

export function MusicGenerationStatus({
  status,
  progress = 0,
  version = 'v0',
  errorMessage,
}: MusicGenerationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Music,
          text: '음악 생성 대기 중',
          color: 'text-muted-foreground',
          variant: 'secondary' as const,
        };
      case 'generating':
        return {
          icon: Loader2,
          text: '음악 생성 중',
          color: 'text-primary',
          variant: 'default' as const,
          animate: true,
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: '음악 생성 완료',
          color: 'text-green-500',
          variant: 'default' as const,
        };
      case 'error':
        return {
          icon: XCircle,
          text: '음악 생성 실패',
          color: 'text-destructive',
          variant: 'destructive' as const,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon
                className={`size-5 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
              />
              <div>
                <p className="font-semibold">{config.text}</p>
                <p className="text-sm text-muted-foreground">{version}</p>
              </div>
            </div>
            <Badge variant={config.variant}>{status}</Badge>
          </div>

          {status === 'generating' && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">진행률</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {status === 'error' && errorMessage && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {errorMessage}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
