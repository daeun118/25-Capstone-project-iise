import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/journeys/[id]/music-status
 * 
 * 경량 엔드포인트: 음악 트랙 상태만 가져오기
 * 페이지 새로고침 없이 음악 생성 상태만 업데이트
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: journeyId } = await context.params;
    const supabase = await createClient();

    // Get auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch only music tracks for this journey
    const { data: logs, error: logsError } = await supabase
      .from('reading_logs')
      .select(`
        id,
        version,
        music_track:music_tracks (
          id,
          status,
          file_url,
          created_at
        )
      `)
      .eq('journey_id', journeyId)
      .order('version', { ascending: true });

    if (logsError) {
      console.error('Failed to fetch music status:', logsError);
      return NextResponse.json({ error: 'Failed to fetch music status' }, { status: 500 });
    }

    // Extract music tracks with their status
    const musicTracks = logs
      ?.map((log) => ({
        logId: log.id,
        version: log.version,
        track: log.music_track
      }))
      .filter((item) => item.track !== null);

    return NextResponse.json({ musicTracks: musicTracks || [] });
  } catch (error) {
    console.error('Error fetching music status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}