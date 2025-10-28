/**
 * User Service
 *
 * Business logic for user management and account deletion
 * - Single Responsibility: User account operations only
 * - Dependency Inversion: Depends on repository interfaces
 * - Security: Password verification and safe deletion
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository } from '@/repositories/user.repository';
import { Database } from '@/types/database';

export interface DeleteAccountResult {
  success: boolean;
  message: string;
}

export interface IUserService {
  deleteAccount(
    userId: string,
    email: string,
    password: string
  ): Promise<DeleteAccountResult>;
}

export class UserService implements IUserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly supabaseClient: SupabaseClient<Database>,
    private readonly supabaseAdmin: SupabaseClient<Database>
  ) {}

  /**
   * Delete user account and all associated data
   *
   * Process:
   * 1. Verify password (security check)
   * 2. Fetch user data for validation
   * 3. Delete Storage files (music, avatars, album covers)
   * 4. Delete DB data in correct order (leaf nodes → root)
   * 5. Delete Auth account
   *
   * @param userId - User ID from session
   * @param email - User email for verification
   * @param password - User password for confirmation
   * @returns DeleteAccountResult with success status
   */
  async deleteAccount(
    userId: string,
    email: string,
    password: string
  ): Promise<DeleteAccountResult> {
    try {
      // 1. Verify password (critical security check)
      const { error: authError } = await this.supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return {
          success: false,
          message: '비밀번호가 일치하지 않습니다.',
        };
      }

      // 2. Verify user exists
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
      }

      // 3. Get Storage files for deletion
      console.log(`[DeleteAccount] Fetching storage files for user ${userId}`);
      const storageFiles = await this.userRepo.getUserStorageFiles(userId);
      console.log(`[DeleteAccount] Found ${storageFiles.length} storage files`);

      // 4. Delete Storage files
      if (storageFiles.length > 0) {
        console.log('[DeleteAccount] Deleting storage files...');
        await this.deleteStorageFiles(storageFiles);
      }

      // 5. Delete DB data in correct order (leaf → root)
      console.log('[DeleteAccount] Deleting database records...');
      await this.deleteDatabaseRecords(userId);

      // 6. Delete Auth account (final step)
      console.log('[DeleteAccount] Deleting auth account...');
      const { error: deleteAuthError } = await this.supabaseAdmin.auth.admin.deleteUser(
        userId
      );

      if (deleteAuthError) {
        console.error('[DeleteAccount] Auth deletion error:', deleteAuthError);
        // Continue even if auth deletion fails - user data is already deleted
        // This is a non-blocking error
      }

      console.log(`[DeleteAccount] Account ${userId} deleted successfully`);

      return {
        success: true,
        message: '계정이 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      console.error('[DeleteAccount] Unexpected error:', error);

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '계정 삭제 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * Delete Storage files
   */
  private async deleteStorageFiles(
    files: Array<{ bucket: string; path: string }>
  ): Promise<void> {
    // Group files by bucket
    const filesByBucket = files.reduce(
      (acc, file) => {
        if (!acc[file.bucket]) {
          acc[file.bucket] = [];
        }
        acc[file.bucket].push(file.path);
        return acc;
      },
      {} as Record<string, string[]>
    );

    // Delete files bucket by bucket
    for (const [bucket, paths] of Object.entries(filesByBucket)) {
      try {
        const { error } = await this.supabaseAdmin.storage
          .from(bucket)
          .remove(paths);

        if (error) {
          console.error(`[DeleteAccount] Storage deletion error in ${bucket}:`, error);
          // Continue on error - non-critical
        } else {
          console.log(`[DeleteAccount] Deleted ${paths.length} files from ${bucket}`);
        }
      } catch (error) {
        console.error(`[DeleteAccount] Unexpected storage error in ${bucket}:`, error);
        // Continue on error
      }
    }
  }

  /**
   * Delete database records in correct order
   *
   * Order (leaf nodes → root):
   * 1. log_emotions
   * 2. comments, likes, bookmarks
   * 3. posts
   * 4. reading_logs
   * 5. music_tracks
   * 6. reading_journeys
   * 7. users
   */
  private async deleteDatabaseRecords(userId: string): Promise<void> {
    const errors: string[] = [];

    // Phase 1: Delete connection tables
    try {
      await this.userRepo.deleteLogEmotions(userId);
      console.log('[DeleteAccount] ✓ log_emotions deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] log_emotions error:', msg);
      errors.push(`log_emotions: ${msg}`);
    }

    try {
      await this.userRepo.deleteComments(userId);
      console.log('[DeleteAccount] ✓ comments deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] comments error:', msg);
      errors.push(`comments: ${msg}`);
    }

    try {
      await this.userRepo.deleteLikes(userId);
      console.log('[DeleteAccount] ✓ likes deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] likes error:', msg);
      errors.push(`likes: ${msg}`);
    }

    try {
      await this.userRepo.deleteBookmarks(userId);
      console.log('[DeleteAccount] ✓ bookmarks deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] bookmarks error:', msg);
      errors.push(`bookmarks: ${msg}`);
    }

    // Phase 2: Delete core data
    try {
      await this.userRepo.deletePosts(userId);
      console.log('[DeleteAccount] ✓ posts deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] posts error:', msg);
      errors.push(`posts: ${msg}`);
    }

    try {
      await this.userRepo.deleteReadingLogs(userId);
      console.log('[DeleteAccount] ✓ reading_logs deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] reading_logs error:', msg);
      errors.push(`reading_logs: ${msg}`);
    }

    try {
      await this.userRepo.deleteMusicTracks(userId);
      console.log('[DeleteAccount] ✓ music_tracks deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] music_tracks error:', msg);
      errors.push(`music_tracks: ${msg}`);
    }

    try {
      await this.userRepo.deleteReadingJourneys(userId);
      console.log('[DeleteAccount] ✓ reading_journeys deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] reading_journeys error:', msg);
      errors.push(`reading_journeys: ${msg}`);
    }

    // Phase 3: Delete user (critical)
    try {
      await this.userRepo.deleteUser(userId);
      console.log('[DeleteAccount] ✓ users deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DeleteAccount] users error (CRITICAL):', msg);
      throw new Error(`Failed to delete user record: ${msg}`);
    }

    // Log errors but don't throw (partial deletion is acceptable)
    if (errors.length > 0) {
      console.warn(
        `[DeleteAccount] Completed with ${errors.length} non-critical errors:`,
        errors
      );
    }
  }
}
