'use client';

import { useEffect, useState } from 'react';
import { Book, Music, FileText, Heart, MessageSquare, Bookmark, Star, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="card-elevated rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Journey Stats */}
      <motion.div
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
          {/* Total Journeys */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">전체 여정</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-hero"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Book className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              {stats.journeys.total}
            </motion.div>
            <p className="text-sm text-gray-500">시작한 모든 여정</p>
          </motion.div>

          {/* Reading Journeys */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">읽는 중</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-accent"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Book className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
            >
              {stats.journeys.reading}
            </motion.div>
            <p className="text-sm text-gray-500">진행 중인 여정</p>
          </motion.div>

          {/* Completed Journeys */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">완독</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Book className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              {stats.journeys.completed}
            </motion.div>
            <p className="text-sm text-gray-500">완료한 여정</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Stats */}
      <motion.div
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
          {/* Music Tracks */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">음악 트랙</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Music className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              {stats.content.totalMusicTracks}
            </motion.div>
            <p className="text-sm text-gray-500">생성된 음악</p>
          </motion.div>

          {/* Reading Logs */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">독서 기록</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
            >
              {stats.content.totalReadingLogs}
            </motion.div>
            <p className="text-sm text-gray-500">작성한 기록</p>
          </motion.div>

          {/* Posts Published */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">게시물</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            >
              {stats.content.postsPublished}
            </motion.div>
            <p className="text-sm text-gray-500">공유한 여정</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Engagement Stats */}
      <motion.div
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
          {/* Likes Received */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">받은 좋아요</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Heart className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            >
              {stats.engagement.likesReceived}
            </motion.div>
            <p className="text-sm text-gray-500">내 게시물 좋아요</p>
          </motion.div>

          {/* Comments Received */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">받은 댓글</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.75, type: 'spring', stiffness: 200 }}
            >
              {stats.engagement.commentsReceived}
            </motion.div>
            <p className="text-sm text-gray-500">내 게시물 댓글</p>
          </motion.div>

          {/* Bookmarks Saved */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">보관함</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Bookmark className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
            >
              {stats.engagement.bookmarksSaved}
            </motion.div>
            <p className="text-sm text-gray-500">스크랩한 게시물</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
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
          {/* Average Rating */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">평균 별점</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Star className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            >
              {stats.insights.averageRating > 0 
                ? stats.insights.averageRating.toFixed(1)
                : '-'}
            </motion.div>
            <p className="text-sm text-gray-500">완독한 책의 평균 평점</p>
          </motion.div>

          {/* Favorite Category */}
          <motion.div
            className="card-elevated rounded-xl p-6 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">선호 카테고리</span>
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Tag className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <motion.div
              className="text-4xl font-bold mb-2 truncate"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.95, type: 'spring', stiffness: 200 }}
            >
              {stats.insights.favoriteCategory || '-'}
            </motion.div>
            <p className="text-sm text-gray-500">가장 많이 읽은 장르</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
