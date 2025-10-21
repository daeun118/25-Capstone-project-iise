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

    // Get all user journeys
    const journeys = await journeyService.findByUserId(user.id);

    // Filter by status if specified
    let filteredJourneys = journeys;
    if (status !== 'all') {
      filteredJourneys = journeys.filter((j) => j.status === status);
    }

    // Sort journeys
    const sortedJourneys = filteredJourneys.sort((a, b) => {
      const dateA = new Date(a.started_at).getTime();
      const dateB = new Date(b.started_at).getTime();
      return sort === 'latest' ? dateB - dateA : dateA - dateB;
    });

    // Get logs count and music tracks count for each journey
    const journeysWithStats = await Promise.all(
      sortedJourneys.map(async (journey) => {
        const logs = await logRepo.findByJourneyId(journey.id);
        const musicTracks = logs.filter((log) => log.music_track_id).length;

        return {
          id: journey.id,
          bookTitle: journey.book_title,
          bookAuthor: journey.book_author || 'Unknown',
          bookCoverUrl: journey.book_cover_url || undefined,
          status: journey.status,
          progress: undefined, // TODO: Calculate progress based on logs/page numbers
          logsCount: logs.length,
          musicTracksCount: musicTracks,
          startedAt: journey.started_at,
          completedAt: journey.completed_at || undefined,
          rating: journey.rating || undefined,
        };
      })
    );

    return NextResponse.json(journeysWithStats);
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch journeys' },
      { status: 500 }
    );
  }
}
