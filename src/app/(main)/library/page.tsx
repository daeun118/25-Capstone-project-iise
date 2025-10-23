'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/common/FilterBar';
import { JourneyCard } from '@/components/journey/JourneyCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Plus, TrendingUp, Clock, Music } from 'lucide-react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';

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

export default function LibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'reading' | 'completed'>('reading');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch journeys from API
  useEffect(() => {
    if (!user) {
      setLoading(false); // 비인증 시 로딩 상태 해제
      return;
    }

    const fetchJourneys = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/journeys');

        if (!response.ok) {
          throw new Error('Failed to fetch journeys');
        }

        const data = await response.json();
        setJourneys(data);
      } catch (error) {
        console.error('Error fetching journeys:', error);
        toast.error('독서 여정을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, [user]);

  // ✅ OPTIMIZED: Memoize filtered and sorted journeys to prevent recalculation
  const filteredJourneys = useMemo(
    () => journeys.filter(j => j.status === activeTab),
    [journeys, activeTab]
  );

  const sortedJourneys = useMemo(
    () => [...filteredJourneys].sort((a, b) => {
      if (sort === 'latest') {
        return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      }
      return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
    }),
    [filteredJourneys, sort]
  );

  // ✅ OPTIMIZED: Memoize pagination calculations
  const itemsPerPage = 8;
  const { totalPages, paginatedJourneys } = useMemo(() => {
    const total = Math.ceil(sortedJourneys.length / itemsPerPage);
    const paginated = sortedJourneys.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
    return { totalPages: total, paginatedJourneys: paginated };
  }, [sortedJourneys, page]);

  // ✅ OPTIMIZED: Memoize statistics calculations
  const { readingCount, completedCount, totalMusicTracks, totalReadingProgress } = useMemo(() => {
    const reading = journeys.filter(j => j.status === 'reading');
    const completed = journeys.filter(j => j.status === 'completed');
    const musicCount = journeys.reduce((acc, j) => acc + j.musicTracksCount, 0);
    const progress = reading.reduce((acc, j) => acc + (j.progress || 0), 0) / (reading.length || 1);

    return {
      readingCount: reading.length,
      completedCount: completed.length,
      totalMusicTracks: musicCount,
      totalReadingProgress: progress,
    };
  }, [journeys]);

  // ✅ OPTIMIZED: Memoize callbacks to prevent child re-renders
  const handleJourneyClick = useCallback((journey: Journey) => {
    router.push(`/journey/${journey.id}`);
  }, [router]);

  const handleJourneyDelete = useCallback((deletedJourneyId: string) => {
    setJourneys((prev) => prev.filter((j) => j.id !== deletedJourneyId));
  }, []);

  // Show loading state
  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="독서 여정을 불러오는 중..." />
        </div>
      </AppLayout>
    );
  }

  // Show auth required if not logged in
  if (!user) {
    return (
      <AppLayout>
        <AuthRequired
          title="로그인이 필요한 서비스입니다"
          description="내 책장을 확인하려면 로그인해주세요."
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <m.div
              className="sticky top-20 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Gradient Header Card */}
              <m.div
                className="relative rounded-2xl overflow-hidden p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* 그라데이션 배경 */}
                <div className="absolute inset-0 bg-gradient-hero" />
                
                {/* 콘텐츠 */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2 text-white">독서 현황</h3>
                  <div className="text-white/90 text-sm mb-4">전체 진행률</div>
                  <m.div
                    className="text-5xl font-bold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    {Math.round(totalReadingProgress)}%
                  </m.div>
                  
                  {/* Progress bar */}
                  <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                    <m.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${totalReadingProgress}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </m.div>

              {/* Stats Card */}
              <m.div
                className="card-elevated p-6 space-y-6 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ y: -2 }}
              >
                {/* Reading Count */}
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-accent">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">읽는 중</span>
                    </div>
                    <span className="text-2xl font-bold">{readingCount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <m.div
                      className="h-full rounded-full bg-gradient-accent"
                      initial={{ width: '0%' }}
                      animate={{ width: `${totalReadingProgress}%` }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                    />
                  </div>
                </m.div>

                {/* Completed Count */}
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">완독</span>
                    </div>
                    <span className="text-2xl font-bold">{completedCount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <m.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(completedCount / Math.max(readingCount + completedCount, 1)) * 100}%` }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    />
                  </div>
                </m.div>

                {/* Music Tracks */}
                <m.div
                  className="pt-4 border-t"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                      >
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">생성된 음악</span>
                    </div>
                    <span className="text-2xl font-bold">{totalMusicTracks}</span>
                  </div>
                </m.div>
              </m.div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <m.div
                  className="card-elevated p-5 rounded-xl group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                >
                  <m.div
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center bg-gradient-accent"
                    whileHover={{ rotate: 5 }}
                  >
                    <Clock className="w-5 h-5 text-white" />
                  </m.div>
                  <p className="text-2xl font-bold">{readingCount + completedCount}</p>
                  <p className="text-xs text-gray-500">총 여정</p>
                </m.div>
                <m.div
                  className="card-elevated p-5 rounded-xl group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  whileHover={{ y: -4, scale: 1.05 }}
                >
                  <m.div
                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    whileHover={{ rotate: 5 }}
                  >
                    <BookOpen className="w-5 h-5 text-white" />
                  </m.div>
                  <p className="text-2xl font-bold">{Math.round(totalReadingProgress)}%</p>
                  <p className="text-xs text-gray-500">평균 진행률</p>
                </m.div>
              </div>
            </m.div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold mb-2">내 책장</h1>
              <p className="text-muted-foreground text-lg">
                나의 독서 여정을 관리하세요
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reading' | 'completed')}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="reading">
                    <BookOpen className="w-4 h-4 mr-2" />
                    읽는 중 ({readingCount})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    완독 ({completedCount})
                  </TabsTrigger>
                </TabsList>

                <FilterBar
                  sortOptions={[
                    { value: 'latest', label: '최신순' },
                    { value: 'oldest', label: '오래된순' },
                  ]}
                  selectedSort={sort}
                  onSortChange={setSort}
                />
              </div>

              <TabsContent value="reading" className="mt-6">
                {paginatedJourneys.length > 0 ? (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedJourneys.map((journey) => (
                        <JourneyCard 
                          key={journey.id} 
                          journey={journey} 
                          onClick={handleJourneyClick}
                          onDelete={handleJourneyDelete}
                        />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination
                          currentPage={page}
                          totalPages={totalPages}
                          onPageChange={setPage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="독서 중인 책이 없습니다"
                    description="새로운 책으로 독서를 시작해보세요"
                    action={{
                      label: "도서 검색",
                      onClick: () => window.location.href = '/journey/new'
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {paginatedJourneys.length > 0 ? (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedJourneys.map((journey) => (
                        <JourneyCard 
                          key={journey.id} 
                          journey={journey} 
                          onClick={handleJourneyClick}
                          onDelete={handleJourneyDelete}
                        />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination
                          currentPage={page}
                          totalPages={totalPages}
                          onPageChange={setPage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="완독한 책이 없습니다"
                    description="책을 끝까지 읽고 완독 처리를 해보세요"
                  />
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/journey/new">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg"
        >
          <Plus className="h-8 w-8" />
          <span className="sr-only">새 여정 시작</span>
        </Button>
      </Link>
    </AppLayout>
  );
}
