import { Page, APIResponse } from '@playwright/test';

/**
 * API 호출 헬퍼
 *
 * Next.js API Routes를 직접 호출하여 테스트 데이터를 생성하거나
 * API 응답을 검증하는 헬퍼 함수들입니다.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * API 요청 헬퍼 (인증 포함)
 */
export async function apiRequest(
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any
): Promise<APIResponse> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  return await page.request[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'](
    url,
    {
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * 도서 검색 API 호출
 */
export async function searchBooks(page: Page, query: string) {
  const response = await apiRequest(page, 'GET', `/api/books/search?q=${encodeURIComponent(query)}`);
  return await response.json();
}

/**
 * 독서 여정 생성 API 호출
 */
export async function createJourney(page: Page, bookData: {
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
}) {
  const response = await apiRequest(page, 'POST', '/api/journeys/create', bookData);
  return await response.json();
}

/**
 * 독서 기록 추가 API 호출
 */
export async function addLog(page: Page, journeyId: string, logData: {
  quote?: string;
  memo?: string;
  emotions?: string[];
}) {
  const response = await apiRequest(page, 'POST', `/api/journeys/${journeyId}/logs`, logData);
  return await response.json();
}

/**
 * 독서 여정 완독 처리 API 호출
 */
export async function completeJourney(page: Page, journeyId: string, completionData: {
  rating?: number;
  review?: string;
  finalThoughts?: string;
}) {
  const response = await apiRequest(page, 'POST', `/api/journeys/${journeyId}/complete`, completionData);
  return await response.json();
}

/**
 * 게시물 작성 API 호출
 */
export async function createPost(page: Page, postData: {
  journeyId: string;
  content?: string;
}) {
  const response = await apiRequest(page, 'POST', '/api/posts', postData);
  return await response.json();
}

/**
 * 게시물 좋아요 API 호출
 */
export async function likePost(page: Page, postId: string) {
  const response = await apiRequest(page, 'POST', `/api/posts/${postId}/like`, {});
  return await response.json();
}

/**
 * 댓글 작성 API 호출
 */
export async function addComment(page: Page, postId: string, content: string) {
  const response = await apiRequest(page, 'POST', `/api/posts/${postId}/comments`, { content });
  return await response.json();
}

/**
 * API 응답 대기 및 검증
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  options?: {
    timeout?: number;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    status?: number;
  }
) {
  const response = await page.waitForResponse(
    (response) => {
      const matchesUrl = typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url());

      const matchesMethod = options?.method
        ? response.request().method() === options.method
        : true;

      const matchesStatus = options?.status
        ? response.status() === options.status
        : true;

      return matchesUrl && matchesMethod && matchesStatus;
    },
    { timeout: options?.timeout || 30000 }
  );

  return response;
}

/**
 * 음악 생성 API 응답 대기
 * (음악 생성은 시간이 오래 걸리므로 별도 헬퍼 제공)
 */
export async function waitForMusicGeneration(page: Page, timeout = 60000) {
  return await waitForAPIResponse(
    page,
    '/api/music/generate',
    { timeout, method: 'POST', status: 200 }
  );
}

/**
 * API 에러 응답 검증
 */
export async function expectAPIError(response: APIResponse, expectedStatus: number, expectedMessage?: string) {
  const status = response.status();
  const body = await response.json();

  if (status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, but got ${status}`);
  }

  if (expectedMessage && !body.error?.includes(expectedMessage)) {
    throw new Error(`Expected error message to include "${expectedMessage}", but got "${body.error}"`);
  }
}
