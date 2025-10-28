'use client';

/**
 * DeleteAccountDialog Component
 *
 * 회원탈퇴 확인 모달
 * - 2단계 확인 절차 (경고 → 비밀번호 입력)
 * - 삭제될 데이터 목록 표시
 * - 비밀번호 재확인
 * - 최종 확인 체크박스
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Loader2,
  Trash2,
  User,
  BookOpen,
  Music,
  FileText,
  Heart,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

interface DeleteAccountDialogProps {
  /**
   * 트리거 버튼의 variant (기본: destructive)
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /**
   * 트리거 버튼의 크기 (기본: default)
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /**
   * 트리거 버튼 텍스트 (기본: '회원탈퇴')
   */
  buttonText?: string;
  /**
   * 트리거 버튼의 추가 클래스
   */
  className?: string;
}

export function DeleteAccountDialog({
  variant = 'destructive',
  size = 'default',
  buttonText = '회원탈퇴',
  className,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data types that will be deleted with icons
  const deletedDataItems = [
    { id: 'profile', icon: User, label: '프로필 정보 (닉네임, 프로필 이미지)', color: 'text-blue-500' },
    { id: 'journey', icon: BookOpen, label: '독서 여정 기록 (모든 책과 독서 로그)', color: 'text-green-500' },
    { id: 'music', icon: Music, label: '생성된 음악 파일 (AI 생성 음악 포함)', color: 'text-purple-500' },
    { id: 'posts', icon: FileText, label: '작성한 게시물 및 댓글', color: 'text-orange-500' },
    { id: 'likes', icon: Heart, label: '좋아요 및 북마크', color: 'text-pink-500' },
    { id: 'account', icon: Mail, label: '계정 정보 (이메일, 인증 정보)', color: 'text-indigo-500' },
  ];

  const handleDelete = async () => {
    // Validation
    if (!password.trim()) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }

    if (!confirmed) {
      toast.error('계정 삭제에 동의해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '계정 삭제에 실패했습니다.');
      }

      // Success
      toast.success('계정이 성공적으로 삭제되었습니다.');

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error instanceof Error ? error.message : '계정 삭제 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setPassword('');
    setConfirmed(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Trash2 className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-[600px] max-h-[75vh] overflow-y-auto border-2"
      >
        {/* Gradient border accent */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)',
          }}
        />

        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-12 h-12 rounded-full flex items-center justify-center relative"
            >
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                }}
              />
              <ShieldAlert className="w-6 h-6 text-destructive relative z-10" />
            </m.div>
            <span className="text-destructive font-bold">회원탈퇴</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Enhanced warning message with gradient */}
          <div className="relative rounded-xl overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              }}
            />
            <div className="relative backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border-2 border-destructive/20 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-1">주의: 복구 불가능</h4>
                  <p className="text-sm text-muted-foreground">
                    다음 데이터가 영구적으로 삭제됩니다:
                  </p>
                </div>
              </div>

              {/* Animated list with icons */}
              <ul className="space-y-2">
                {deletedDataItems.map((item, index) => (
                  <m.li
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-3 group"
                  >
                    <m.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-sm"
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </m.div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.label}
                    </span>
                  </m.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional warnings with better styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-destructive" />
              <span className="text-xs">삭제된 데이터는 복구할 수 없습니다.</span>
            </m.div>
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-muted-foreground/10"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span className="text-xs">탈퇴 후 동일한 이메일로 재가입할 수 있습니다.</span>
            </m.div>
          </div>

          {/* Enhanced password input */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              비밀번호 확인 <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="계정 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-10 border-2 border-destructive/30 focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:border-destructive transition-all"
              />
              {password && (
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                </m.div>
              )}
            </div>
            <p className="text-xs text-muted-foreground pl-1">
              본인 확인을 위해 현재 사용 중인 비밀번호를 입력해주세요.
            </p>
          </m.div>

          {/* Enhanced final confirmation checkbox */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative rounded-lg overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              }}
            />
            <div className="relative flex items-start space-x-3 space-y-0 rounded-lg border-2 border-destructive/30 p-4 bg-white/50 dark:bg-gray-900/50">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                disabled={loading}
                className="mt-1 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
              />
              <div className="space-y-1 leading-none flex-1">
                <Label
                  htmlFor="confirm"
                  className="text-sm font-semibold leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  모든 데이터가 영구적으로 삭제됨을 이해했으며, 계정 삭제에 동의합니다.
                </Label>
                {confirmed && (
                  <m.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-destructive mt-2"
                  >
                    최종 확인되었습니다. 계정 삭제 버튼을 누르면 즉시 처리됩니다.
                  </m.p>
                )}
              </div>
            </div>
          </m.div>
        </div>

        <DialogFooter className="gap-3 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="shadow-sm hover:shadow-md transition-all border-2"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading || !password.trim() || !confirmed}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 border-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                계정 영구 삭제
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
