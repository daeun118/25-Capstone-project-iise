'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { CompleteForm, type CompleteFormData } from '@/components/journey/CompleteForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Journey {
  id: string;
  book_title: string;
  book_author?: string;
  book_cover_url?: string;
  status: 'reading' | 'completed';
}

export default function CompleteJourneyPage() {
  const params = useParams();
  const router = useRouter();
  const journeyId = params.id as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

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

      // Check if already completed
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
    setIsCompleting(true);
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

      const result = await response.json();

      toast.success('독서 여정을 완료했습니다! 🎉');
      toast.info('최종 음악이 생성되고 있습니다. (약 30초~2분 소요)');

      // Redirect to journey detail page
      setTimeout(() => {
        router.push(`/journey/${journeyId}`);
      }, 2000);
    } catch (error) {
      console.error('Failed to complete journey:', error);
      toast.error(
        error instanceof Error ? error.message : '독서 완료 처리에 실패했습니다.'
      );
    } finally {
      setIsCompleting(false);
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
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">독서 여정을 찾을 수 없습니다</h2>
              <Button onClick={() => router.push('/library')}>내 책장으로 돌아가기</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/journey/${journeyId}`)}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            독서 여정으로 돌아가기
          </Button>

          <div className="flex items-start gap-4">
            {journey.book_cover_url && (
              <img
                src={journey.book_cover_url}
                alt={journey.book_title}
                className="w-24 h-32 object-cover rounded-lg shadow-md"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{journey.book_title}</h1>
              {journey.book_author && (
                <p className="text-lg text-muted-foreground mb-4">{journey.book_author}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="size-4" />
                <span>독서 완료 처리</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm">
              <strong>💡 안내:</strong> 별점, 한줄평, 감상평을 입력하면 독서 여정이 완료됩니다.
              <br />
              입력하신 내용을 바탕으로 여정 전체를 담은 <strong>최종 음악(vFinal)</strong>이
              생성됩니다.
            </p>
          </CardContent>
        </Card>

        {/* Complete Form */}
        <CompleteForm onSubmit={handleComplete} onCancel={handleCancel} />

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>완독 후 어떻게 되나요?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>🎵 최종 음악 생성</strong>
              <p className="text-muted-foreground">
                여정의 모든 기록을 종합하여 하나의 완결된 음악이 만들어집니다.
              </p>
            </div>
            <div>
              <strong>📀 플레이리스트 완성</strong>
              <p className="text-muted-foreground">
                v0부터 vFinal까지 모든 음악이 하나의 플레이리스트로 정리됩니다.
              </p>
            </div>
            <div>
              <strong>🌐 커뮤니티 공유</strong>
              <p className="text-muted-foreground">
                원하시면 게시판에 여정을 공유하여 다른 독자들과 소통할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
