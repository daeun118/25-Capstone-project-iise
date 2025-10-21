import { LoginForm } from '@/components/auth/LoginForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-primary/10">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">BookBeats</h1>
          <p className="text-muted-foreground">
            독서 여정을 음악으로 기록하세요
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">로그인</h2>
            <p className="text-sm text-muted-foreground">
              계정에 로그인하여 독서 여정을 시작하세요
            </p>
          </div>

          <LoginForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          <SocialLoginButtons />
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
