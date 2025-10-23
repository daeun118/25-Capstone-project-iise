'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoginDialog } from './LoginDialog';
import { SignupDialog } from './SignupDialog';
import { Lock } from 'lucide-react';
import { m } from 'framer-motion';

interface AuthRequiredProps {
  title?: string;
  description?: string;
}

/**
 * AuthRequired Component
 *
 * 로그인이 필요한 페이지/기능에 대한 사용자 친화적 안내 UI
 *
 * @param title - 안내 제목 (기본값: "로그인이 필요한 서비스입니다")
 * @param description - 안내 설명 (기본값: "서비스를 이용하려면 로그인해주세요.")
 */
export function AuthRequired({
  title = "로그인이 필요한 서비스입니다",
  description = "서비스를 이용하려면 로그인해주세요."
}: AuthRequiredProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-12 pb-10 px-8 text-center space-y-6">
              {/* Icon */}
              <m.div
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Lock className="w-10 h-10 text-white" />
              </m.div>

              {/* Text */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                <p className="text-slate-600">{description}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setLoginOpen(true)}
                >
                  로그인
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={() => setSignupOpen(true)}
                >
                  회원가입
                </Button>
              </div>

              {/* Additional Info */}
              <p className="text-sm text-slate-500 pt-2">
                회원가입은 1분이면 완료됩니다.
              </p>
            </CardContent>
          </Card>
        </m.div>
      </div>

      {/* Auth Dialogs */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}
