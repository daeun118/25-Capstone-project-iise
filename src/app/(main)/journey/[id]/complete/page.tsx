'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { CompleteForm, type CompleteFormData } from '@/components/journey/CompleteForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, PartyPopper, BookOpen, Music, CheckCircle2, Calendar, Clock, ListMusic, Play, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { m } from 'framer-motion';
import Image from 'next/image';

interface Journey {
  id: string;
  book_title: string;
  book_author?: string;
  book_cover_url?: string;
  status: 'reading' | 'completed';
  started_at: string;
  logs_count?: number;
  music_tracks_count?: number;
}

export default function CompleteJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJourney();
  }, [journeyId]);

  const fetchJourney = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/journeys/${journeyId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch journey');
      }

      const data = await response.json();
      setJourney(data.journey);

      if (data.journey.status === 'completed') {
        toast.info('이미 완료된 독서 여정입니다.');
        router.push(`/journey/${journeyId}`);
      }
    } catch (error) {
      console.error('Failed to fetch journey:', error);
      toast.error('독서 여정을 불러오는데 실패했습니다.');
      router.push('/library');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (data: CompleteFormData) => {
    try {
      const response = await fetch(`/api/journeys/${journeyId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: data.rating,
          oneLiner: data.oneLiner,
          review: data.review,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete journey');
      }

      toast.success('독서 여정을 완료했습니다! 🎉');
      toast.info('최종 음악이 생성되고 있습니다.');

      setTimeout(() => {
        router.push(`/journey/${journeyId}`);
      }, 2000);
    } catch (error) {
      console.error('Failed to complete journey:', error);
      toast.error(
        error instanceof Error ? error.message : '독서 완료 처리에 실패했습니다.'
      );
    }
  };

  const handleCancel = () => {
    router.push(`/journey/${journeyId}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="불러오는 중..." />
        </div>
      </AppLayout>
    );
  }

  if (!journey) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="card-elevated p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">독서 여정을 찾을 수 없습니다</h2>
            <Button onClick={() => router.push('/library')}>내 책장으로 돌아가기</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const readingDays = Math.ceil(
    (new Date().getTime() - new Date(journey.started_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const logsCount = journey.logs_count || 0;
  const musicCount = journey.music_tracks_count || 0;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/journey/${journeyId}`)}
          className="mb-6"
        >
          <ArrowLeft className="size-4 mr-2" />
          독서 여정으로 돌아가기
        </Button>

        {/* SECTION 1: HERO - 성취감 표현 */}
        <m.section
          className="space-y-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Congratulations Banner */}
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-warm" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 grid-pattern-lg opacity-20" />

            {/* Content */}
            <div className="relative z-10 text-center text-white">
              {/* Animated Icon */}
              <m.div
                className="inline-flex mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
              >
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                  <PartyPopper className="w-12 h-12" />
                </div>
              </m.div>

              {/* Main Message */}
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                완독을 축하합니다! 🎉
              </h1>

              {/* Sub Message with Stats */}
              <p className="text-xl text-white/90 mb-6">
                {readingDays}일간의 독서 여정을 마쳤습니다
              </p>

              {/* Mini Stats */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{logsCount}개 기록</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span>{musicCount}곡 생성</span>
                </div>
              </div>
            </div>
          </div>

          {/* Book Summary Card */}
          <div className="card-elevated p-6 flex gap-6 items-start">
            {/* Book Cover with Shadow */}
            <div className="relative shrink-0">
              {journey.book_cover_url ? (
                <Image
                  src={journey.book_cover_url}
                  alt={journey.book_title}
                  width={120}
                  height={180}
                  className="rounded-xl shadow-xl"
                  priority
                />
              ) : (
                <div className="w-[120px] h-[180px] rounded-xl bg-gradient-accent flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/60" />
                </div>
              )}
              {/* Completion Badge */}
              <Badge className="absolute -top-2 -right-2 bg-gradient-success border-0 shadow-lg">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                완독
              </Badge>
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                {journey.book_title}
              </h2>
              {journey.book_author && (
                <p className="text-muted-foreground mb-4">
                  {journey.book_author}
                </p>
              )}

              {/* Reading Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{new Date(journey.started_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{readingDays}일</span>
                </div>
              </div>
            </div>
          </div>
        </m.section>

        <Separator className="my-12" />

        {/* SECTION 2: FORM - 감상 입력 */}
        <m.section
          className="space-y-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CompleteForm onSubmit={handleComplete} onCancel={handleCancel} />
        </m.section>

        {/* SECTION 3: BENEFITS - 완독 후 혜택 */}
        <m.section
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold">완독 후 프로세스</h3>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Benefit 1: Final Music */}
            <div className="card-elevated p-6 space-y-3 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold">최종 음악 생성</h4>
              <p className="text-sm text-muted-foreground">
                입력하신 감상을 바탕으로 특별한 피날레 음악(vFinal)을 생성합니다
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <Clock className="w-3 h-3" />
                <span>약 30초~2분 소요</span>
              </div>
            </div>

            {/* Benefit 2: Playlist */}
            <div className="card-elevated p-6 space-y-3 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center">
                <ListMusic className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold">플레이리스트 완성</h4>
              <p className="text-sm text-muted-foreground">
                v0부터 vFinal까지 독서 여정 전체를 담은 플레이리스트가 완성됩니다
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <Play className="w-3 h-3" />
                <span>크로스페이드 자동 재생</span>
              </div>
            </div>

            {/* Benefit 3: Share */}
            <div className="card-elevated p-6 space-y-3 hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold">커뮤니티 공유</h4>
              <p className="text-sm text-muted-foreground">
                완독한 여정을 피드에 공유하고 다른 독자들과 소통하세요
              </p>
              <div className="flex items-center gap-2 text-xs text-primary">
                <Users className="w-3 h-3" />
                <span>선택적 공유</span>
              </div>
            </div>
          </div>
        </m.section>
      </div>
    </AppLayout>
  );
}
