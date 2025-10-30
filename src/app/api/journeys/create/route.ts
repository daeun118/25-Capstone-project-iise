import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateMusicPrompt } from '@/lib/openai/client';

/**
 * 독서 여정 생성 API
 * POST /api/journeys/create
 *
 * Body: {
 *   book_title: string
 *   book_author?: string
 *   book_isbn?: string
 *   book_description?: string
 *   book_category?: string
 *   book_cover_url?: string
 *   book_publisher?: string
 *   book_published_date?: string
 * }
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
    const {
      book_title,
      book_author,
      book_isbn,
      book_description,
      book_category,
      book_cover_url,
      book_publisher,
      book_published_date,
    } = body;

    // 필수 필드 검증
    if (!book_title || !book_title.trim()) {
      return NextResponse.json(
        { error: '책 제목은 필수입니다.' },
        { status: 400 }
      );
    }

    // 1. 독서 여정 생성
    const { data: journey, error: journeyError } = await supabase
      .from('reading_journeys')
      .insert({
        user_id: user.id,
        book_title: book_title.trim(),
        book_author: book_author?.trim() || null,
        book_isbn: book_isbn?.trim() || null,
        book_description: book_description?.trim() || null,
        book_category: book_category?.trim() || null,
        book_cover_url: book_cover_url?.trim() || null,
        book_publisher: book_publisher?.trim() || null,
        book_published_date: book_published_date || null,
        status: 'reading',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (journeyError) {
      console.error('Journey creation error:', journeyError);
      return NextResponse.json(
        { error: '독서 여정 생성에 실패했습니다.', details: journeyError.message },
        { status: 500 }
      );
    }

    // 2. v0 음악 프롬프트 생성
    // ✅ Critical Issue #12: 프롬프트 생성 실패 시 여정 롤백
    let musicPromptData;
    try {
      musicPromptData = await generateMusicPrompt({
        bookTitle: book_title,
        bookDescription: book_description,
        bookCategory: book_category,
        previousLogs: [], // v0는 이전 로그 없음
      });
    } catch (promptError) {
      console.error('Music prompt generation error:', promptError);

      // ✅ 여정 롤백 (삭제)
      await supabase
        .from('reading_journeys')
        .delete()
        .eq('id', journey.id);

      console.log(`✅ Journey ${journey.id} rolled back due to prompt generation failure`);

      return NextResponse.json(
        {
          success: false,
          error: '음악 프롬프트 생성에 실패했습니다. 다시 시도해주세요.',
          details: promptError instanceof Error ? promptError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 3. music_tracks 테이블에 placeholder 생성 (pending 상태)
    const { data: musicTrack, error: trackError } = await supabase
      .from('music_tracks')
      .insert({
        prompt: musicPromptData.prompt,
        genre: musicPromptData.genre,
        mood: musicPromptData.mood,
        tempo: musicPromptData.tempo,
        description: musicPromptData.description,
        file_url: '', // 실제 생성 전에는 빈 문자열
        status: 'pending',
      })
      .select()
      .single();

    if (trackError) {
      console.error('Music track creation error:', trackError);

      // ✅ Critical Issue #12: 여정 롤백
      await supabase
        .from('reading_journeys')
        .delete()
        .eq('id', journey.id);

      console.log(`✅ Journey ${journey.id} rolled back due to track creation failure`);

      return NextResponse.json(
        {
          success: false,
          error: '음악 트랙 생성에 실패했습니다. 다시 시도해주세요.',
          details: trackError.message
        },
        { status: 500 }
      );
    }

    // 4. reading_logs 테이블에 v0 로그 생성
    const { data: log, error: logError } = await supabase
      .from('reading_logs')
      .insert({
        journey_id: journey.id,
        log_type: 'v0',
        version: 0,
        music_prompt: musicPromptData.prompt,
        music_track_id: musicTrack.id,
        is_public: false, // v0는 기본적으로 비공개
      })
      .select()
      .single();

    if (logError) {
      console.error('Reading log creation error:', logError);

      // ✅ Critical Issue #12: 여정 및 트랙 롤백
      await supabase
        .from('music_tracks')
        .delete()
        .eq('id', musicTrack.id);

      await supabase
        .from('reading_journeys')
        .delete()
        .eq('id', journey.id);

      console.log(`✅ Journey ${journey.id} and track ${musicTrack.id} rolled back due to log creation failure`);

      return NextResponse.json(
        {
          success: false,
          error: '독서 기록 생성에 실패했습니다. 다시 시도해주세요.',
          details: logError.message
        },
        { status: 500 }
      );
    }

    // 5. 성공 응답
    return NextResponse.json({
      success: true,
      journey,
      log,
      musicTrack,
      message: '독서 여정이 시작되었습니다! v0 음악 생성을 시작합니다.',
    });

  } catch (error) {
    console.error('Journey creation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '독서 여정 생성 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
