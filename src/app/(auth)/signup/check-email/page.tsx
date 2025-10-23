import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Mail className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">이메일을 확인해주세요</CardTitle>
            <CardDescription className="text-sm text-balance">
              회원가입이 거의 완료되었습니다!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">인증 이메일 발송 완료</p>
                  <p className="text-sm text-muted-foreground">
                    가입하신 이메일 주소로 인증 메일을 발송했습니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">이메일 확인 필요</p>
                  <p className="text-sm text-muted-foreground">
                    이메일의 인증 링크를 클릭하여 계정을 활성화해주세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">💡 메일이 보이지 않나요?</span>
                <br />
                스팸 메일함을 확인하거나, 몇 분 후 다시 확인해주세요.
              </p>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  이메일 확인 완료, 로그인하기
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  홈으로 돌아가기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
