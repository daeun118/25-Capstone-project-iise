/**
 * Music Service
 *
 * Business logic for music generation and management
 * - Single Responsibility: Music generation logic only
 * - Strategy Pattern: Different generation strategies for v0, vN, vFinal
 * 
 * Updated with Mureka integration for actual music file generation
 */

import { generateMusicPrompt } from '@/lib/openai/client';
import { IMusicRepository } from '@/repositories/music.repository';
import { ILogRepository } from '@/repositories/log.repository';
import { ReadingLogResponseDto, MusicTrackResponseDto } from '@/types/dto/journey.dto';

export interface MusicGenerationResult {
  musicTrack: MusicTrackResponseDto;
  log: ReadingLogResponseDto;
}

export interface IMusicService {
  generateV0Music(params: {
    journeyId: string;
    bookTitle: string;
    bookDescription?: string;
    bookCategory?: string;
  }): Promise<MusicGenerationResult>;
  generateVNMusic(params: {
    journeyId: string;
    bookTitle: string;
    previousLogs: Array<{
      quote?: string;
      emotions?: string[];
      memo?: string;
    }>;
    userInput: {
      quote?: string;
      emotions?: string[];
      memo?: string;
    };
    isPublic?: boolean;
  }): Promise<MusicGenerationResult>;
  generateVFinalMusic(params: {
    journeyId: string;
    bookTitle: string;
    previousLogs: Array<{
      quote?: string;
      emotions?: string[];
      memo?: string;
    }>;
    userInput?: {
      review?: string;
      rating?: number;
    };
  }): Promise<MusicGenerationResult>;
}

export class MusicService implements IMusicService {
  constructor(
    private readonly musicRepo: IMusicRepository,
    private readonly logRepo: ILogRepository
  ) {}

  /**
   * Generate v0 music (journey start)
   * Based on book information only
   */
  async generateV0Music(params: {
    journeyId: string;
    bookTitle: string;
    bookDescription?: string;
    bookCategory?: string;
  }) {
    const { journeyId, bookTitle, bookDescription, bookCategory } = params;

    // Generate music prompt using OpenAI
    const promptData = await generateMusicPrompt({
      bookTitle,
      bookDescription,
      bookCategory,
      previousLogs: [], // v0 has no previous context
    });

    // Create music track placeholder
    const musicTrack = await this.musicRepo.create({
      prompt: promptData.prompt,
      genre: promptData.genre,
      mood: promptData.mood,
      tempo: promptData.tempo.toString(),
      description: promptData.description,
      file_url: '', // Empty until actually generated
      status: 'pending',
    });

    // Create v0 reading log
    const log = await this.logRepo.create({
      journey_id: journeyId,
      log_type: 'v0',
      version: 0,
      music_prompt: promptData.prompt,
      music_track_id: musicTrack.id,
      is_public: false,
    });

    // NOTE: Async music generation is now handled by frontend
    // Frontend will call POST /api/music/generate/[id] immediately after journey creation
    // This avoids Next.js fire-and-forget issues in API routes
    console.log(`[MusicService] Music track ${musicTrack.id} created with pending status`);
    console.log(`[MusicService] Frontend should trigger /api/music/generate/${musicTrack.id}`);

    return { musicTrack, log };
  }

  /**
   * Generate vN music (journey progression)
   * Based on accumulated context and new user input
   */
  async generateVNMusic(params: {
    journeyId: string;
    bookTitle: string;
    previousLogs: Array<{
      quote?: string;
      emotions?: string[];
      memo?: string;
    }>;
    userInput: {
      quote?: string;
      emotions?: string[];
      memo?: string;
    };
    isPublic?: boolean;
  }) {
    const { journeyId, bookTitle, previousLogs, userInput, isPublic = true } = params;

    // Get current version number
    const logCount = await this.logRepo.countByJourneyId(journeyId);
    const version = logCount; // Next version number

    // Generate music prompt
    const promptData = await generateMusicPrompt({
      bookTitle,
      previousLogs,
      userInput,
      isFinal: false,
    });

    // Create music track
    const musicTrack = await this.musicRepo.create({
      prompt: promptData.prompt,
      genre: promptData.genre,
      mood: promptData.mood,
      tempo: promptData.tempo.toString(),
      description: promptData.description,
      file_url: '',
      status: 'pending',
    });

    // Create vN log
    const log = await this.logRepo.create({
      journey_id: journeyId,
      log_type: 'vN',
      version,
      quote: userInput.quote || null,
      memo: userInput.memo || null,
      music_prompt: promptData.prompt,
      music_track_id: musicTrack.id,
      is_public: isPublic,
    });
    
    // Note: Emotion tags are linked via log_emotions table in the API route layer
    // This separation maintains clean architecture (service doesn't handle junction tables directly)

    // NOTE: Async music generation is now handled by frontend
    console.log(`[MusicService] Music track ${musicTrack.id} created with pending status`);
    console.log(`[MusicService] Frontend should trigger /api/music/generate/${musicTrack.id}`);

    return { musicTrack, log };
  }

  /**
   * Generate vFinal music (journey completion)
   * Synthesizes entire journey into final piece
   */
  async generateVFinalMusic(params: {
    journeyId: string;
    bookTitle: string;
    previousLogs: Array<{
      quote?: string;
      emotions?: string[];
      memo?: string;
    }>;
    userInput?: {
      review?: string;
      rating?: number;
    };
  }) {
    const { journeyId, bookTitle, previousLogs, userInput } = params;

    // Get final version number
    const logCount = await this.logRepo.countByJourneyId(journeyId);
    const version = logCount; // Next version number

    // Generate final music prompt
    const promptData = await generateMusicPrompt({
      bookTitle,
      previousLogs,
      userInput: userInput
        ? {
            memo: userInput.review,
          }
        : undefined,
      isFinal: true,
    });

    // Create music track
    const musicTrack = await this.musicRepo.create({
      prompt: promptData.prompt,
      genre: promptData.genre,
      mood: promptData.mood,
      tempo: promptData.tempo.toString(),
      description: promptData.description,
      file_url: '',
      status: 'pending',
    });

    // Create vFinal log
    const log = await this.logRepo.create({
      journey_id: journeyId,
      log_type: 'vFinal',
      version,
      memo: userInput?.review || null,
      music_prompt: promptData.prompt,
      music_track_id: musicTrack.id,
      is_public: true,
    });

    // NOTE: Async music generation is now handled by frontend
    console.log(`[MusicService] Music track ${musicTrack.id} created with pending status`);
    console.log(`[MusicService] Frontend should trigger /api/music/generate/${musicTrack.id}`);

    return { musicTrack, log };
  }

  /**
   * NOTE: Music generation is now handled by dedicated API endpoint
   * See: /api/music/generate/[id]/route.ts
   *
   * This approach avoids Next.js fire-and-forget issues in API routes.
   * Frontend triggers generation and polls for status updates.
   */
}
