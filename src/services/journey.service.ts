/**
 * Journey Service
 *
 * Business logic for journey management
 * - Single Responsibility: Journey business logic only
 * - Dependency Inversion: Depends on repository interfaces
 * - Open/Closed: Extendable through composition
 */

import {
  CreateJourneyDto,
  JourneyCreationResult,
  JourneyResponseDto,
  JourneyWithLogsDto,
} from '@/types/dto/journey.dto';
import { IJourneyRepository } from '@/repositories/journey.repository';
import { ILogRepository } from '@/repositories/log.repository';
import { IMusicService } from './music.service';

export interface IJourneyService {
  create(userId: string, dto: CreateJourneyDto): Promise<JourneyCreationResult>;
  findById(id: string, userId: string): Promise<JourneyWithLogsDto | null>;
  findByUserId(userId: string): Promise<JourneyResponseDto[]>;
  complete(
    id: string,
    userId: string,
    rating?: number,
    review?: string,
    oneLiner?: string
  ): Promise<JourneyResponseDto>;
}

export class JourneyService implements IJourneyService {
  constructor(
    private readonly journeyRepo: IJourneyRepository,
    private readonly logRepo: ILogRepository,
    private readonly musicService: IMusicService
  ) {}

  /**
   * Create a new reading journey
   *
   * Process:
   * 1. Validate input
   * 2. Create journey record
   * 3. Generate v0 music prompt
   * 4. Create music track placeholder
   * 5. Create v0 reading log
   */
  async create(
    userId: string,
    dto: CreateJourneyDto
  ): Promise<JourneyCreationResult> {
    // Validate required fields
    if (!dto.book_title || !dto.book_title.trim()) {
      throw new Error('Book title is required');
    }

    // 1. Create journey
    const journey = await this.journeyRepo.create({
      user_id: userId,
      book_title: dto.book_title.trim(),
      book_author: dto.book_author?.trim() || null,
      book_isbn: dto.book_isbn?.trim() || null,
      book_description: dto.book_description?.trim() || null,
      book_category: dto.book_category?.trim() || null,
      book_cover_url: dto.book_cover_url?.trim() || null,
      book_publisher: dto.book_publisher?.trim() || null,
      book_published_date: dto.book_published_date || null,
      status: 'reading',
      started_at: new Date().toISOString(),
    });

    // 2. Generate v0 music
    const { musicTrack, log } = await this.musicService.generateV0Music({
      journeyId: journey.id,
      bookTitle: dto.book_title,
      bookDescription: dto.book_description,
      bookCategory: dto.book_category,
    });

    return {
      journey: journey as JourneyResponseDto,
      log,
      musicTrack,
    };
  }

  /**
   * Find journey by ID with authorization check
   */
  async findById(
    id: string,
    userId: string
  ): Promise<JourneyWithLogsDto | null> {
    const journey = await this.journeyRepo.findById(id);

    if (!journey) {
      return null;
    }

    // Authorization check
    if (journey.user_id !== userId) {
      throw new Error('Unauthorized access to journey');
    }

    const logs = await this.logRepo.findByJourneyId(id);

    return {
      ...journey,
      logs: logs as any,
    } as JourneyWithLogsDto;
  }

  /**
   * Find all journeys for a user
   */
  async findByUserId(userId: string): Promise<JourneyResponseDto[]> {
    const journeys = await this.journeyRepo.findByUserId(userId);
    return journeys as JourneyResponseDto[];
  }

  /**
   * Complete a journey
   *
   * Process:
   * 1. Update journey status
   * 2. Generate vFinal music
   * 3. Create vFinal log
   */
  async complete(
    id: string,
    userId: string,
    rating?: number,
    review?: string,
    oneLiner?: string
  ): Promise<JourneyResponseDto> {
    // Verify ownership
    const journey = await this.findById(id, userId);

    if (!journey) {
      throw new Error('Journey not found');
    }

    if (journey.status === 'completed') {
      throw new Error('Journey already completed');
    }

    // Get all previous logs for vFinal generation
    const previousLogs = await this.logRepo.findByJourneyId(id);

    // Generate vFinal music
    await this.musicService.generateVFinalMusic({
      journeyId: id,
      bookTitle: journey.book_title,
      previousLogs: previousLogs.map((log) => ({
        quote: log.quote || undefined,
        emotions: undefined, // NOTE: emotion_tags require join via log_emotions table (see CLAUDE.md#알려진-이슈)
        memo: log.memo || undefined,
      })),
      userInput: {
        review,
        rating,
      },
    });

    // Update journey status
    const updatedJourney = await this.journeyRepo.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      rating: rating || null,
      review: review || null,
      one_liner: oneLiner || null,
    });

    return updatedJourney as JourneyResponseDto;
  }
}
