import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBGM } from '@/services/mureka.service';

/**
 * 음악 생성 API (GPT + Mureka 통합)
 * POST /api/music/generate
 *
 * Body: {
 *   track_id: string  // music_tracks 테이블의 ID
 * }
 *
 * Flow:
 * 1. music_tracks에서 GPT가 생성한 프롬프트 조회
 * 2. Mureka API로 BGM 생성 요청
 * 3. 생성 완료 시 file_url 업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { track_id } = body;

    if (!track_id) {
      return NextResponse.json(
        { error: 'track_id는 필수입니다.' },
        { status: 400 }
      );
    }

    // 트랙 정보 조회
    const { data: track, error: fetchError } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', track_id)
      .single();

    if (fetchError || !track) {
      return NextResponse.json(
        { error: '음악 트랙을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 생성 중이거나 완료된 경우
    if (track.status === 'completed') {
      return NextResponse.json({
        success: true,
        track,
        message: '이미 생성 완료된 음악입니다.',
      });
    }

    // Step 1: 상태를 'generating'으로 변경
    const { error: updateError } = await supabase
      .from('music_tracks')
      .update({ status: 'generating' })
      .eq('id', track_id);

    if (updateError) {
      console.error('Track update error:', updateError);
      return NextResponse.json(
        { error: '음악 트랙 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    // Step 2: Mureka API로 BGM 생성
    console.log('[Music Generation] Starting for track:', track_id);
    console.log('[Music Generation] Prompt:', track.prompt);

    let musicResult;
    try {
      musicResult = await generateBGM({
        prompt: track.prompt,
        genre: track.genre || undefined,
        mood: track.mood || undefined,
        tempo: track.tempo || undefined,
      });

      console.log('[Music Generation] Success:', musicResult.mp3Url);
    } catch (murekaError) {
      console.error('[Music Generation] Mureka API error:', murekaError);

      // 실패 시 상태 업데이트
      await supabase
        .from('music_tracks')
        .update({
          status: 'error',
          error_message: murekaError instanceof Error ? murekaError.message : 'Unknown error',
        })
        .eq('id', track_id);

      return NextResponse.json(
        {
          success: false,
          error: '음악 생성에 실패했습니다.',
          message: murekaError instanceof Error ? murekaError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Step 3: 생성 완료 - file_url 업데이트
    const { data: completedTrack, error: completeError } = await supabase
      .from('music_tracks')
      .update({
        status: 'completed',
        file_url: musicResult.mp3Url,
        mureka_task_id: musicResult.taskId,
        duration: Math.floor(musicResult.duration / 1000), // Convert ms to seconds
      })
      .eq('id', track_id)
      .select()
      .single();

    if (completeError) {
      console.error('Track completion update error:', completeError);
      return NextResponse.json(
        { error: '음악 트랙 완료 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      track: completedTrack,
      message: '음악 생성이 완료되었습니다.',
      mp3_url: musicResult.mp3Url,
      duration: musicResult.duration,
    });

  } catch (error) {
    console.error('Music generation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '음악 생성 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * 음악 생성 상태 조회 API
 * GET /api/music/generate?track_id={id}
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const track_id = searchParams.get('track_id');

    if (!track_id) {
      return NextResponse.json(
        { error: 'track_id는 필수입니다.' },
        { status: 400 }
      );
    }

    // 트랙 정보 조회
    const { data: track, error: fetchError } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', track_id)
      .single();

    if (fetchError || !track) {
      return NextResponse.json(
        { error: '음악 트랙을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      track,
      status: track.status,
      file_url: track.file_url,
    });

  } catch (error) {
    console.error('Music status check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '음악 상태 조회 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
