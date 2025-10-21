import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/posts/[id]/like - Like a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, likes_count')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked this post' },
        { status: 409 }
      );
    }

    // Create like
    const { data: like, error: likeError } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    if (likeError) {
      console.error('Error creating like:', likeError);
      return NextResponse.json(
        { error: 'Failed to like post' },
        { status: 500 }
      );
    }

    // Increment likes_count
    const newLikesCount = (post.likes_count || 0) + 1;
    const { error: updateError } = await supabase
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating likes count:', updateError);
    }

    return NextResponse.json({ 
      like,
      likesCount: newLikesCount 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/like - Unlike a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current post likes count
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    // Delete like
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting like:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unlike post' },
        { status: 500 }
      );
    }

    // Decrement likes_count
    const newLikesCount = Math.max(0, (post?.likes_count || 1) - 1);
    const { error: updateError } = await supabase
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating likes count:', updateError);
    }

    return NextResponse.json({ 
      success: true,
      likesCount: newLikesCount 
    }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
