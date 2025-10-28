'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignupForm } from './SignupForm';
import { BookOpen } from 'lucide-react';

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

export function SignupDialog({ open, onOpenChange, onSwitchToLogin }: SignupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-2xl bg-primary/10">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">ReadTune 회원가입</DialogTitle>
          <DialogDescription className="text-sm text-balance">
            이메일로 계정을 만들어 독서 여정을 시작하세요
          </DialogDescription>
        </DialogHeader>

        <SignupForm />

        {onSwitchToLogin && (
          <div className="border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                로그인
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
