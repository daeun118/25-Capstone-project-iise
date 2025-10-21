'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Badge } from '@/components/ui/badge';

interface SameBookPost {
  id: string;
  user: {
    id: string;
    nickname: string;
    email: string;
  };
  journey: {
    bookTitle: string;
    rating?: number;
    oneLiner?: string;
  };
  likesCount: number;
  createdAt: string;
}

interface SameBookPostsProps {
  bookIsbn: string;
  currentPostId: string;
  limit?: number;
}

export function SameBookPosts({ bookIsbn, currentPostId, limit = 5 }: SameBookPostsProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<SameBookPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSameBookPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        
        // Filter posts with same ISBN and exclude current post
        const samePosts = data.posts.filter(
          (post: any) => 
            post.journey.bookIsbn === bookIsbn && 
            post.id !== currentPostId
        );
        
        setPosts(samePosts);
      } catch (error) {
        console.error('Error fetching same book posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSameBookPosts();
  }, [bookIsbn, currentPostId, limit]);

  const handlePostClick = (postId: string) => {
    router.push(`/feed/${postId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            같은 책의 다른 여정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            같은 책의 다른 여정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="아직 이 책에 대한 다른 게시물이 없습니다"
            description="첫 번째 독서 여정을 공유하신 것을 축하합니다!"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          같은 책의 다른 여정 ({posts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePostClick(post.id)}
            >
              <CardContent className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar 
                    user={post.user} 
                    size="sm" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {post.user.nickname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>

                {/* Rating */}
                {post.journey.rating && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      ⭐ {post.journey.rating}/5
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ❤️ {post.likesCount}
                    </Badge>
                  </div>
                )}

                {/* One-liner */}
                {post.journey.oneLiner && (
                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                    "{post.journey.oneLiner}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {posts.length >= limit && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/feed?category=all')}
            >
              더 많은 게시물 보기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
