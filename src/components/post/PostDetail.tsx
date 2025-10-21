'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user/UserAvatar';
import { InteractionBar } from './InteractionBar';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { BookCover } from '@/components/book/BookCover';
import { Playlist } from '@/components/music/Playlist';
import { Star, Calendar, Music } from 'lucide-react';
import { useState } from 'react';

interface MusicTrack {
  id: string;
  version: number;
  logType: string;
  title: string;
  fileUrl: string;
  prompt?: string;
  genre?: string;
  mood?: string;
  tempo?: number;
  duration?: number;
  description?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    email: string;
  };
}

interface PostDetailProps {
  post: {
    id: string;
    user: {
      id: string;
      nickname: string;
      email: string;
    };
    journey: {
      id: string;
      bookTitle: string;
      bookAuthor: string;
      bookCoverUrl?: string;
      bookCategory?: string;
      bookDescription?: string;
      rating?: number;
      oneLiner?: string;
      review?: string;
      completedAt?: string;
    };
    albumCoverUrl?: string | null;
    likesCount: number;
    commentsCount: number;
    bookmarksCount: number;
    isLiked: boolean;
    isBookmarked: boolean;
    createdAt: string;
    playlist: MusicTrack[];
    comments: Comment[];
  };
  currentUserId?: string;
}

export function PostDetail({
  post,
  currentUserId,
}: PostDetailProps) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments);

  const handleTrackSelect = (trackId: string) => {
    setCurrentTrackId(trackId);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleComment = () => {
    // Scroll to comments section
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Main Post */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <UserAvatar user={post.user} size="md" />
            <div className="flex-1">
              <p className="font-semibold">{post.user.nickname}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Book Info */}
          <div className="flex gap-6">
            <BookCover 
              src={post.journey.bookCoverUrl} 
              alt={post.journey.bookTitle} 
              size="xl" 
            />
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{post.journey.bookTitle}</h1>
                <p className="text-lg text-muted-foreground">{post.journey.bookAuthor}</p>
                {post.journey.bookCategory && (
                  <Badge variant="secondary" className="mt-2">
                    {post.journey.bookCategory}
                  </Badge>
                )}
              </div>

              {/* Rating */}
              {post.journey.rating && (
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < post.journey.rating!
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-bold text-amber-600">
                    {post.journey.rating}/5
                  </span>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.journey.completedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      완독: {new Date(post.journey.completedAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}
                {post.playlist.length > 0 && (
                  <Badge variant="secondary">
                    <Music className="w-3 h-3 mr-1" />
                    {post.playlist.length}곡
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Review */}
          <div className="space-y-4">
            {post.journey.oneLiner && (
              <div className="border-l-4 border-primary pl-4 py-2 bg-primary-50/50 rounded-r-lg">
                <p className="text-lg font-semibold text-primary-900 italic">
                  "{post.journey.oneLiner}"
                </p>
              </div>
            )}
            
            {post.journey.review && (
              <div className="prose max-w-none">
                <p className="text-base whitespace-pre-wrap leading-relaxed">
                  {post.journey.review}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <InteractionBar
            postId={post.id}
            initialLikes={post.likesCount}
            initialComments={comments.length}
            initialBookmarks={post.bookmarksCount}
            initialIsLiked={post.isLiked}
            initialIsBookmarked={post.isBookmarked}
            onCommentClick={handleComment}
          />
        </CardFooter>
      </Card>

      {/* Playlist */}
      {post.playlist.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Music className="w-5 h-5" />
              독서 플레이리스트
            </h3>
          </CardHeader>
          <CardContent>
            <Playlist
              tracks={post.playlist.map(track => ({
                id: track.id,
                version: track.version.toString(),
                title: track.title,
                url: track.fileUrl,
                genre: track.genre,
                mood: track.mood,
                duration: track.duration,
              }))}
              currentTrackId={currentTrackId || undefined}
              isPlaying={isPlaying}
              onTrackSelect={handleTrackSelect}
              onPlayPause={handlePlayPause}
            />
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card id="comments">
        <CardHeader>
          <h3 className="font-semibold">댓글 {comments.length}개</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <CommentForm 
            postId={post.id} 
            onCommentAdded={(newComment) => {
              setComments([...comments, newComment]);
            }}
          />
          {comments.length > 0 && (
            <>
              <Separator />
              <CommentList
                postId={post.id}
                comments={comments}
                currentUserId={currentUserId}
                onCommentDeleted={(commentId) => {
                  setComments(comments.filter(c => c.id !== commentId));
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
