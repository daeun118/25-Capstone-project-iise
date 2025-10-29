'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Sparkles, Check, AlertCircle } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNickname: string;
  onProfileUpdated: (newNickname: string) => void;
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  currentNickname,
  onProfileUpdated,
}: ProfileEditDialogProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNickname(currentNickname);
      setValidationError(null);
    }
  }, [open, currentNickname]);

  // Real-time validation
  useEffect(() => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setValidationError('닉네임을 입력해주세요');
    } else if (trimmed.length < 2) {
      setValidationError('최소 2자 이상 입력해주세요');
    } else if (trimmed.length > 50) {
      setValidationError('최대 50자까지 입력 가능합니다');
    } else if (trimmed === currentNickname) {
      setValidationError('현재 닉네임과 동일합니다');
    } else {
      setValidationError(null);
    }
  }, [nickname, currentNickname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요');
      return;
    }

    if (nickname.trim().length < 2 || nickname.trim().length > 50) {
      toast.error('닉네임은 2자 이상 50자 이하로 입력해주세요');
      return;
    }

    if (nickname.trim() === currentNickname) {
      toast.error('현재 닉네임과 동일합니다');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || '프로필 수정에 실패했습니다');
        return;
      }

      toast.success('프로필이 수정되었습니다');
      onProfileUpdated(data.profile.nickname);
      onOpenChange(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('프로필 수정 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-2 shadow-2xl">
        {/* Gradient Top Border */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
          }}
        />

        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <m.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              }}
            >
              <User className="w-6 h-6 text-white" />
            </m.div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                프로필 수정
              </DialogTitle>
              <DialogDescription className="text-base">
                닉네임을 변경할 수 있습니다. (2-50자)
              </DialogDescription>
            </div>
            <m.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
            </m.div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <m.div 
              className="grid gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="nickname" className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                닉네임
              </Label>
              <div className="relative">
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  maxLength={50}
                  disabled={isSubmitting}
                  className="h-12 text-base border-2 border-indigo-200/50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 transition-all"
                />
                <m.div
                  className="absolute bottom-2 right-3 text-xs font-medium"
                  animate={{ 
                    color: nickname.length >= 45 ? ['#6366f1', '#a855f7'] : '#9ca3af',
                    scale: nickname.length >= 45 ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {nickname.length}/50자
                </m.div>
              </div>
              <AnimatePresence>
                {validationError && (
                  <m.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-sm text-red-500 mt-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-6 border-2 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all"
            >
              취소
            </Button>
            <m.div whileHover={{ scale: !validationError && !isSubmitting ? 1.05 : 1 }} whileTap={{ scale: !validationError && !isSubmitting ? 0.95 : 1 }}>
              <Button 
                type="submit" 
                disabled={isSubmitting || !!validationError}
                className="px-8 h-11 font-bold border-0 shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: isSubmitting || validationError
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <m.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2"
                    >
                      <Sparkles className="w-4 h-4" />
                    </m.div>
                    수정 중...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    수정
                  </>
                )}
              </Button>
            </m.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
