'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function SocialLoginButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoadingProvider(provider);

    try {
      if (provider === 'google') {
        await signInWithGoogle();
        toast.success('Google 로그인 중...');
      } else {
        // Kakao는 Phase 2에서 선택사항으로 나중에 구현
        toast.info('카카오 로그인은 준비 중입니다.');
      }
    } catch (err: any) {
      toast.error(err.message || `${provider} 로그인에 실패했습니다.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('google')}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === 'google' ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <svg className="mr-2 size-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Google로 계속하기
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('kakao')}
        disabled={loadingProvider !== null}
        style={{ backgroundColor: loadingProvider === 'kakao' ? undefined : '#FEE500', color: loadingProvider === 'kakao' ? undefined : '#000000' }}
      >
        {loadingProvider === 'kakao' ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.477 3 2 6.477 2 10.75c0 2.758 1.826 5.193 4.578 6.603-.198.724-.642 2.433-.734 2.826-.115.496.182.49.387.356.153-.1 2.416-1.605 3.139-2.09.515.07 1.041.105 1.63.105 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z" />
          </svg>
        )}
        카카오로 계속하기
      </Button>
    </div>
  );
}
