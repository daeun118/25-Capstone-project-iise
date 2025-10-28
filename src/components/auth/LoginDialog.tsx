'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { BookOpen } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSwitchToSignup }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-primary/10">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">ReadTune에 로그인</DialogTitle>
          <DialogDescription className="text-sm text-balance">
            이메일과 비밀번호를 입력하여 로그인하세요
          </DialogDescription>
        </DialogHeader>

        <LoginForm />

        {onSwitchToSignup && (
          <div className="border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              아직 계정이 없으신가요?{' '}
              <button
                onClick={onSwitchToSignup}
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                회원가입
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
