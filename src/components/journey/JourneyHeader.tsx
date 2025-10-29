'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookCover } from '@/components/book/BookCover';
import { Calendar, Music, FileText, Star, Share2, CheckCircle, BookOpen } from 'lucide-react';
import { m } from 'framer-motion';
import Image from 'next/image';

interface JourneyHeaderProps {
  bookTitle: string;
  bookAuthor?: string;
  bookPublisher?: string;
  bookCoverUrl?: string;
  status: 'reading' | 'completed';
  logsCount?: number;
  musicTracksCount?: number;
  startedAt: string;
  completedAt?: string;
  rating?: number;
  onShare?: () => void;
  onComplete?: () => void;
}

export function JourneyHeader({
  bookTitle,
  bookAuthor,
  bookPublisher,
  bookCoverUrl,
  status,
  logsCount = 0,
  musicTracksCount = 0,
  startedAt,
  completedAt,
  rating,
  onShare,
  onComplete,
}: JourneyHeaderProps) {
  const isCompleted = status === 'completed';

  return (
    <m.div
      className="relative rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 그라데이션 배경 */}
      <div className={`absolute inset-0 ${isCompleted ? 'bg-gradient-warm' : 'bg-gradient-hero'}`} />

      {/* 그리드 패턴 오버레이 */}
      <div className="absolute inset-0 grid-pattern opacity-10" />

      {/* 콘텐츠 */}
      <div className="relative p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* 책 커버 - 더 크게 */}
          <m.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            <div className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl">
              {bookCoverUrl ? (
                <Image
                  src={bookCoverUrl}
                  alt={bookTitle}
                  width={192}
                  height={288}
                  quality={85}
                  priority
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-accent">
                  <BookOpen className="w-20 h-20 text-white/60" />
                </div>
              )}
            </div>
          </m.div>

          {/* 책 정보 */}
          <div className="flex-1 space-y-6">
            {/* 상태 배지 */}
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge
                className={
                  isCompleted
                    ? 'bg-white/90 text-amber-600 border-0 shadow-md text-sm px-4 py-1.5'
                    : 'bg-white/90 text-primary border-0 shadow-md text-sm px-4 py-1.5'
                }
              >
                {isCompleted ? '✓ 완독' : '읽는 중'}
              </Badge>
            </m.div>

            {/* 제목 & 저자 */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                {bookTitle}
              </h1>
              {bookAuthor && (
                <p className="text-xl text-white/90 font-medium">{bookAuthor}</p>
              )}
              {bookPublisher && (
                <p className="text-sm text-white/70 mt-2">{bookPublisher}</p>
              )}
            </m.div>

            {/* 통계 카드 */}
            <m.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <m.div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white/80">독서 기록</span>
                </div>
                <p className="text-3xl font-bold text-white">{logsCount}</p>
              </m.div>

              <m.div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white/80">생성 음악</span>
                </div>
                <p className="text-3xl font-bold text-white">{musicTracksCount}</p>
              </m.div>

              <m.div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white/80">시작일</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {new Date(startedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </p>
              </m.div>

              {rating && (
                <m.div
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-sm text-white/80">별점</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{rating}.0</p>
                </m.div>
              )}
            </m.div>

            {/* 액션 버튼 */}
            <m.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {status === 'reading' && onComplete && (
                <Button
                  onClick={onComplete}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  독서 완료
                </Button>
              )}
              {status === 'completed' && onShare && (
                <Button
                  onClick={onShare}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  커뮤니티에 공유
                </Button>
              )}
            </m.div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
