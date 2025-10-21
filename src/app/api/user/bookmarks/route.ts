import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/bookmarks
 * Get current user's bookmarked posts
 * Query params:
 *   - sort: 'latest' | 'oldest' (default: 'latest')
 *   - limit: number (default: 20)
 *   - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'latest';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('bookmarks')
      .select(
        `
        id,
        created_at,
        posts!inner (
          id,
          album_cover_url,
          album_cover_thumbnail_url,
          likes_count,
          comments_count,
          bookmarks_count,
          created_at,
          users!inner (
            id,
            nickname,
            email
          ),
          reading_journeys!inner (
            id,
            book_isbn,
            book_title,
            book_author,
            book_cover_url,
            book_category,
            rating,
            one_liner
          )
        )
      `
      )
      .eq('user_id', user.id);

    // Apply sorting
    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookmarks, error: bookmarksError } = await query;

    if (bookmarksError) {
      console.error('Bookmarks fetch error:', bookmarksError);
      return NextResponse.json(
        { error: 'Failed to fetch bookmarks' },
        { status: 500 }
      );
    }

    // Transform data to flatten structure
    const transformedBookmarks = bookmarks.map((bookmark: any) => ({
      bookmarkId: bookmark.id,
      bookmarkedAt: bookmark.created_at,
      post: {
        id: bookmark.posts.id,
        albumCoverUrl: bookmark.posts.album_cover_url,
        albumCoverThumbnailUrl: bookmark.posts.album_cover_thumbnail_url,
        likesCount: bookmark.posts.likes_count,
        commentsCount: bookmark.posts.comments_count,
        bookmarksCount: bookmark.posts.bookmarks_count,
        createdAt: bookmark.posts.created_at,
        author: {
          id: bookmark.posts.users.id,
          nickname: bookmark.posts.users.nickname,
          email: bookmark.posts.users.email,
        },
        journey: {
          id: bookmark.posts.reading_journeys.id,
          bookIsbn: bookmark.posts.reading_journeys.book_isbn,
          bookTitle: bookmark.posts.reading_journeys.book_title,
          bookAuthor: bookmark.posts.reading_journeys.book_author,
          bookCoverUrl: bookmark.posts.reading_journeys.book_cover_url,
          bookCategory: bookmark.posts.reading_journeys.book_category,
          rating: bookmark.posts.reading_journeys.rating,
          oneLiner: bookmark.posts.reading_journeys.one_liner,
        },
      },
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json(
      {
        bookmarks: transformedBookmarks,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: count ? offset + limit < count : false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
