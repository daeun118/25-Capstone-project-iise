/**
 * GET /api/journeys - Get all journeys for the current user
 *
 * Query Parameters:
 * - status: 'reading' | 'completed' | 'all' (default: 'all')
 * - sort: 'latest' | 'oldest' (default: 'latest')
 *
 * Returns: Array of JourneyResponseDto
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JourneyService } from '@/services/journey.service';
import { JourneyRepository } from '@/repositories/journey.repository';
import { LogRepository } from '@/repositories/log.repository';
import { MusicService } from '@/services/music.service';
import { MusicRepository } from '@/repositories/music.repository';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'latest';

    // Initialize repositories and service
    const journeyRepo = new JourneyRepository(supabase);
    const logRepo = new LogRepository(supabase);
    const musicRepo = new MusicRepository(supabase);
    const musicService = new MusicService(musicRepo, logRepo);
    const journeyService = new JourneyService(journeyRepo, logRepo, musicService);

    // ✅ OPTIMIZED: Single query with JOIN to avoid N+1 problem
    // Fetch journeys with reading_logs in a single query
    let query = supabase
      .from('reading_journeys')
      .select(`
        *,
        reading_logs (
          id,
          music_track_id
        )
      `)
      .eq('user_id', user.id);

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Sort at database level
    query = query.order('started_at', { ascending: sort === 'oldest' });

    const { data: journeysWithLogs, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch journeys: ${fetchError.message}`);
    }

    // Transform data with stats calculated from joined data
    const journeysWithStats = (journeysWithLogs || []).map((journey: any) => {
      const logs = journey.reading_logs || [];
      const musicTracksCount = logs.filter((log: any) => log.music_track_id).length;

      return {
        id: journey.id,
        bookTitle: journey.book_title,
        bookAuthor: journey.book_author || 'Unknown',
        bookCoverUrl: journey.book_cover_url || undefined,
        status: journey.status,
        progress: undefined, // NOTE: Progress calculation requires total_pages field (future feature)
        logsCount: logs.length,
        musicTracksCount: musicTracksCount,
        startedAt: journey.started_at,
        completedAt: journey.completed_at || undefined,
        rating: journey.rating || undefined,
      };
    });

    return NextResponse.json(journeysWithStats);
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch journeys' },
      { status: 500 }
    );
  }
}
