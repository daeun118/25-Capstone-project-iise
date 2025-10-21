'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostCard } from '@/components/post/PostCard';
import { FilterBar } from '@/components/common/FilterBar';
import { Pagination } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  user: {
    id: string;
    nickname: string;
    email: string;
    avatarUrl?: string;
  };
  journey: {
    id: string;
    bookTitle: string;
    bookAuthor: string;
    bookCoverUrl?: string;
    bookCategory?: string;
    rating?: number;
    oneLiner?: string;
    review?: string;
  };
  albumCoverUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: '소설', label: '소설' },
  { value: '시/에세이', label: '시/에세이' },
  { value: '인문', label: '인문' },
  { value: '자기계발', label: '자기계발' },
  { value: '비즈니스', label: '비즈니스' },
  { value: '과학', label: '과학' },
  { value: '역사', label: '역사' },
  { value: '예술', label: '예술' },
  { value: '기타', label: '기타' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
];

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
  });

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category,
        sort,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('게시물을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [category, sort, pagination.page]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostClick = (post: Post) => {
    router.push(`/feed/${post.id}`);
  };

  const handleLike = async (postId: string) => {
    // Phase 9 will implement this
    toast.info('좋아요 기능은 Phase 9에서 구현됩니다.');
  };

  const handleComment = (postId: string) => {
    router.push(`/feed/${postId}#comments`);
  };

  const handleBookmark = async (postId: string) => {
    // Phase 9 will implement this
    toast.info('스크랩 기능은 Phase 9에서 구현됩니다.');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">독서 여정 피드</h1>
          <p className="text-muted-foreground">
            다른 사람들의 독서 여정을 둘러보고 음악을 감상해보세요.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            categories={CATEGORIES}
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            sortOptions={SORT_OPTIONS}
            selectedSort={sort}
            onSortChange={handleSortChange}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" text="게시물을 불러오는 중..." />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="게시물이 없습니다"
            description={
              category === 'all'
                ? '아직 공유된 독서 여정이 없습니다.'
                : '이 카테고리에는 게시물이 없습니다.'
            }
          />
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={handlePostClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
