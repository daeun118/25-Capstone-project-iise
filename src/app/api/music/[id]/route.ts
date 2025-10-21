/**
 * Music Track Status API
 * 
 * GET /api/music/[id] - Get music track status and details
 * 
 * This endpoint allows frontend to poll for music generation status
 * since generation is async (30s-2min processing time)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch music track
    const { data: track, error: trackError } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError) {
      return NextResponse.json(
        { error: 'Music track not found' },
        { status: 404 }
      );
    }

    // Return track status
    return NextResponse.json({
      id: track.id,
      status: track.status, // 'pending' | 'completed' | 'error'
      file_url: track.file_url,
      prompt: track.prompt,
      genre: track.genre,
      mood: track.mood,
      tempo: track.tempo,
      description: track.description,
      duration: track.duration,
      file_size: track.file_size,
      error_message: track.error_message,
      created_at: track.created_at,
    });
  } catch (error) {
    console.error('[API] Failed to get music track status:', error);
    return NextResponse.json(
      { error: 'Failed to get music track status' },
      { status: 500 }
    );
  }
}
