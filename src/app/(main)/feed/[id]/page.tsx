'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { PostDetail } from '@/components/post/PostDetail';
import { SameBookPosts } from '@/components/post/SameBookPosts';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PostDetailDto } from '@/types/dto/post.dto';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch post detail
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('게시물을 찾을 수 없습니다.');
            router.push('/feed');
            return;
          }
          throw new Error('Failed to fetch post');
        }

        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('게시물을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, router]);

  const handleLike = async () => {
    // Phase 9 will implement this
    toast.info('좋아요 기능은 Phase 9에서 구현됩니다.');
  };

  const handleBookmark = async () => {
    // Phase 9 will implement this
    toast.info('스크랩 기능은 Phase 9에서 구현됩니다.');
  };

  const handleCommentSubmit = async (content: string) => {
    // Phase 9 will implement this
    toast.info('댓글 작성 기능은 Phase 9에서 구현됩니다.');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" text="게시물을 불러오는 중..." />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">게시물을 찾을 수 없습니다.</p>
            <Button onClick={() => router.push('/feed')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              피드로 돌아가기
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로 가기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <PostDetail
              post={post}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {post.journey.bookIsbn && (
              <SameBookPosts
                bookIsbn={post.journey.bookIsbn}
                currentPostId={post.id}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
