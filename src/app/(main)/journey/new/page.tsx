'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BookSearchDialog } from '@/components/book/BookSearchDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, Sparkles, Music, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMusicGeneration } from '@/hooks/useMusicGeneration';

export default function NewJourneyPage() {
  const router = useRouter();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { triggerGeneration } = useMusicGeneration();

  const handleBookSelect = async (book: any) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/journeys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_title: book.title,
          book_author: book.authors?.join(', '),
          book_isbn: book.isbn,
          book_description: book.description,
          book_category: book.categories?.[0],
          book_cover_url: book.coverUrl,
          book_publisher: book.publisher,
          book_published_date: book.publishedDate,
        }),
      });

      const data = await response.json();

      if (data.success && data.journey) {
        toast.success('독서 여정이 시작되었습니다! v0 음악을 생성하고 있습니다.');

        // Trigger async music generation
        if (data.musicTrack?.id) {
          triggerGeneration(data.musicTrack.id);
        }

        router.push(`/journey/${data.journey.id}`);
      } else {
        toast.error(data.error || '독서 여정 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Journey creation error:', error);
      toast.error('독서 여정 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
      setSearchDialogOpen(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80 blur-xl" />
          <div className="relative bg-background/95 backdrop-blur-xl rounded-3xl p-12">
            <div className="text-center space-y-6">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-2xl animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                새로운 독서 여정을 시작하세요
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                책을 선택하면 AI가 당신만의 독서 플레이리스트를 만들어갑니다
              </p>
              <Button
                size="lg"
                onClick={() => setSearchDialogOpen(true)}
                disabled={isCreating}
                className="mt-8 px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all group disabled:opacity-50"
              >
                <Search className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                {isCreating ? '여정 생성 중...' : '도서 검색하기'}
              </Button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-6 mb-12">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">독서 여정은 이렇게 진행됩니다</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                icon: Search,
                title: '책 선택',
                description: '읽고 싶은 책을 검색하고 선택합니다',
                color: 'from-primary-500 to-primary-600',
              },
              {
                step: '2',
                icon: Music,
                title: 'v0 음악 생성',
                description: '책 정보를 바탕으로 첫 번째 음악이 생성됩니다',
                color: 'from-secondary-500 to-secondary-600',
              },
              {
                step: '3',
                icon: BookOpen,
                title: '독서 & 기록',
                description: '책을 읽으며 감정과 구절을 기록합니다',
                color: 'from-primary-500 via-secondary-500 to-primary-600',
              },
              {
                step: '4',
                icon: TrendingUp,
                title: '플레이리스트 완성',
                description: '완독 시 전체 여정의 음악이 완성됩니다',
                color: 'from-amber-500 to-amber-600',
              },
            ].map((item) => (
              <Card key={item.step} className="group relative overflow-hidden border-2 hover:border-primary hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="relative text-center p-6">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-primary">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all">
                <Music className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold mb-2">AI 음악 생성</CardTitle>
              <CardDescription className="leading-relaxed">
                당신의 감정과 기록을 바탕으로 AI가 독서 여정을 음악으로 표현합니다
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-primary">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold mb-2">독서 기록</CardTitle>
              <CardDescription className="leading-relaxed">
                인상 깊은 구절과 감정을 기록하며 독서의 순간을 담아내세요
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-primary">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold mb-2">커뮤니티 공유</CardTitle>
              <CardDescription className="leading-relaxed">
                완성된 독서 플레이리스트를 공유하고 다른 독자들과 소통하세요
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          <CardContent className="relative text-center py-16">
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              지금 바로 독서 여정을 시작하세요
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              첫 번째 책을 선택하고 AI가 만드는 나만의 독서 플레이리스트를 경험해보세요
            </p>
            <Button
              size="lg"
              onClick={() => setSearchDialogOpen(true)}
              disabled={isCreating}
              className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all group disabled:opacity-50"
            >
              <Search className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              {isCreating ? '여정 생성 중...' : '도서 검색하기'}
            </Button>
          </CardContent>
        </Card>

        {/* Book Search Dialog */}
        <BookSearchDialog
          open={searchDialogOpen}
          onOpenChange={setSearchDialogOpen}
          onSelectBook={handleBookSelect}
        />
      </div>
    </AppLayout>
  );
}
