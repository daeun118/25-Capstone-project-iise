/**
 * Mureka Music File Storage Integration
 * 
 * Handles uploading generated music files to Supabase Storage
 * and managing public URLs for playback.
 */

import { createClient } from '@/lib/supabase/server';

export interface UploadMusicFileParams {
  fileData: Buffer;
  fileName: string;
  contentType?: string;
  journeyId: string;
  trackId: string;
}

export interface UploadMusicFileResult {
  publicUrl: string;
  path: string;
  size: number;
}

/**
 * Upload music file to Supabase Storage
 * 
 * Storage bucket structure:
 * music-tracks/
 *   {journey_id}/
 *     {track_id}.mp3
 * 
 * @param params - Upload parameters
 * @returns Public URL and metadata
 */
export async function uploadMusicFile(
  params: UploadMusicFileParams
): Promise<UploadMusicFileResult> {
  const { fileData, fileName, contentType = 'audio/mpeg', journeyId, trackId } = params;

  const supabase = await createClient();

  // Construct storage path
  const path = `${journeyId}/${trackId}.mp3`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('music-tracks')
    .upload(path, fileData, {
      contentType,
      upsert: true, // Overwrite if exists
      cacheControl: '31536000', // Cache for 1 year (immutable content)
    });

  if (error) {
    throw new Error(`Failed to upload music file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('music-tracks')
    .getPublicUrl(path);

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
    size: fileData.length,
  };
}

/**
 * Download music file from URL
 * Used when Mureka returns a direct URL instead of binary data
 * 
 * @param url - Source URL from Mureka
 * @returns File buffer
 */
export async function downloadMusicFile(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download music file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Delete music file from storage
 * Used for cleanup or when regenerating music
 * 
 * @param path - Storage path (e.g., "journey_id/track_id.mp3")
 */
export async function deleteMusicFile(path: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from('music-tracks')
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete music file: ${error.message}`);
  }
}

/**
 * Get music file metadata from storage
 * 
 * @param path - Storage path
 * @returns File metadata (size, content type, etc.)
 */
export async function getMusicFileMetadata(path: string): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from('music-tracks')
    .list(path.split('/')[0], {
      limit: 1,
      search: path.split('/')[1],
    });

  if (error || !data || data.length === 0) {
    throw new Error(`Failed to get file metadata: ${error?.message || 'File not found'}`);
  }

  const file = data[0];

  return {
    size: file.metadata?.size || 0,
    contentType: file.metadata?.mimetype || 'audio/mpeg',
    lastModified: new Date(file.created_at),
  };
}

/**
 * Initialize music-tracks storage bucket
 * Call this during setup to ensure bucket exists with correct policies
 * 
 * Note: This should be run manually or in a migration script,
 * not in application code (requires admin privileges)
 */
export async function initializeMusicStorageBucket(): Promise<void> {
  const supabase = await createClient();

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === 'music-tracks');

  if (!bucketExists) {
    // Create bucket (requires service role key)
    const { error: createError } = await supabase.storage.createBucket('music-tracks', {
      public: true, // Public read access
      fileSizeLimit: 10485760, // 10MB limit per file
      allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
    });

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }

    console.log('[Storage] Created music-tracks bucket');
  }

  // Note: RLS policies should be set up in Supabase dashboard:
  // 1. Allow authenticated users to upload to their own journey folders
  // 2. Allow public read access to all files
  // 3. Allow service role to delete files
}
