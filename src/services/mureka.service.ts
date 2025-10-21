/**
 * Mureka Music Generation Service
 * 
 * This service handles interaction with the Mureka API for BGM (instrumental) generation.
 * Flow:
 * 1. Submit music generation request
 * 2. Poll for completion status
 * 3. Return music file URL when ready
 */

export interface MurekaGenerateRequest {
  prompt: string;
  genre?: string;
  mood?: string;
  tempo?: number;
}

export interface MurekaGenerateResponse {
  id: string;
  created_at: number;
  model: string;
  status: 'preparing' | 'generating' | 'completed' | 'failed';
  trace_id: string;
  songs?: Array<{
    id: string;
    title?: string;
    mp3_url: string;
    duration_milliseconds: number;
    genres?: string[];
    moods?: string[];
  }>;
  error?: string;
}

const MUREKA_API_URL = process.env.MUREKA_API_URL || 'https://api.mureka.ai';
const MUREKA_API_KEY = process.env.MUREKA_API_KEY;

if (!MUREKA_API_KEY) {
  throw new Error('MUREKA_API_KEY environment variable is required');
}

/**
 * Submit a BGM generation request to Mureka
 */
export async function submitMusicGeneration(
  request: MurekaGenerateRequest
): Promise<{ taskId: string; traceId: string }> {
  const response = await fetch(`${MUREKA_API_URL}/v1/song/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MUREKA_API_KEY}`,
    },
    body: JSON.stringify({
      // Use "instrumental" as lyrics to generate BGM without vocals
      lyrics: 'instrumental',
      // Include prompt for better control
      prompt: request.prompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mureka API error: ${response.status} - ${errorText}`);
  }

  const data: MurekaGenerateResponse = await response.json();

  return {
    taskId: data.id,
    traceId: data.trace_id,
  };
}

/**
 * Check the status of a music generation task
 */
export async function checkMusicStatus(taskId: string): Promise<MurekaGenerateResponse> {
  const response = await fetch(`${MUREKA_API_URL}/v1/song/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MUREKA_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mureka API error: ${response.status} - ${errorText}`);
  }

  const data: MurekaGenerateResponse = await response.json();
  return data;
}

/**
 * Poll for music generation completion
 * 
 * @param taskId - The Mureka task ID
 * @param maxAttempts - Maximum number of polling attempts (default: 40)
 * @param intervalMs - Polling interval in milliseconds (default: 5000 = 5s)
 * @returns The completed music data with MP3 URL
 */
export async function pollMusicCompletion(
  taskId: string,
  maxAttempts: number = 40,
  intervalMs: number = 5000
): Promise<MurekaGenerateResponse> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await checkMusicStatus(taskId);

    console.log(`[Mureka] Attempt ${attempt + 1}/${maxAttempts} - Status: ${status.status}`);

    if (status.status === 'completed' && status.songs && status.songs.length > 0) {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Music generation failed');
    }

    // Wait before next poll
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(`Music generation timeout after ${maxAttempts} attempts`);
}

/**
 * Generate BGM and wait for completion (convenience method)
 * 
 * This is a high-level method that handles the full flow:
 * 1. Submit generation request
 * 2. Poll for completion
 * 3. Return music URL
 */
export async function generateBGM(
  request: MurekaGenerateRequest
): Promise<{
  mp3Url: string;
  duration: number;
  taskId: string;
  genres?: string[];
  moods?: string[];
}> {
  console.log('[Mureka] Starting BGM generation:', request.prompt);

  // Step 1: Submit request
  const { taskId, traceId } = await submitMusicGeneration(request);
  console.log(`[Mureka] Task submitted: ${taskId} (trace: ${traceId})`);

  // Step 2: Poll for completion (max 200 seconds = 40 attempts * 5s)
  const result = await pollMusicCompletion(taskId, 40, 5000);

  // Step 3: Extract first song
  const song = result.songs![0];

  console.log(`[Mureka] BGM generated successfully: ${song.mp3_url}`);

  return {
    mp3Url: song.mp3_url,
    duration: song.duration_milliseconds,
    taskId: taskId,
    genres: song.genres,
    moods: song.moods,
  };
}
