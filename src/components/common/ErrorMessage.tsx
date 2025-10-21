import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = '오류가 발생했습니다',
  message = '문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  onRetry,
  onGoHome,
  className,
}: ErrorMessageProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8', className)}>
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            다시 시도
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            홈으로
          </Button>
        )}
      </div>
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorMessage
        title="예상치 못한 오류가 발생했습니다"
        message={error.message || '애플리케이션에 문제가 발생했습니다.'}
        onRetry={resetError}
        onGoHome={() => window.location.href = '/'}
      />
    </div>
  );
}
