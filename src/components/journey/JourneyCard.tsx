'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Music, BookOpen, Star, Play, Trash2, MoreVertical } from 'lucide-react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Journey {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl?: string;
  status: 'reading' | 'completed';
  progress?: number;
  logsCount: number;
  musicTracksCount: number;
  startedAt: string;
  completedAt?: string;
  rating?: number;
}

interface JourneyCardProps {
  journey: Journey;
  onClick?: (journey: Journey) => void;
  onDelete?: (journeyId: string) => void;
}

export const JourneyCard = memo(function JourneyCard({ journey, onClick, onDelete }: JourneyCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick?.(journey);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/journeys/${journey.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete journey');
      }

      toast.success('독서 여정이 삭제되었습니다.');
      onDelete?.(journey.id);
      router.refresh();
    } catch (error) {
      console.error('Error deleting journey:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const isCompleted = journey.status === 'completed';
  const progress = journey.progress || (isCompleted ? 100 : 0);

  return (
    <div
      className="card-elevated group cursor-pointer overflow-hidden transition-transform hover:-translate-y-1"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 책 표지 + 호버 오버레이 (Mureka 스타일) */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4">
        {journey.bookCoverUrl ? (
          <Image
            src={journey.bookCoverUrl}
            alt={journey.bookTitle}
            fill
            quality={85}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          >
            <BookOpen className="w-16 h-16 text-white/60" />
          </div>
        )}

        {/* ✅ OPTIMIZED: CSS transition instead of Framer Motion */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          }}
        />

        {/* 상태 배지 (상단 좌측) */}
        <div className="absolute top-3 left-3 z-10">
          <Badge
            className={
              isCompleted
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 shadow-lg'
            }
          >
            {isCompleted ? '완독' : '읽는 중'}
          </Badge>
        </div>

        {/* 더보기 메뉴 (상단 우측) */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ✅ OPTIMIZED: Simple CSS transition */}
        {!isCompleted && progress > 0 && (
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-white/20" />
            <div
              className="absolute inset-y-0 left-0 transition-all duration-300"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                width: `${progress}%`,
              }}
            />
          </div>
        )}

        {/* ✅ OPTIMIZED: CSS scale with reduced animation complexity */}
        <button
          className={`absolute bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
            isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          } active:scale-95`}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            // 음악 재생 로직
          }}
        >
          <Play className="w-6 h-6 text-white ml-0.5" />
        </button>
      </div>

      {/* ✅ OPTIMIZED: Removed unnecessary motion wrapper */}
      {/* 책 정보 */}
      <div className="px-1">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{journey.bookTitle}</h3>
        <p className="text-sm text-gray-500 mb-3">{journey.bookAuthor}</p>

        {/* 별점 (완독 시) */}
        {isCompleted && journey.rating && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < journey.rating!
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm font-bold text-amber-600 ml-1">
              {journey.rating}.0
            </span>
          </div>
        )}

        {/* 메타데이터 (Mureka 스타일 - 간결하게) */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            {journey.musicTracksCount}곡
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {journey.logsCount}개 기록
          </span>
          {!isCompleted && progress > 0 && (
            <span className="font-semibold text-primary">
              {progress}%
            </span>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>독서 여정을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 독서 기록, 생성된 음악, 관련된 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
