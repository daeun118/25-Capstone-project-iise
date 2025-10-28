/**
 * User Repository
 *
 * Handles all database operations for users table and account deletion
 * - Single Responsibility: User data access only
 * - Liskov Substitution: Can replace BaseRepository<User>
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];

export interface StorageFile {
  bucket: string;
  path: string;
  url: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  getUserStorageFiles(userId: string): Promise<StorageFile[]>;
  deleteLogEmotions(userId: string): Promise<void>;
  deleteComments(userId: string): Promise<void>;
  deleteLikes(userId: string): Promise<void>;
  deleteBookmarks(userId: string): Promise<void>;
  deletePosts(userId: string): Promise<void>;
  deleteReadingLogs(userId: string): Promise<void>;
  deleteMusicTracks(userId: string): Promise<void>;
  deleteReadingJourneys(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

export class UserRepository
  extends BaseRepository<User>
  implements IUserRepository
{
  constructor(db: SupabaseClient<Database>) {
    super(db, 'users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findMany({ email });
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Get all Storage files associated with user
   * Returns bucket and path for deletion
   */
  async getUserStorageFiles(userId: string): Promise<StorageFile[]> {
    const files: StorageFile[] = [];

    try {
      // 1. Get user avatar
      const { data: user } = await this.db
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (user && 'avatar_url' in user && user.avatar_url) {
        const avatarUrl = user.avatar_url as string;
        const avatarPath = this.extractStoragePath(avatarUrl);
        if (avatarPath) {
          files.push({
            bucket: 'avatars',
            path: avatarPath,
            url: avatarUrl,
          });
        }
      }

      // 2. Get music track files
      const { data: journeys } = await this.db
        .from('reading_journeys')
        .select('id')
        .eq('user_id', userId);

      if (journeys && journeys.length > 0) {
        const journeyIds = journeys.map((j) => j.id);

        const { data: logs } = await this.db
          .from('reading_logs')
          .select('music_track_id')
          .in('journey_id', journeyIds)
          .not('music_track_id', 'is', null);

        if (logs && logs.length > 0) {
          const musicTrackIds = logs
            .map((l) => l.music_track_id)
            .filter((id): id is string => id !== null);

          if (musicTrackIds.length > 0) {
            const { data: musicTracks } = await this.db
              .from('music_tracks')
              .select('file_url')
              .in('id', musicTrackIds);

            musicTracks?.forEach((track) => {
              if (track.file_url) {
                const musicPath = this.extractStoragePath(track.file_url);
                if (musicPath) {
                  files.push({
                    bucket: 'music',
                    path: musicPath,
                    url: track.file_url,
                  });
                }
              }
            });
          }
        }
      }

      // 3. Get album covers from posts
      const { data: posts } = await this.db
        .from('posts')
        .select('album_cover_url, album_cover_thumbnail_url')
        .eq('user_id', userId);

      posts?.forEach((post) => {
        if (post.album_cover_url) {
          const coverPath = this.extractStoragePath(post.album_cover_url);
          if (coverPath) {
            files.push({
              bucket: 'album-covers',
              path: coverPath,
              url: post.album_cover_url,
            });
          }
        }
        if (post.album_cover_thumbnail_url) {
          const thumbPath = this.extractStoragePath(
            post.album_cover_thumbnail_url
          );
          if (thumbPath) {
            files.push({
              bucket: 'album-covers',
              path: thumbPath,
              url: post.album_cover_thumbnail_url,
            });
          }
        }
      });

      return files;
    } catch (error) {
      console.error('Error fetching user storage files:', error);
      return files; // Return partial results on error
    }
  }

  /**
   * Extract storage path from Supabase URL
   * Example: https://xxx.supabase.co/storage/v1/object/public/bucket/path -> path
   */
  private extractStoragePath(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && publicIndex < pathParts.length - 1) {
        return pathParts.slice(publicIndex + 1).join('/');
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Delete log_emotions entries linked to user's reading_logs
   */
  async deleteLogEmotions(userId: string): Promise<void> {
    // Get user's journey IDs
    const { data: journeys } = await this.db
      .from('reading_journeys')
      .select('id')
      .eq('user_id', userId);

    if (!journeys || journeys.length === 0) return;

    const journeyIds = journeys.map((j) => j.id);

    // Get log IDs from those journeys
    const { data: logs } = await this.db
      .from('reading_logs')
      .select('id')
      .in('journey_id', journeyIds);

    if (!logs || logs.length === 0) return;

    const logIds = logs.map((l) => l.id);

    // Delete log_emotions
    const { error } = await this.db
      .from('log_emotions')
      .delete()
      .in('log_id', logIds);

    if (error) {
      throw new Error(`Failed to delete log_emotions: ${error.message}`);
    }
  }

  /**
   * Delete comments by user or on user's posts
   */
  async deleteComments(userId: string): Promise<void> {
    const { error } = await this.db
      .from('comments')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete comments: ${error.message}`);
    }
  }

  /**
   * Delete likes by user
   */
  async deleteLikes(userId: string): Promise<void> {
    const { error } = await this.db
      .from('likes')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete likes: ${error.message}`);
    }
  }

  /**
   * Delete bookmarks by user
   */
  async deleteBookmarks(userId: string): Promise<void> {
    const { error } = await this.db
      .from('bookmarks')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete bookmarks: ${error.message}`);
    }
  }

  /**
   * Delete posts by user
   */
  async deletePosts(userId: string): Promise<void> {
    // First get post IDs to delete related comments/likes/bookmarks
    const { data: posts } = await this.db
      .from('posts')
      .select('id')
      .eq('user_id', userId);

    if (posts && posts.length > 0) {
      const postIds = posts.map((p) => p.id);

      // Delete comments on these posts
      await this.db.from('comments').delete().in('post_id', postIds);

      // Delete likes on these posts
      await this.db.from('likes').delete().in('post_id', postIds);

      // Delete bookmarks on these posts
      await this.db.from('bookmarks').delete().in('post_id', postIds);
    }

    // Delete posts
    const { error } = await this.db
      .from('posts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete posts: ${error.message}`);
    }
  }

  /**
   * Delete reading_logs for user's journeys
   */
  async deleteReadingLogs(userId: string): Promise<void> {
    // Get journey IDs
    const { data: journeys } = await this.db
      .from('reading_journeys')
      .select('id')
      .eq('user_id', userId);

    if (!journeys || journeys.length === 0) return;

    const journeyIds = journeys.map((j) => j.id);

    // Delete reading_logs
    const { error } = await this.db
      .from('reading_logs')
      .delete()
      .in('journey_id', journeyIds);

    if (error) {
      throw new Error(`Failed to delete reading_logs: ${error.message}`);
    }
  }

  /**
   * Delete music_tracks associated with user's logs
   */
  async deleteMusicTracks(userId: string): Promise<void> {
    // Get journey IDs
    const { data: journeys } = await this.db
      .from('reading_journeys')
      .select('id')
      .eq('user_id', userId);

    if (!journeys || journeys.length === 0) return;

    const journeyIds = journeys.map((j) => j.id);

    // Get music track IDs from logs
    const { data: logs } = await this.db
      .from('reading_logs')
      .select('music_track_id')
      .in('journey_id', journeyIds)
      .not('music_track_id', 'is', null);

    if (!logs || logs.length === 0) return;

    const musicTrackIds = logs
      .map((l) => l.music_track_id)
      .filter((id): id is string => id !== null);

    if (musicTrackIds.length === 0) return;

    // Delete music_tracks
    const { error } = await this.db
      .from('music_tracks')
      .delete()
      .in('id', musicTrackIds);

    if (error) {
      throw new Error(`Failed to delete music_tracks: ${error.message}`);
    }
  }

  /**
   * Delete reading_journeys for user
   */
  async deleteReadingJourneys(userId: string): Promise<void> {
    const { error } = await this.db
      .from('reading_journeys')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete reading_journeys: ${error.message}`);
    }
  }

  /**
   * Delete user from users table
   */
  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.db.from('users').delete().eq('id', userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
