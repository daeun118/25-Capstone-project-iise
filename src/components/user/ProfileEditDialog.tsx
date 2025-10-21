'use client';

import { useState } from 'react';
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            닉네임을 변경할 수 있습니다. (2-50자)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                maxLength={50}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                {nickname.length}/50자
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
