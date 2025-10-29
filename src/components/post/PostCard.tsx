'use client';

import { memo, useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  const handleCommentClick = () => {
    onClick?.(post);
  };

  return (
    <div
      className="card-elevated group overflow-hidden hover-lift-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Album Cover / Book Cover - Suno Style (2:3 세로형) */}
      <Link 
        href={`/journey/${post.journey.id}`}
        className="relative aspect-[2/3] rounded-xl overflow-hidden block"
      >
        {post.journey.bookCoverUrl ? (
          <Image
            src={post.journey.bookCoverUrl}
            alt={post.journey.bookTitle}
            fill
            quality={85}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-accent">
            <BookOpen className="w-20 h-20 text-white/60" />
          </div>
        )}

        {/* ✅ Suno 스타일: 하단에서 위로 올라오는 그라데이션 */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 40%, transparent 70%)' }}
        />

        {/* Category Badge (top-left) */}
        {post.journey.bookCategory && (
          <div className="absolute z-10" style={{ top: 'var(--spacing-sm)', left: 'var(--spacing-sm)' }}>
            <Badge
              className="bg-gradient-to-r from-primary to-primary-dark text-white border-0 shadow-lg"
            >
              {post.journey.bookCategory}
            </Badge>
          </div>
        )}

        {/* Music Badge (top-right) */}
        <div className="absolute z-10" style={{ top: 'var(--spacing-sm)', right: 'var(--spacing-sm)' }}>
          <div
            className="flex items-center rounded-full text-white text-xs font-medium shadow-lg bg-gradient-warm"
            style={{ gap: 'var(--spacing-xs)', paddingLeft: 'var(--spacing-sm)', paddingRight: 'var(--spacing-sm)', paddingTop: 'var(--spacing-xs)', paddingBottom: 'var(--spacing-xs)' }}
          >
            <Music className="w-3 h-3" />
            <span>플레이리스트</span>
          </div>
        </div>

        {/* ✅ Suno 스타일: 중앙 대형 재생 버튼 (56px) */}
        <button
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          } active:scale-95 bg-white/90 backdrop-blur-sm`}
          onClick={(e) => {
            e.stopPropagation();
            // Music play logic
          }}
        >
          <Play className="w-7 h-7 text-gray-900 ml-0.5" />
        </button>

        {/* ✅ Suno 스타일: 호버 시 하단 유저 정보 슬라이드 업 */}
        <div
          className={`absolute z-10 flex items-center transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{ bottom: 'var(--spacing-sm)', left: 'var(--spacing-sm)', gap: 'var(--spacing-xs)' }}
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
            <p className="text-xs text-white/90">
              {new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </Link>

      {/* Content Section - Suno 스타일: 최소한의 정보 */}
      <div style={{ padding: 'var(--spacing-sm)' }}>
        {/* Book Title - 1줄만 */}
        <Link 
          href={`/journey/${post.journey.id}`}
          className="block group/title hover:opacity-80 transition-opacity"
          style={{ marginBottom: 'var(--spacing-xs)' }}
        >
          <h3 className="font-bold text-base line-clamp-1 group-hover/title:text-primary transition-colors">
            {post.journey.bookTitle}
          </h3>
        </Link>

        {/* 메타데이터 압축: 저자 · 별점 (한 줄) */}
        <div className="flex items-center text-xs text-muted-foreground" style={{ gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
          <span className="line-clamp-1 flex-shrink">{post.journey.bookAuthor}</span>
          {post.journey.rating && (
            <>
              <span>·</span>
              <span className="flex items-center" style={{ gap: '2px' }}>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {post.journey.rating}.0
              </span>
            </>
          )}
        </div>

        {/* Interaction Bar - 간소화 */}
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
    </div>
  );
});
