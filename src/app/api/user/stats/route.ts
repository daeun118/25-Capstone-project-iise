import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/stats
 * Get current user's reading statistics
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

    // Get total journeys count
    const { count: totalJourneys } = await supabase
      .from('reading_journeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get reading journeys count
    const { count: readingCount } = await supabase
      .from('reading_journeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'reading');

    // Get completed journeys count
    const { count: completedCount } = await supabase
      .from('reading_journeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');

    // Get total music tracks count
    const { data: journeyIds } = await supabase
      .from('reading_journeys')
      .select('id')
      .eq('user_id', user.id);

    let totalMusicTracks = 0;
    if (journeyIds && journeyIds.length > 0) {
      const { count: musicCount } = await supabase
        .from('reading_logs')
        .select('*', { count: 'exact', head: true })
        .in(
          'journey_id',
          journeyIds.map((j) => j.id)
        )
        .not('music_track_id', 'is', null);

      totalMusicTracks = musicCount || 0;
    }

    // Get total reading logs count
    let totalReadingLogs = 0;
    if (journeyIds && journeyIds.length > 0) {
      const { count: logsCount } = await supabase
        .from('reading_logs')
        .select('*', { count: 'exact', head: true })
        .in(
          'journey_id',
          journeyIds.map((j) => j.id)
        );

      totalReadingLogs = logsCount || 0;
    }

    // Get posts count (published journeys)
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_published', true);

    // Get total likes received on posts
    let totalLikesReceived = 0;
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user.id);

    if (userPosts && userPosts.length > 0) {
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .in(
          'post_id',
          userPosts.map((p) => p.id)
        );

      totalLikesReceived = likesCount || 0;
    }

    // Get total comments received on posts
    let totalCommentsReceived = 0;
    if (userPosts && userPosts.length > 0) {
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in(
          'post_id',
          userPosts.map((p) => p.id)
        );

      totalCommentsReceived = commentsCount || 0;
    }

    // Get bookmarks count (saved by user)
    const { count: bookmarksCount } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get average rating
    const { data: completedJourneys } = await supabase
      .from('reading_journeys')
      .select('rating')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .not('rating', 'is', null);

    let averageRating = 0;
    if (completedJourneys && completedJourneys.length > 0) {
      const totalRating = completedJourneys.reduce(
        (sum, j) => sum + (j.rating || 0),
        0
      );
      averageRating = totalRating / completedJourneys.length;
    }

    // Get favorite category
    const { data: categories } = await supabase
      .from('reading_journeys')
      .select('book_category')
      .eq('user_id', user.id)
      .not('book_category', 'is', null);

    let favoriteCategory = null;
    if (categories && categories.length > 0) {
      const categoryCounts: { [key: string]: number } = {};
      categories.forEach((c) => {
        if (c.book_category) {
          categoryCounts[c.book_category] =
            (categoryCounts[c.book_category] || 0) + 1;
        }
      });

      const maxCount = Math.max(...Object.values(categoryCounts));
      favoriteCategory =
        Object.keys(categoryCounts).find(
          (cat) => categoryCounts[cat] === maxCount
        ) || null;
    }

    const stats = {
      journeys: {
        total: totalJourneys || 0,
        reading: readingCount || 0,
        completed: completedCount || 0,
      },
      content: {
        totalMusicTracks,
        totalReadingLogs,
        postsPublished: postsCount || 0,
      },
      engagement: {
        likesReceived: totalLikesReceived,
        commentsReceived: totalCommentsReceived,
        bookmarksSaved: bookmarksCount || 0,
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
