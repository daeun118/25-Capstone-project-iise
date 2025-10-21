import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * 인증 관련 Fixtures
 *
 * 다양한 인증 상태를 제공합니다.
 */

type AuthFixtures = {
  // 기본 로그인 사용자
  loggedInPage: Page;

  // 여러 사용자 (다중 계정 테스트용)
  user1Page: Page;
  user2Page: Page;

  // 관리자 계정 (추후 확장 가능)
  adminPage: Page;
};

export const authTest = base.extend<AuthFixtures>({
  // 기본 로그인 사용자
  loggedInPage: async ({ page }, use) => {
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(feed|library)/);

    await use(page);
  },

  // 사용자 1 (상호작용 테스트용)
  user1Page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const email = process.env.TEST_USER1_EMAIL || 'user1@example.com';
    const password = process.env.TEST_USER1_PASSWORD || 'User1Password123!';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(feed|library)/);

    await use(page);

    await context.close();
  },

  // 사용자 2 (상호작용 테스트용)
  user2Page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const email = process.env.TEST_USER2_EMAIL || 'user2@example.com';
    const password = process.env.TEST_USER2_PASSWORD || 'User2Password123!';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(feed|library)/);

    await use(page);

    await context.close();
  },

  // 관리자 계정 (추후 확장)
  adminPage: async ({ page }, use) => {
    // TODO: 관리자 로그인 로직
    await use(page);
  },
});

export { expect } from '@playwright/test';
