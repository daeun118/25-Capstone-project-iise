import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * 독서 여정 관련 Fixtures
 *
 * 독서 여정이 생성된 상태의 페이지를 제공합니다.
 */

type JourneyFixtures = {
  // 여정이 하나 생성된 페이지
  pageWithJourney: Page & { journeyId: string };

  // 여정에 로그가 추가된 페이지
  pageWithJourneyAndLogs: Page & { journeyId: string };

  // 완독된 여정이 있는 페이지
  pageWithCompletedJourney: Page & { journeyId: string };
};

export const journeyTest = base.extend<JourneyFixtures>({
  // 여정이 하나 생성된 페이지
  pageWithJourney: async ({ page }, use) => {
    // 1. 로그인
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(feed|library)/);

    // 2. 새 여정 생성
    await page.goto('/journey/new');

    // 도서 검색 (테스트용 고정 도서)
    await page.fill('input[placeholder*="검색"]', '노인과 바다');
    await page.press('input[placeholder*="검색"]', 'Enter');
    await page.waitForSelector('[data-testid="book-card"]');

    // 첫 번째 책 선택
    await page.click('[data-testid="book-card"]:first-child');

    // v0 음악 생성 대기
    await page.waitForResponse(
      (response) => response.url().includes('/api/music/generate'),
      { timeout: 60000 }
    );

    // 여정 ID 추출 (URL에서)
    await page.waitForURL(/\/journey\/[a-f0-9-]+/);
    const url = page.url();
    const journeyId = url.split('/journey/')[1];

    // journeyId를 page 객체에 추가
    const pageWithId = page as Page & { journeyId: string };
    pageWithId.journeyId = journeyId;

    await use(pageWithId);

    // Cleanup: 테스트 후 여정 삭제
    // Note: DB helper를 사용하여 직접 삭제 권장
  },

  // 여정에 로그가 추가된 페이지
  pageWithJourneyAndLogs: async ({ page }, use) => {
    // pageWithJourney와 동일하게 여정 생성 후
    // 로그 추가 로직 구현

    // TODO: 로그 추가 로직 구현
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(feed|library)/);

    const pageWithId = page as Page & { journeyId: string };
    pageWithId.journeyId = 'temp-id'; // TODO: 실제 ID

    await use(pageWithId);
  },

  // 완독된 여정이 있는 페이지
  pageWithCompletedJourney: async ({ page }, use) => {
    // TODO: 완독 여정 생성 로직 구현
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(feed|library)/);

    const pageWithId = page as Page & { journeyId: string };
    pageWithId.journeyId = 'temp-id'; // TODO: 실제 ID

    await use(pageWithId);
  },
});

export { expect } from '@playwright/test';
