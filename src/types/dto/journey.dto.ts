/**
 * Journey-related Data Transfer Objects
 *
 * DTOs define the shape of data transferred between layers
 * - API requests/responses
 * - Service layer inputs/outputs
 */

// ============================================
// Request DTOs (Client → Server)
// ============================================

export interface CreateJourneyDto {
  book_title: string;
  book_author?: string;
  book_isbn?: string;
  book_description?: string;
  book_category?: string;
  book_cover_url?: string;
  book_publisher?: string;
  book_published_date?: string;
}

export interface UpdateJourneyDto {
  status?: 'reading' | 'completed';
  rating?: number;
  review?: string;
  one_liner?: string;
  completed_at?: string;
}

// ============================================
// Response DTOs (Server → Client)
// ============================================

export interface JourneyResponseDto {
  id: string;
  user_id: string;
  book_title: string;
  book_author?: string;
  book_isbn?: string;
  book_description?: string;
  book_category?: string;
  book_cover_url?: string;
  book_publisher?: string;
  book_published_date?: string;
  status: 'reading' | 'completed';
  started_at: string;
  completed_at?: string;
  rating?: number;
  review?: string;
  one_liner?: string;
  created_at: string;
  updated_at: string;
}

export interface JourneyWithLogsDto extends JourneyResponseDto {
  logs: ReadingLogResponseDto[];
}

export interface ReadingLogResponseDto {
  id: string;
  journey_id: string;
  version: number;
  log_type: string;
  quote: string | null;
  memo: string | null;
  emotion_tags?: string[];
  music_prompt: string | null;
  music_track_id: string | null;
  music_track?: MusicTrackResponseDto;
  is_public: boolean | null;
  created_at: string | null;
}

export interface MusicTrackResponseDto {
  id: string;
  prompt: string;
  genre: string | null;
  mood: string | null;
  tempo: number | null;
  description: string | null;
  file_url: string;
  file_size: number | null;
  duration: number | null;
  status: string | null;
  mureka_task_id: string | null;
  error_message: string | null;
  created_at: string | null;
}

// ============================================
// Service Layer DTOs (Internal)
// ============================================

export interface CreateJourneyServiceDto {
  userId: string;
  bookData: CreateJourneyDto;
}

export interface JourneyCreationResult {
  journey: JourneyResponseDto;
  log: ReadingLogResponseDto;
  musicTrack: MusicTrackResponseDto;
}
