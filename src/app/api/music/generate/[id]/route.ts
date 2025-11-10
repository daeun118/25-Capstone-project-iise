/**
 * Music Generation API Endpoint
 *
 * POST /api/music/generate/[id] - Trigger async music generation for a track
 *
 * This endpoint is called by the frontend to start music generation
 * for a track that's in 'pending' status. It runs synchronously but
 * the frontend doesn't wait for it - instead, it polls /api/music/[id]
 * to check the status.
 *
 * Flow:
 * 1. Frontend creates journey → music track created with status='pending'
 * 2. Frontend calls this endpoint (fire-and-forget)
 * 3. This endpoint runs full music generation (may take 30s-5min)
 * 4. Frontend polls /api/music/[id] every 2 seconds to check status
 * 5. When status becomes 'completed', music player activates
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBackgroundMusic, downloadMusicFile } from '@/lib/mureka';
import { uploadMusicFile } from '@/lib/mureka/storage';

export const maxDuration = 300; // 5 minutes - allows long-running music generation

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params;
    const supabase = await createClient();

    // Get current user (optional - can allow unauthenticated for async processing)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(`[Music Generate API] Starting generation for track ${trackId}...`);

    // 1. Fetch the music track to get prompt and metadata
    const { data: track, error: trackError } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      console.error('[Music Generate API] Track not found:', trackError);
      return NextResponse.json(
        { error: 'Music track not found' },
        { status: 404 }
      );
    }

    // Check if already completed or in progress
    if (track.status === 'completed') {
      console.log(`[Music Generate API] Track ${trackId} already completed`);
      return NextResponse.json({
        message: 'Music already generated',
        track_id: trackId,
        status: 'completed',
        file_url: track.file_url,
      });
    }

    // Update status to 'generating' to prevent duplicate calls
    await supabase
      .from('music_tracks')
      .update({ status: 'generating' })
      .eq('id', trackId);

    console.log(`[Music Generate API] Track ${trackId} status → generating`);

    // 2. Generate music with Mureka (this is the long-running part)
    console.log(`[Music Generate API] Calling Mureka API...`);
    const murekaResult = await generateBackgroundMusic({
      prompt: track.prompt,
      genre: track.genre || undefined,
      mood: track.mood || undefined,
      tempo: track.tempo ? String(track.tempo) : undefined,
      duration: 120, // 2 minutes
    });

    if (murekaResult.status === 'error') {
      console.error('[Music Generate API] Mureka generation failed:', murekaResult.error);

      // Update track status to error
      await supabase
        .from('music_tracks')
        .update({
          status: 'error',
          error_message: murekaResult.error || 'Music generation failed',
        })
        .eq('id', trackId);

      return NextResponse.json(
        { error: murekaResult.error || 'Music generation failed' },
        { status: 500 }
      );
    }

    console.log(`[Music Generate API] Mureka generation completed`);

    // 3. Get file data (download if URL provided, or use buffer)
    let fileData: Buffer;

    if (murekaResult.fileUrl) {
      console.log(`[Music Generate API] Downloading from ${murekaResult.fileUrl}...`);
      fileData = await downloadMusicFile(murekaResult.fileUrl);
    } else if (murekaResult.fileData) {
      fileData = murekaResult.fileData;
    } else {
      throw new Error('Mureka returned neither fileUrl nor fileData');
    }

    // 4. Get journey ID for storage organization
    const { data: log } = await supabase
      .from('reading_logs')
      .select('journey_id')
      .eq('music_track_id', trackId)
      .single();

    const journeyId = log?.journey_id || 'unknown';

    // 5. Upload to Supabase Storage
    console.log(`[Music Generate API] Uploading to Supabase Storage...`);
    const uploadResult = await uploadMusicFile({
      fileData,
      fileName: `${trackId}.mp3`,
      journeyId,
      trackId,
    });

    console.log(`[Music Generate API] Upload complete: ${uploadResult.publicUrl}`);

    // 6. Update track with file URL and mark as completed
    await supabase
      .from('music_tracks')
      .update({
        status: 'completed',
        file_url: uploadResult.publicUrl,
        duration: murekaResult.metadata?.duration,
        file_size: murekaResult.metadata?.size,
      })
      .eq('id', trackId);

    console.log(`[Music Generate API] ✅ Track ${trackId} completed successfully`);

    return NextResponse.json({
      success: true,
      track_id: trackId,
      status: 'completed',
      file_url: uploadResult.publicUrl,
      duration: murekaResult.metadata?.duration,
    });
  } catch (error) {
    const { id: trackId } = await params;
    const supabase = await createClient();

    console.error(`[Music Generate API] ❌ Generation failed for track ${trackId}:`, error);

    // Update track status to error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const { error: updateError } = await supabase
      .from('music_tracks')
      .update({
        status: 'error',
        error_message: errorMessage,
      })
      .eq('id', trackId);

    if (updateError) {
      console.error(`[Music Generate API] ⚠️ Failed to update error status for track ${trackId}:`, updateError);
    } else {
      console.log(`[Music Generate API] ✅ Track ${trackId} status updated to 'error'`);
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
