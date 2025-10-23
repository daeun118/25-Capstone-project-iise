import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/stats
 * Get current user's reading statistics
 *
 * Performance optimized: Reduced from 13 sequential queries to 5-6 parallel queries
 * - Uses Promise.all for parallel execution
 * - Combines related queries to minimize database round trips
 * - Leverages database indexes (idx_reading_journeys_user_stats, etc.)
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

    // ============================================
    // PHASE 1: Fetch base data in parallel
    // ============================================
    const [journeysResult, userPostsResult, bookmarksResult] = await Promise.all([
      // Get all journeys with status, rating, category in one query
      // Uses idx_reading_journeys_user_stats (INCLUDE book_category, rating)
      supabase
        .from('reading_journeys')
        .select('id, status, rating, book_category')
        .eq('user_id', user.id),

      // Get user's post IDs for engagement stats
      // Uses idx_posts_user_stats
      supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id),

      // Get bookmarks count
      // Uses idx_bookmarks_user_created
      supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    const journeys = journeysResult.data || [];
    const userPosts = userPostsResult.data || [];
    const bookmarksCount = bookmarksResult.count || 0;

    // ============================================
    // PHASE 2: Calculate journey statistics
    // (No additional queries - all done in JavaScript)
    // ============================================
    const totalJourneys = journeys.length;
    const readingCount = journeys.filter((j) => j.status === 'reading').length;
    const completedCount = journeys.filter((j) => j.status === 'completed').length;

    // Calculate average rating
    const completedJourneysWithRating = journeys.filter(
      (j) => j.status === 'completed' && j.rating !== null
    );
    const averageRating = completedJourneysWithRating.length > 0
      ? completedJourneysWithRating.reduce((sum, j) => sum + (j.rating || 0), 0) /
        completedJourneysWithRating.length
      : 0;

    // Calculate favorite category
    const categoryCounts: { [key: string]: number } = {};
    journeys.forEach((j) => {
      if (j.book_category) {
        categoryCounts[j.book_category] = (categoryCounts[j.book_category] || 0) + 1;
      }
    });
    const favoriteCategory = Object.keys(categoryCounts).length > 0
      ? Object.keys(categoryCounts).reduce((a, b) =>
          categoryCounts[a] > categoryCounts[b] ? a : b
        )
      : null;

    // ============================================
    // PHASE 3: Fetch content and engagement stats in parallel
    // ============================================
    const journeyIds = journeys.map((j) => j.id);
    const postIds = userPosts.map((p) => p.id);

    const [
      musicTracksResult,
      readingLogsResult,
      postsCountResult,
      likesResult,
      commentsResult,
    ] = await Promise.all([
      // Music tracks count
      // Uses idx_reading_logs_stats (INCLUDE music_track_id)
      journeyIds.length > 0
        ? supabase
            .from('reading_logs')
            .select('*', { count: 'exact', head: true })
            .in('journey_id', journeyIds)
            .not('music_track_id', 'is', null)
        : Promise.resolve({ count: 0 }),

      // Reading logs count
      // Uses idx_reading_logs_journey_id_version
      journeyIds.length > 0
        ? supabase
            .from('reading_logs')
            .select('*', { count: 'exact', head: true })
            .in('journey_id', journeyIds)
        : Promise.resolve({ count: 0 }),

      // Published posts count
      // Uses idx_posts_user_stats
      supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_published', true),

      // Likes received count
      // Uses idx_likes_post_stats
      postIds.length > 0
        ? supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .in('post_id', postIds)
        : Promise.resolve({ count: 0 }),

      // Comments received count
      // Uses idx_comments_post_stats
      postIds.length > 0
        ? supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .in('post_id', postIds)
        : Promise.resolve({ count: 0 }),
    ]);

    // ============================================
    // PHASE 4: Build response
    // ============================================
    const stats = {
      journeys: {
        total: totalJourneys,
        reading: readingCount,
        completed: completedCount,
      },
      content: {
        totalMusicTracks: musicTracksResult.count || 0,
        totalReadingLogs: readingLogsResult.count || 0,
        postsPublished: postsCountResult.count || 0,
      },
      engagement: {
        likesReceived: likesResult.count || 0,
        commentsReceived: commentsResult.count || 0,
        bookmarksSaved: bookmarksCount,
      },
      insights: {
        averageRating: Math.round(averageRating * 10) / 10,
        favoriteCategory,
      },
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
