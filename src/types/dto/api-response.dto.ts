/**
 * Standard API Response DTOs
 *
 * Provides consistent response structure across all API endpoints
 */

// ============================================
// Success Response
// ============================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Error Response
// ============================================

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================
// Union Type
// ============================================

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// Helper Functions
// ============================================

export class ApiResponseBuilder {
  static success<T>(data: T, message?: string): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      ...(message && { message }),
    };
  }

  static error(
    code: string,
    message: string,
    details?: unknown
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };
  }

  static validationError(details: unknown): ApiErrorResponse {
    return this.error(
      'VALIDATION_ERROR',
      '입력 데이터가 올바르지 않습니다.',
      details
    );
  }

  static authError(): ApiErrorResponse {
    return this.error('AUTH_ERROR', '로그인이 필요합니다.');
  }

  static notFoundError(resource: string = '리소스'): ApiErrorResponse {
    return this.error('NOT_FOUND', `${resource}를 찾을 수 없습니다.`);
  }

  static serverError(message?: string): ApiErrorResponse {
    return this.error(
      'SERVER_ERROR',
      message || '서버 오류가 발생했습니다.'
    );
  }
}
