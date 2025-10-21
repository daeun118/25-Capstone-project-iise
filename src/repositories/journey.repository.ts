/**
 * Journey Repository
 *
 * Handles all database operations for reading_journeys table
 * - Single Responsibility: Journey data access only
 * - Liskov Substitution: Can replace BaseRepository<Journey>
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { Database } from '@/types/database';

type Journey = Database['public']['Tables']['reading_journeys']['Row'];
type JourneyInsert = Database['public']['Tables']['reading_journeys']['Insert'];

export interface IJourneyRepository {
  findById(id: string): Promise<Journey | null>;
  findByUserId(userId: string): Promise<Journey[]>;
  findByUserIdAndStatus(
    userId: string,
    status: 'reading' | 'completed'
  ): Promise<Journey[]>;
  create(data: JourneyInsert): Promise<Journey>;
  update(id: string, data: Partial<Journey>): Promise<Journey>;
  delete(id: string): Promise<void>;
}

export class JourneyRepository
  extends BaseRepository<Journey>
  implements IJourneyRepository
{
  constructor(db: SupabaseClient<Database>) {
    super(db, 'reading_journeys');
  }

  /**
   * Find all journeys for a specific user
   */
  async findByUserId(userId: string): Promise<Journey[]> {
    return this.findMany({ user_id: userId });
  }

  /**
   * Find journeys by user and status
   */
  async findByUserIdAndStatus(
    userId: string,
    status: 'reading' | 'completed'
  ): Promise<Journey[]> {
    const { data, error } = await this.db
      .from('reading_journeys')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to find journeys: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find journey with reading logs and music tracks
   */
  async findByIdWithLogs(journeyId: string): Promise<any> {
    const { data, error } = await this.db
      .from('reading_journeys')
      .select(`
        *,
        reading_logs (
          *,
          music_track:music_tracks (*)
        )
      `)
      .eq('id', journeyId)
      .single();

    if (error) {
      throw new Error(`Failed to find journey with logs: ${error.message}`);
    }

    return data;
  }

  /**
   * Count journeys by user
   */
  async countByUserId(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from('reading_journeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to count journeys: ${error.message}`);
    }

    return count || 0;
  }
}
