'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user/UserAvatar';
import { MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/common/EmptyState';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    email: string;
    avatarUrl?: string;
  };
}

interface CommentListProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  onCommentDeleted?: (commentId: string) => void;
}

export function CommentList({
  postId,
  comments,
  currentUserId,
  onCommentDeleted,
}: CommentListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (commentId: string) => {
    setDeletingCommentId(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCommentId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments/${deletingCommentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      toast.success('댓글이 삭제되었습니다');
      setDeleteDialogOpen(false);
      
      if (onCommentDeleted) {
        onCommentDeleted(deletingCommentId);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('댓글 삭제에 실패했습니다');
    } finally {
      setIsDeleting(false);
      setDeletingCommentId(null);
    }
  };
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="댓글이 없습니다"
        description="첫 댓글을 작성해보세요"
      />
    );
  }

  return (
    <>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="댓글 삭제"
        description="정말 이 댓글을 삭제하시겠습니까?"
        variant="destructive"
        confirmText="삭제"
        onConfirm={handleDeleteConfirm}
      />

      <div className="space-y-4">
      {comments.map((comment) => {
        const isAuthor = currentUserId === comment.user.id;

        return (
          <div key={comment.id} className="flex gap-3">
            <UserAvatar user={comment.user} size="sm" />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{comment.user.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <p className="text-sm mt-2">{comment.content}</p>
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}
