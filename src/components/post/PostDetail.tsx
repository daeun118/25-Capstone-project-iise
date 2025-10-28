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
import { MusicPlayerBar } from '@/components/music/MusicPlayerBar';
import { Star, Calendar, Music } from 'lucide-react';
import { useState } from 'react';
import { PostDetailDto, CommentDto } from '@/types/dto/post.dto';

interface PostDetailProps {
  post: PostDetailDto;
  currentUserId?: string;
}

interface MusicTrack {
  id: string;
  version: string;
  title: string;
  fileUrl: string;
  genre: string | null;
  mood: string | null;
  duration: number | null;
}

export function PostDetail({
  post,
  currentUserId,
}: PostDetailProps) {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [comments, setComments] = useState<CommentDto[]>(post.comments);

  const handlePlayMusic = (track: MusicTrack) => {
    setCurrentTrack(track);
  };

  const handleClosePlayer = () => {
    setCurrentTrack(null);
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
              currentTrackId={currentTrack?.id}
              isPlaying={!!currentTrack}
              onTrackSelect={(trackId) => {
                const track = post.playlist.find(t => t.id === trackId);
                if (track) {
                  handlePlayMusic({
                    id: track.id,
                    version: track.version.toString(),
                    title: track.title,
                    fileUrl: track.fileUrl,
                    genre: track.genre ?? null,
                    mood: track.mood ?? null,
                    duration: track.duration ?? null,
                  });
                }
              }}
              onPlayPause={() => {
                if (currentTrack) {
                  // Dispatch custom event to control the MusicPlayerBar
                  window.dispatchEvent(new CustomEvent('togglePlayPause'));
                }
              }}
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

      {/* Music Player Bar */}
      {currentTrack && (
        <MusicPlayerBar
          trackUrl={currentTrack.fileUrl}
          trackTitle={`${post.journey.bookTitle} - ${currentTrack.title}`}
          trackVersion={currentTrack.version}
          bookCoverUrl={post.journey.bookCoverUrl ?? undefined}
          genre={currentTrack.genre ?? undefined}
          mood={currentTrack.mood ?? undefined}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}
