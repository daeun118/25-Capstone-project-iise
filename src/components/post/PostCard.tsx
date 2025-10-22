'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user/UserAvatar';
import { InteractionBar } from './InteractionBar';
import { Star, Music, Play, BookOpen } from 'lucide-react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { PostDto } from '@/types/dto/post.dto';

interface PostCardProps {
  post: PostDto;
  onClick?: (post: PostDto) => void;
}

export const PostCard = memo(function PostCard({ post, onClick }: PostCardProps) {
  const handleCardClick = () => {
    onClick?.(post);
  };

  const handleCommentClick = () => {
    onClick?.(post);
  };

  return (
    <m.div
      className="card-elevated group cursor-pointer overflow-hidden"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
    >
      {/* Album Cover / Book Cover - Mureka Style */}
      <div className="relative aspect-square rounded-xl overflow-hidden">
        {post.journey.bookCoverUrl ? (
          <Image
            src={post.journey.bookCoverUrl}
            alt={post.journey.bookTitle}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-accent">
            <BookOpen className="w-20 h-20 text-white/60" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <m.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 60%)' }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Category Badge (top-left) */}
        {post.journey.bookCategory && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              className="bg-gradient-to-r from-primary to-primary-dark text-white border-0 shadow-lg"
            >
              {post.journey.bookCategory}
            </Badge>
          </div>
        )}

        {/* Music Badge (top-right) */}
        <div className="absolute top-3 right-3 z-10">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            <Music className="w-3 h-3" />
            <span>플레이리스트</span>
          </div>
        </div>

        {/* Play Button (center, appears on hover) */}
        <m.button
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={(e) => {
            e.stopPropagation();
            // Music play logic
          }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl bg-gradient-accent">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
        </m.button>

        {/* User Info (bottom-left, on hover) */}
        <m.div
          className="absolute bottom-4 left-4 z-10 flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UserAvatar user={post.user} size="sm" />
          <div>
            <Link
              href={`/users/${post.user.id}`}
              className="text-white font-semibold text-sm hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {post.user.nickname}
            </Link>
            <p className="text-xs text-white/80">
              {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </m.div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Book Title & Author */}
        <div className="mb-3">
          <h3 className="font-bold text-lg mb-1 line-clamp-2">{post.journey.bookTitle}</h3>
          <p className="text-sm text-gray-500">{post.journey.bookAuthor}</p>
        </div>

        {/* Rating */}
        {post.journey.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < post.journey.rating!
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-amber-600">{post.journey.rating}.0</span>
          </div>
        )}

        {/* One-liner */}
        {post.journey.oneLiner && (
          <div className="mb-3 p-3 rounded-lg" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
            <p className="text-sm font-medium italic line-clamp-2" style={{ color: '#6366f1' }}>
              "{post.journey.oneLiner}"
            </p>
          </div>
        )}

        {/* Review Preview */}
        {post.journey.review && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {post.journey.review}
          </p>
        )}

        {/* Interaction Bar */}
        <div onClick={(e) => e.stopPropagation()}>
          <InteractionBar
            postId={post.id}
            initialLikes={post.likesCount}
            initialComments={post.commentsCount}
            initialBookmarks={post.bookmarksCount}
            initialIsLiked={post.isLiked}
            initialIsBookmarked={post.isBookmarked}
            onCommentClick={handleCommentClick}
          />
        </div>
      </div>
    </m.div>
  );
});
