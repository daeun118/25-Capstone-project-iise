import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE /api/posts/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: postId, commentId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if comment exists and belongs to user
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, user_id, post_id')
      .eq('id', commentId)
      .eq('post_id', postId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Get current post comments count
    const { data: post } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    // Delete comment
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    // Decrement comments_count
    const newCommentsCount = Math.max(0, (post?.comments_count || 1) - 1);
    const { error: updateError } = await supabase
      .from('posts')
      .update({ comments_count: newCommentsCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating comments count:', updateError);
    }

    return NextResponse.json({ 
      success: true,
      commentsCount: newCommentsCount 
    }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]/comments/[commentId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
