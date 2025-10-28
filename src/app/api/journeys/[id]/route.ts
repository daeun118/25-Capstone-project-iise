import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get journey with logs
    const { data: journey, error: journeyError } = await supabase
      .from('reading_journeys')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (journeyError || !journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    // Fetch reading logs
    const { data: logsData, error: logsError } = await supabase
      .from('reading_logs')
      .select('*')
      .eq('journey_id', id)
      .order('version', { ascending: true });

    if (logsError) {
      console.error('Error fetching logs:', logsError);
    }

    // Initialize playlist array
    let playlist: any[] = [];

    // If journey is completed and has logs, compile playlist
    if (journey.status === 'completed' && logsData && logsData.length > 0) {
      // Extract music track IDs
      const musicTrackIds = logsData
        .map(log => log.music_track_id)
        .filter((id): id is string => id !== null);

      if (musicTrackIds.length > 0) {
        // Fetch music tracks
        const { data: musicTracks, error: musicError } = await supabase
          .from('music_tracks')
          .select('*')
          .in('id', musicTrackIds)
          .eq('status', 'completed'); // Only include completed tracks

        if (musicError) {
          console.error('Error fetching music tracks:', musicError);
        }

        if (musicTracks && musicTracks.length > 0) {
          // Compile playlist from logs and music tracks
          playlist = logsData
            .map(log => {
              const track = musicTracks.find(t => t.id === log.music_track_id);
              if (!track || !track.file_url) return null;

              return {
                id: track.id,
                version: log.version,
                logType: log.log_type,
                title: log.log_type === 'start' ? 'v0 - 여정의 시작' : 
                       log.log_type === 'complete' ? 'vFinal - 여정의 완성' :
                       `v${log.version} - 독서 중`,
                fileUrl: track.file_url,
                prompt: track.prompt,
                genre: track.genre,
                mood: track.mood,
                tempo: track.tempo,
                duration: track.duration,
                description: track.description,
                createdAt: track.created_at,
                // Include log context for crossfade optimization
                quote: log.quote,
                memo: log.memo,
              };
            })
            .filter(Boolean); // Remove null entries
        }
      }
    }

    // Return journey with playlist (if completed)
    const response = {
      journey,
      ...(journey.status === 'completed' && playlist.length > 0 && { playlist })
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching journey:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if journey exists and belongs to user
    const { data: journey, error: checkError } = await supabase
      .from('reading_journeys')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !journey) {
      return NextResponse.json({ error: 'Journey not found' }, { status: 404 });
    }

    // Delete all related data (cascade delete should handle this, but being explicit)
    // 1. Delete music tracks associated with logs
    const { data: logs } = await supabase
      .from('reading_logs')
      .select('music_track_id')
      .eq('journey_id', id)
      .not('music_track_id', 'is', null);

    if (logs && logs.length > 0) {
      const trackIds = logs.map(log => log.music_track_id).filter((id): id is string => id !== null);
      if (trackIds.length > 0) {
        await supabase
          .from('music_tracks')
          .delete()
          .in('id', trackIds);
      }
    }

    // 2. Delete reading logs
    await supabase
      .from('reading_logs')
      .delete()
      .eq('journey_id', id);

    // 3. Delete posts associated with this journey
    await supabase
      .from('posts')
      .delete()
      .eq('journey_id', id);

    // 4. Finally delete the journey itself
    const { error: deleteError } = await supabase
      .from('reading_journeys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting journey:', deleteError);
      return NextResponse.json({ error: 'Failed to delete journey' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Journey deleted successfully' });
  } catch (error) {
    console.error('Error deleting journey:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}