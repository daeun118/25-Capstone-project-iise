import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { LogRepository } from '@/repositories/log.repository';
import { MusicRepository } from '@/repositories/music.repository';
import { JourneyRepository } from '@/repositories/journey.repository';
import { MusicService } from '@/services/music.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: journeyId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { quote, memo, emotions, isPublic, generateMusic = true } = body;

    // Validate required fields
    if (!quote || quote.trim().length === 0) {
      return NextResponse.json(
        { error: 'Quote is required' },
        { status: 400 }
      );
    }

    // Verify journey ownership
    const journeyRepo = new JourneyRepository(supabase);
    const journey = await journeyRepo.findById(journeyId);

    if (!journey) {
      return NextResponse.json(
        { error: 'Journey not found' },
        { status: 404 }
      );
    }

    if (journey.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to journey' },
        { status: 403 }
      );
    }

    if (journey.status !== 'reading') {
      return NextResponse.json(
        { error: 'Cannot add logs to completed journey' },
        { status: 400 }
      );
    }

    // Initialize repositories and services
    const logRepo = new LogRepository(supabase);
    const musicRepo = new MusicRepository(supabase);
    const musicService = new MusicService(musicRepo, logRepo);

    let musicTrack = null;
    let log = null;

    if (generateMusic) {
      // Get previous logs for context (max 2 recent logs for token efficiency)
      const previousLogs = await logRepo.findByJourneyId(journeyId);
      const recentLogs = previousLogs.slice(-2).map((log) => ({
        quote: log.quote || undefined,
        memo: log.memo || undefined,
        // NOTE: emotion_tags require join via log_emotions table (see CLAUDE.md#알려진-이슈)
        emotions: undefined,
      }));

      // Generate vN music with cumulative context
      const result = await musicService.generateVNMusic({
        journeyId,
        bookTitle: journey.book_title,
        previousLogs: recentLogs,
        userInput: {
          quote: quote.trim(),
          memo: memo?.trim() || undefined,
          emotions: emotions || [],
        },
        isPublic: isPublic || false,
      });
      musicTrack = result.musicTrack;
      log = result.log;
    } else {
      // Just create log without music generation
      const logCount = await logRepo.countByJourneyId(journeyId);
      const version = logCount;

      log = await logRepo.create({
        journey_id: journeyId,
        log_type: 'vN',
        version,
        quote: quote.trim(),
        memo: memo?.trim() || null,
        music_prompt: null,
        music_track_id: null,
        is_public: isPublic || false,
      });
    }

    // Link emotion tags if provided
    if (emotions && Array.isArray(emotions) && emotions.length > 0) {
      // Get emotion tag IDs from names
      const { data: emotionTags, error: tagsError } = await supabase
        .from('emotion_tags')
        .select('id, name, usage_count')
        .in('name', emotions);

      if (tagsError) {
        console.error('Error fetching emotion tags:', tagsError);
      } else if (emotionTags && emotionTags.length > 0) {
        // Create log_emotions entries
        const logEmotions = emotionTags.map((tag) => ({
          log_id: log.id,
          emotion_tag_id: tag.id,
        }));

        const { error: linkError } = await supabase
          .from('log_emotions')
          .insert(logEmotions);

        if (linkError) {
          console.error('Error linking emotion tags:', linkError);
        } else {
          // Increment usage_count for each tag
          for (const tag of emotionTags) {
            await supabase
              .from('emotion_tags')
              .update({ usage_count: (tag.usage_count || 0) + 1 })
              .eq('id', tag.id);
          }
        }
      }
    }

    // Fetch complete log with relations
    const { data: completeLog, error: fetchError } = await supabase
      .from('reading_logs')
      .select(
        `
        *,
        music_tracks (*),
        log_emotions (
          emotion_tags (
            id,
            name,
            is_predefined
          )
        )
      `
      )
      .eq('id', log.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete log:', fetchError);
      return NextResponse.json({ log, musicTrack });
    }

    // Transform the response to flatten emotion tags
    const responseLog = {
      ...completeLog,
      emotions: completeLog.log_emotions.map(
        (le: any) => le.emotion_tags.name
      ),
      music_track: completeLog.music_tracks,
    };

    return NextResponse.json({
      log: responseLog,
      musicTrack,
      message: generateMusic 
        ? 'Reading log created successfully with music' 
        : 'Reading log saved successfully',
    });
  } catch (error) {
    console.error('Error creating reading log:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: journeyId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify journey ownership
    const { data: journey, error: journeyError } = await supabase
      .from('reading_journeys')
      .select('user_id')
      .eq('id', journeyId)
      .single();

    if (journeyError || !journey) {
      return NextResponse.json(
        { error: 'Journey not found' },
        { status: 404 }
      );
    }

    if (journey.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to journey' },
        { status: 403 }
      );
    }

    // Fetch all logs with relations
    const { data: logs, error } = await supabase
      .from('reading_logs')
      .select(
        `
        *,
        music_tracks (*),
        log_emotions (
          emotion_tags (
            id,
            name,
            is_predefined
          )
        )
      `
      )
      .eq('journey_id', journeyId)
      .order('version', { ascending: true });

    if (error) {
      console.error('Error fetching logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Transform response to flatten emotion tags
    const transformedLogs = logs.map((log) => ({
      ...log,
      emotions: log.log_emotions.map((le: any) => le.emotion_tags.name),
      music_track: log.music_tracks,
    }));

    return NextResponse.json({ logs: transformedLogs });
  } catch (error) {
    console.error('Error fetching reading logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
