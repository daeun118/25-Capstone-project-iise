'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/post/PostCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  albumCoverUrl: string | null;
  albumCoverThumbnailUrl: string | null;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
    email: string;
  };
  journey: {
    id: string;
    bookIsbn: string | null;
    bookTitle: string;
    bookAuthor: string | null;
    bookCoverUrl: string | null;
    bookCategory: string | null;
    rating: number | null;
    oneLiner: string | null;
  };
}

interface BookmarkData {
  bookmarkId: string;
  bookmarkedAt: string;
  post: Post;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const limit = 12;

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async (loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const currentOffset = loadMore ? offset : 0;
      const response = await fetch(
        `/api/user/bookmarks?sort=latest&limit=${limit}&offset=${currentOffset}`
      );
      const data = await response.json();

      if (response.ok) {
        if (loadMore) {
          setBookmarks((prev) => [...prev, ...data.bookmarks]);
        } else {
          setBookmarks(data.bookmarks);
        }
        setHasMore(data.pagination.hasMore);
        setOffset(currentOffset + limit);
      } else {
        toast.error(data.error || '보관함을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast.error('보관함을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchBookmarks(true);
  };

  const handlePostClick = (post: Post) => {
    router.push(`/feed/${post.id}`);
  };

  const handleBookmarkRemoved = (postId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.post.id !== postId));
    toast.success('보관함에서 제거되었습니다');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Bookmark className="h-8 w-8" />
                보관함
              </h1>
              <p className="text-muted-foreground mt-1">
                스크랩한 게시물 {bookmarks.length}개
              </p>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : bookmarks.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="보관함이 비어있습니다"
              description="게시물을 스크랩하면 여기에 표시됩니다"
              action={{
                label: '게시판 둘러보기',
                onClick: () => router.push('/feed'),
              }}
            />
          ) : (
            <>
              {/* Bookmarks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <PostCard
                    key={bookmark.bookmarkId}
                    post={bookmark.post}
                    onClick={handlePostClick}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? '불러오는 중...' : '더 보기'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
