'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

interface InteractionBarProps {
  postId: string;
  initialLikes: number;
  initialComments: number;
  initialBookmarks: number;
  initialIsLiked: boolean;
  initialIsBookmarked: boolean;
  onCommentClick?: () => void;
}

export function InteractionBar({
  postId,
  initialLikes,
  initialComments,
  initialBookmarks,
  initialIsLiked,
  initialIsBookmarked,
  onCommentClick,
}: InteractionBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousState = { isLiked, likes };

    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      const endpoint = `/api/posts/${postId}/like`;
      const response = await fetch(endpoint, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();
      setLikes(data.likesCount);
    } catch (error) {
      // Revert on error
      setIsLiked(previousState.isLiked);
      setLikes(previousState.likes);
      toast.error('좋아요 처리에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousState = { isBookmarked, bookmarks };

    // Optimistic update
    setIsBookmarked(!isBookmarked);
    setBookmarks(isBookmarked ? bookmarks - 1 : bookmarks + 1);

    try {
      const endpoint = `/api/posts/${postId}/bookmark`;
      const response = await fetch(endpoint, {
        method: isBookmarked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      const data = await response.json();
      setBookmarks(data.bookmarksCount);
      toast.success(isBookmarked ? '스크랩을 취소했습니다' : '스크랩했습니다');
    } catch (error) {
      // Revert on error
      setIsBookmarked(previousState.isBookmarked);
      setBookmarks(previousState.bookmarks);
      toast.error('스크랩 처리에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={isLiked ? 'text-red-500' : ''}
      >
        <Heart className={`size-4 ${isLiked ? 'fill-current' : ''}`} />
        <span className="ml-1">{likes}</span>
      </Button>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCommentClick}
      >
        <MessageSquare className="size-4" />
        <span className="ml-1">{comments}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
        disabled={isLoading}
        className={isBookmarked ? 'text-primary' : ''}
      >
        <Bookmark className={`size-4 ${isBookmarked ? 'fill-current' : ''}`} />
        <span className="ml-1">{bookmarks}</span>
      </Button>
    </div>
  );
}
