import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">ReadTune에 로그인</CardTitle>
            <CardDescription className="text-sm text-balance">
              이메일과 비밀번호를 입력하여 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardContent className="border-t pt-6">
            <p className="text-center text-sm text-muted-foreground">
              아직 계정이 없으신가요?{' '}
              <Link
                href="/signup"
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                회원가입
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
