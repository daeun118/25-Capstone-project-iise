/**
 * Reading Log Repository
 *
 * Handles all database operations for reading_logs table
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { Database } from '@/types/database';

type ReadingLog = Database['public']['Tables']['reading_logs']['Row'];
type ReadingLogInsert = Database['public']['Tables']['reading_logs']['Insert'];

export interface ILogRepository {
  findById(id: string): Promise<ReadingLog | null>;
  findByJourneyId(journeyId: string): Promise<ReadingLog[]>;
  getLatestByJourneyId(journeyId: string): Promise<ReadingLog | null>;
  countByJourneyId(journeyId: string): Promise<number>;
  create(data: ReadingLogInsert): Promise<ReadingLog>;
  update(id: string, data: Partial<ReadingLog>): Promise<ReadingLog>;
}

export class LogRepository
  extends BaseRepository<ReadingLog>
  implements ILogRepository
{
  constructor(db: SupabaseClient<Database>) {
    super(db, 'reading_logs');
  }

  /**
   * Find all logs for a specific journey
   */
  async findByJourneyId(journeyId: string): Promise<ReadingLog[]> {
    const { data, error } = await this.db
      .from('reading_logs')
      .select('*')
      .eq('journey_id', journeyId)
      .order('version', { ascending: true });

    if (error) {
      throw new Error(`Failed to find logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get the latest log for a journey
   */
  async getLatestByJourneyId(journeyId: string): Promise<ReadingLog | null> {
    const { data, error } = await this.db
      .from('reading_logs')
      .select('*')
      .eq('journey_id', journeyId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw new Error(`Failed to get latest log: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Get log count for a journey
   */
  async countByJourneyId(journeyId: string): Promise<number> {
    const { count, error } = await this.db
      .from('reading_logs')
      .select('*', { count: 'exact', head: true })
      .eq('journey_id', journeyId);

    if (error) {
      throw new Error(`Failed to count logs: ${error.message}`);
    }

    return count || 0;
  }
}
