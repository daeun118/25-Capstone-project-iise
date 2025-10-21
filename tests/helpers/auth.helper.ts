import { Page } from '@playwright/test';

/**
 * 인증 관련 헬퍼 함수들
 *
 * 로그인, 로그아웃, 회원가입 등의 인증 관련 로직을 제공합니다.
 */

/**
 * 로그인
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // 로그인 완료 대기
  await page.waitForURL(/\/(feed|library)/, { timeout: 10000 });
}

/**
 * 로그아웃
 */
export async function logout(page: Page) {
  await page.click('[data-testid="profile-menu"]');
  await page.click('button:has-text("로그아웃")');

  // 로그아웃 완료 대기 (로그인 페이지로 리다이렉트)
  await page.waitForURL('/login', { timeout: 5000 });
}

/**
 * 회원가입
 */
export async function signup(
  page: Page,
  email: string,
  password: string,
  nickname: string
) {
  await page.goto('/signup');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="passwordConfirm"]', password);
  await page.fill('input[name="nickname"]', nickname);
  await page.click('button[type="submit"]');

  // 회원가입 완료 대기
  await page.waitForURL(/\/(feed|library)/, { timeout: 10000 });
}

/**
 * 현재 로그인 상태 확인
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // 로그인된 경우에만 보이는 요소 확인
    const profileMenu = page.locator('[data-testid="profile-menu"]');
    await profileMenu.waitFor({ state: 'visible', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 인증 토큰 가져오기 (로컬 스토리지에서)
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return localStorage.getItem('supabase.auth.token');
  });
}

/**
 * 인증 토큰 설정 (로컬 스토리지에)
 */
export async function setAuthToken(page: Page, token: string) {
  await page.evaluate((token) => {
    localStorage.setItem('supabase.auth.token', token);
  }, token);
}

/**
 * 모든 인증 정보 삭제
 */
export async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
}
