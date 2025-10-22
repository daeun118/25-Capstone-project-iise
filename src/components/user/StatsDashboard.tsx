'use client';

import { useEffect, useState } from 'react';
import { Book, Music, FileText, Heart, MessageSquare, Bookmark, Star, Tag } from 'lucide-react';
import { m } from 'framer-motion';
import { StatsCard } from '@/components/common/StatsCard';
import { StatsCardSkeleton } from '@/components/common/StatsCardSkeleton';

interface Stats {
  journeys: {
    total: number;
    reading: number;
    completed: number;
  };
  content: {
    totalMusicTracks: number;
    totalReadingLogs: number;
    postsPublished: number;
  };
  engagement: {
    likesReceived: number;
    commentsReceived: number;
    bookmarksSaved: number;
  };
  insights: {
    averageRating: number;
    favoriteCategory: string | null;
  };
}

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Journey Stats Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <StatsCardSkeleton key={`journey-${i}`} delay={i * 0.05} />
            ))}
          </div>
        </div>
        {/* Content Stats Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <StatsCardSkeleton key={`content-${i}`} delay={i * 0.05} />
            ))}
          </div>
        </div>
        {/* Engagement Stats Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <StatsCardSkeleton key={`engagement-${i}`} delay={i * 0.05} />
            ))}
          </div>
        </div>
        {/* Insights Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <StatsCardSkeleton key={`insights-${i}`} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Journey Stats */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-accent">
            <Book className="w-4 h-4 text-white" />
          </div>
          독서 여정
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            label="전체 여정"
            value={stats.journeys.total}
            description="시작한 모든 여정"
            icon={Book}
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            delay={0.1}
          />
          <StatsCard
            label="읽는 중"
            value={stats.journeys.reading}
            description="진행 중인 여정"
            icon={Book}
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            delay={0.15}
          />
          <StatsCard
            label="완독"
            value={stats.journeys.completed}
            description="완료한 여정"
            icon={Book}
            gradient="linear-gradient(135deg, #10b981, #059669)"
            delay={0.2}
          />
        </div>
      </m.div>

      {/* Content Stats */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
            <FileText className="w-4 h-4 text-white" />
          </div>
          생성한 콘텐츠
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            label="음악 트랙"
            value={stats.content.totalMusicTracks}
            description="생성된 음악"
            icon={Music}
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            delay={0.3}
          />
          <StatsCard
            label="독서 기록"
            value={stats.content.totalReadingLogs}
            description="작성한 기록"
            icon={FileText}
            gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
            delay={0.35}
          />
          <StatsCard
            label="게시물"
            value={stats.content.postsPublished}
            description="공유한 여정"
            icon={FileText}
            gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            delay={0.4}
          />
        </div>
      </m.div>

      {/* Engagement Stats */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#ec4899' }}>
            <Heart className="w-4 h-4 text-white" />
          </div>
          커뮤니티 활동
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            label="받은 좋아요"
            value={stats.engagement.likesReceived}
            description="내 게시물 좋아요"
            icon={Heart}
            gradient="linear-gradient(135deg, #ec4899, #db2777)"
            delay={0.5}
          />
          <StatsCard
            label="받은 댓글"
            value={stats.engagement.commentsReceived}
            description="내 게시물 댓글"
            icon={MessageSquare}
            gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
            delay={0.55}
          />
          <StatsCard
            label="보관함"
            value={stats.engagement.bookmarksSaved}
            description="스크랩한 게시물"
            icon={Bookmark}
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            delay={0.6}
          />
        </div>
      </m.div>

      {/* Insights */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b' }}>
            <Star className="w-4 h-4 text-white" />
          </div>
          독서 인사이트
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <StatsCard
            label="평균 별점"
            value={stats.insights.averageRating > 0 ? stats.insights.averageRating.toFixed(1) : '-'}
            description="완독한 책의 평균 평점"
            icon={Star}
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            delay={0.7}
          />
          <StatsCard
            label="선호 카테고리"
            value={stats.insights.favoriteCategory || '-'}
            description="가장 많이 읽은 장르"
            icon={Tag}
            gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            delay={0.75}
          />
        </div>
      </m.div>
    </div>
  );
}
