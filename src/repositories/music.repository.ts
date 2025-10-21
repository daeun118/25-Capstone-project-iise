/**
 * Music Repository
 *
 * Handles all database operations for music_tracks table
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { Database } from '@/types/database';

type MusicTrack = Database['public']['Tables']['music_tracks']['Row'];
type MusicTrackInsert = Database['public']['Tables']['music_tracks']['Insert'];

export interface IMusicRepository {
  findById(id: string): Promise<MusicTrack | null>;
  create(data: MusicTrackInsert): Promise<MusicTrack>;
  updateStatus(
    id: string,
    status: 'pending' | 'generating' | 'completed' | 'error',
    fileUrl?: string,
    errorMessage?: string
  ): Promise<MusicTrack>;
}

export class MusicRepository
  extends BaseRepository<MusicTrack>
  implements IMusicRepository
{
  constructor(db: SupabaseClient<Database>) {
    super(db, 'music_tracks');
  }

  /**
   * Update music track status and file URL
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'generating' | 'completed' | 'error',
    fileUrl?: string,
    errorMessage?: string
  ): Promise<MusicTrack> {
    const updateData: any = { status };

    if (fileUrl) {
      updateData.file_url = fileUrl;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    return this.update(id, updateData);
  }
}
