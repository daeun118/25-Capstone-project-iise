import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/posts - Create a new post from completed journey
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { journeyId, albumCoverUrl } = body;

    if (!journeyId) {
      return NextResponse.json(
        { error: 'journeyId is required' },
        { status: 400 }
      );
    }

    // Verify the journey exists, is completed, and belongs to the user
    const { data: journey, error: journeyError } = await supabase
      .from('reading_journeys')
      .select('id, status, user_id')
      .eq('id', journeyId)
      .eq('user_id', user.id)
      .single();

    if (journeyError || !journey) {
      return NextResponse.json(
        { error: 'Journey not found' },
        { status: 404 }
      );
    }

    if (journey.status !== 'completed') {
      return NextResponse.json(
        { error: 'Journey must be completed before posting' },
        { status: 400 }
      );
    }

    // Check if a post already exists for this journey
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('journey_id', journeyId)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: 'Post already exists for this journey' },
        { status: 409 }
      );
    }

    // Create the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        journey_id: journeyId,
        user_id: user.id,
        album_cover_url: albumCoverUrl || null,
        is_published: true,
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/posts - List posts with filtering and sorting
// ✅ UPDATED: Authentication is now OPTIONAL for reading posts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'latest'; // latest | popular
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('posts')
      .select(`
        id,
        album_cover_url,
        album_cover_thumbnail_url,
        likes_count,
        comments_count,
        bookmarks_count,
        created_at,
        user_id,
        users!inner (
          id,
          nickname,
          email
        ),
        reading_journeys!inner (
          id,
          book_title,
          book_author,
          book_cover_url,
          book_category,
          rating,
          one_liner,
          review
        )
      `)
      .eq('is_published', true);

    // Filter by category
    if (category !== 'all') {
      query = query.eq('reading_journeys.book_category', category);
    }

    // Sort
    if (sort === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Get current user to check if they liked/bookmarked posts
    // ✅ UPDATED: User may be null for unauthenticated requests
    const { data: { user } } = await supabase.auth.getUser();

    // Transform data to match PostCard interface
    // ✅ UPDATED: Only check likes/bookmarks for authenticated users
    const transformedPosts = await Promise.all(
      (posts || []).map(async (post: any) => {
        let isLiked = false;
        let isBookmarked = false;

        if (user) {
          // Check if user liked this post (only if authenticated)
          const { data: like } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();

          isLiked = !!like;

          // Check if user bookmarked this post
          const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();

          isBookmarked = !!bookmark;
        }

        return {
          id: post.id,
          user: {
            id: post.users.id,
            nickname: post.users.nickname,
            email: post.users.email,
          },
          journey: {
            id: post.reading_journeys.id,
            bookTitle: post.reading_journeys.book_title,
            bookAuthor: post.reading_journeys.book_author,
            bookCoverUrl: post.reading_journeys.book_cover_url,
            bookCategory: post.reading_journeys.book_category,
            rating: post.reading_journeys.rating,
            oneLiner: post.reading_journeys.one_liner,
            review: post.reading_journeys.review,
          },
          albumCoverUrl: post.album_cover_url,
          likesCount: post.likes_count || 0,
          commentsCount: post.comments_count || 0,
          bookmarksCount: post.bookmarks_count || 0,
          isLiked,
          isBookmarked,
          createdAt: post.created_at,
        };
      })
    );

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
