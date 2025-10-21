import { Page } from '@playwright/test';
import { deleteUserJourneys, deleteUserPosts, deleteTestUser } from './db.helper';

/**
 * 테스트 데이터 정리 헬퍼
 *
 * 테스트 실행 후 생성된 데이터를 정리합니다.
 */

/**
 * 특정 사용자의 모든 테스트 데이터 정리
 */
export async function cleanupUserData(userId: string) {
  try {
    // 1. 독서 여정 삭제
    await deleteUserJourneys(userId);

    // 2. 게시물 삭제
    await deleteUserPosts(userId);

    // Note: 사용자 자체는 삭제하지 않음 (재사용 가능)
  } catch (error) {
    console.error('Failed to cleanup user data:', error);
    throw error;
  }
}

/**
 * 테스트 사용자 완전 삭제
 */
export async function cleanupTestUser(userId: string) {
  try {
    // 1. 모든 관련 데이터 삭제
    await cleanupUserData(userId);

    // 2. 사용자 삭제
    await deleteTestUser(userId);
  } catch (error) {
    console.error('Failed to cleanup test user:', error);
    throw error;
  }
}

/**
 * 페이지 상태 초기화
 */
export async function cleanupPageState(page: Page) {
  try {
    // 1. 로컬 스토리지 초기화
    await page.evaluate(() => localStorage.clear());

    // 2. 세션 스토리지 초기화
    await page.evaluate(() => sessionStorage.clear());

    // 3. 쿠키 삭제
    await page.context().clearCookies();

    // 4. 캐시 초기화 (선택사항)
    // await page.context().clearPermissions();
  } catch (error) {
    console.error('Failed to cleanup page state:', error);
  }
}

/**
 * 스크린샷 및 비디오 정리
 */
export async function cleanupArtifacts() {
  // Playwright가 자동으로 정리하므로 필요시에만 구현
  // 예: 오래된 스크린샷 파일 삭제 등
}

/**
 * 테스트 후 전체 정리
 */
export async function cleanupAfterTest(page: Page, userId?: string) {
  // 1. 페이지 상태 초기화
  await cleanupPageState(page);

  // 2. 사용자 데이터 정리 (필요시)
  if (userId) {
    await cleanupUserData(userId);
  }
}

/**
 * 테스트 스위트 종료 후 정리
 */
export async function cleanupAfterAll(userIds: string[]) {
  for (const userId of userIds) {
    try {
      await cleanupUserData(userId);
    } catch (error) {
      console.error(`Failed to cleanup user ${userId}:`, error);
    }
  }
}
