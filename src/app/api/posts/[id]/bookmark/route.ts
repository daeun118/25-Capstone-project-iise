import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/posts/[id]/bookmark - Bookmark a post
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
      .select('id, bookmarks_count')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user already bookmarked this post
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Already bookmarked this post' },
        { status: 409 }
      );
    }

    // Create bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    if (bookmarkError) {
      console.error('Error creating bookmark:', bookmarkError);
      return NextResponse.json(
        { error: 'Failed to bookmark post' },
        { status: 500 }
      );
    }

    // Increment bookmarks_count
    const newBookmarksCount = (post.bookmarks_count || 0) + 1;
    const { error: updateError } = await supabase
      .from('posts')
      .update({ bookmarks_count: newBookmarksCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating bookmarks count:', updateError);
    }

    return NextResponse.json({ 
      bookmark,
      bookmarksCount: newBookmarksCount 
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]/bookmark - Remove bookmark from a post
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

    // Get current post bookmarks count
    const { data: post } = await supabase
      .from('posts')
      .select('bookmarks_count')
      .eq('id', postId)
      .single();

    // Delete bookmark
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting bookmark:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove bookmark' },
        { status: 500 }
      );
    }

    // Decrement bookmarks_count
    const newBookmarksCount = Math.max(0, (post?.bookmarks_count || 1) - 1);
    const { error: updateError } = await supabase
      .from('posts')
      .update({ bookmarks_count: newBookmarksCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating bookmarks count:', updateError);
    }

    return NextResponse.json({ 
      success: true,
      bookmarksCount: newBookmarksCount 
    }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]/bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
