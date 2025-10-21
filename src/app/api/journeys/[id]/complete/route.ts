import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { JourneyRepository } from '@/repositories/journey.repository';
import { LogRepository } from '@/repositories/log.repository';
import { MusicRepository } from '@/repositories/music.repository';
import { JourneyService } from '@/services/journey.service';
import { MusicService } from '@/services/music.service';

/**
 * Complete a reading journey and generate vFinal music
 * POST /api/journeys/[id]/complete
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: journeyId } = await params;
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { rating, oneLiner, review } = body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '별점은 1-5 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    if (!oneLiner || oneLiner.trim().length === 0) {
      return NextResponse.json(
        { error: '한줄평은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!review || review.trim().length === 0) {
      return NextResponse.json(
        { error: '감상평은 필수입니다.' },
        { status: 400 }
      );
    }

    // Initialize repositories and services
    const journeyRepo = new JourneyRepository(supabase);
    const logRepo = new LogRepository(supabase);
    const musicRepo = new MusicRepository(supabase);
    const musicService = new MusicService(musicRepo, logRepo);
    const journeyService = new JourneyService(journeyRepo, logRepo, musicService);

    // Complete the journey (this will generate vFinal music)
    const completedJourney = await journeyService.complete(
      journeyId,
      user.id,
      rating,
      review.trim(),
      oneLiner.trim()
    );

    // Fetch all logs including the new vFinal log
    const logs = await logRepo.findByJourneyId(journeyId);
    const vFinalLog = logs.find((log) => log.log_type === 'vFinal');

    // Fetch the vFinal music track if it exists
    let vFinalTrack = null;
    if (vFinalLog && vFinalLog.music_track_id) {
      vFinalTrack = await musicRepo.findById(vFinalLog.music_track_id);
    }

    return NextResponse.json({
      success: true,
      journey: completedJourney,
      vFinalLog,
      vFinalTrack,
      message: '독서 여정을 완료했습니다! 최종 음악 생성 중...',
    });
  } catch (error) {
    console.error('Journey complete API error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Journey not found') {
        return NextResponse.json(
          { error: '독서 여정을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      if (error.message === 'Unauthorized access to journey') {
        return NextResponse.json(
          { error: '권한이 없습니다.' },
          { status: 403 }
        );
      }
      if (error.message === 'Journey already completed') {
        return NextResponse.json(
          { error: '이미 완료된 여정입니다.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: '독서 완료 처리 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
