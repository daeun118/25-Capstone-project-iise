/**
 * Journey Creation API (Refactored)
 *
 * POST /api/journeys/create
 *
 * Improvements:
 * - Single Responsibility: API route only handles HTTP concerns
 * - Dependency Inversion: Uses service interfaces
 * - Consistent error handling
 * - Type-safe with DTOs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JourneyRepository } from '@/repositories/journey.repository';
import { LogRepository } from '@/repositories/log.repository';
import { MusicRepository } from '@/repositories/music.repository';
import { JourneyService } from '@/services/journey.service';
import { MusicService } from '@/services/music.service';
import { CreateJourneyDto } from '@/types/dto/journey.dto';
import { ApiResponseBuilder } from '@/types/dto/api-response.dto';

/**
 * Create a new reading journey
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        ApiResponseBuilder.authError(),
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let dto: CreateJourneyDto;
    try {
      dto = await request.json();
    } catch {
      return NextResponse.json(
        ApiResponseBuilder.validationError('Invalid JSON body'),
        { status: 400 }
      );
    }

    // 3. Initialize repositories and services (Dependency Injection)
    const journeyRepo = new JourneyRepository(supabase);
    const logRepo = new LogRepository(supabase);
    const musicRepo = new MusicRepository(supabase);

    const musicService = new MusicService(musicRepo, logRepo);
    const journeyService = new JourneyService(
      journeyRepo,
      logRepo,
      musicService
    );

    // 4. Execute business logic
    const result = await journeyService.create(user.id, dto);

    // 5. Return success response
    return NextResponse.json(
      ApiResponseBuilder.success(result, '독서 여정이 시작되었습니다!')
    );
  } catch (error) {
    console.error('[Journey Creation Error]:', error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        ApiResponseBuilder.validationError(error.message),
        { status: 400 }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      ApiResponseBuilder.serverError(
        error instanceof Error ? error.message : undefined
      ),
      { status: 500 }
    );
  }
}
