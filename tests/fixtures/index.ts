import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * ReadTune 테스트용 Fixtures
 *
 * Playwright의 test를 확장하여 재사용 가능한 설정을 제공합니다.
 * - authenticatedPage: 로그인된 상태의 페이지
 * - testUser: 테스트용 사용자 정보
 */

// Fixture 타입 정의
type TestFixtures = {
  authenticatedPage: Page;
  testUser: {
    email: string;
    password: string;
    nickname: string;
  };
};

/**
 * 확장된 test 객체
 *
 * 사용 예시:
 * import { test, expect } from '../fixtures';
 *
 * test('인증된 사용자 테스트', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/library');
 *   // ...
 * });
 */
export const test = base.extend<TestFixtures>({
  // 테스트 사용자 정보 fixture
  testUser: async ({}, use) => {
    const user = {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      nickname: process.env.TEST_USER_NICKNAME || '테스트유저',
    };
    await use(user);
  },

  // 로그인된 페이지 fixture
  authenticatedPage: async ({ page, testUser }, use) => {
    // 1. 로그인 페이지로 이동
    await page.goto('/login');

    // 2. 로그인 수행
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // 3. 로그인 완료 대기
    await page.waitForURL(/\/(feed|library)/);

    // 4. 테스트에 페이지 제공
    await use(page);

    // 5. 테스트 완료 후 로그아웃 (cleanup)
    // Note: 필요에 따라 주석 처리 가능
    // await page.click('[data-testid="profile-menu"]');
    // await page.click('button:has-text("로그아웃")');
  },
});

// expect도 함께 export
export { expect } from '@playwright/test';
