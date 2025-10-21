/**
 * Base Repository
 *
 * Provides common database operations and enforces repository pattern
 * - Dependency Inversion: Depends on SupabaseClient abstraction
 * - Single Responsibility: Only handles database access
 * - Open/Closed: Extendable through inheritance
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export abstract class BaseRepository<T> {
  protected constructor(
    protected readonly db: SupabaseClient<Database>,
    protected readonly tableName: string
  ) {}

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.db
      .from(this.tableName as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
    }

    return data as T;
  }

  /**
   * Find all entities matching criteria
   */
  async findMany(filters?: Record<string, unknown>): Promise<T[]> {
    let query = this.db.from(this.tableName as any).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
    }

    return (data || []) as T[];
  }

  /**
   * Create new entity
   */
  async create(data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.db
      .from(this.tableName as any)
      .insert(data as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  /**
   * Update entity by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.db
      .from(this.tableName as any)
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }

    return result as T;
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(this.tableName as any)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }
}
