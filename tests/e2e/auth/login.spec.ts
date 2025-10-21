import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';

test.describe('로그인 기능', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('로그인 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/로그인|Login|BookBeats/);

    // 로그인 폼 요소들이 보이는지 확인
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('회원가입 링크가 작동한다', async ({ page }) => {
    await loginPage.signupLink.click();
    await expect(page).toHaveURL('/signup');
  });

  test('빈 입력으로 로그인 시도 시 검증 메시지가 표시된다', async ({ page }) => {
    await loginPage.loginButton.click();

    // HTML5 validation 또는 에러 메시지 확인
    const emailValidity = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });

  test('유효하지 않은 이메일 형식으로 입력 시 검증된다', async ({ page }) => {
    await loginPage.emailInput.fill('invalid-email');
    await loginPage.passwordInput.fill('password123');
    await loginPage.loginButton.click();

    // 이메일 validation 확인
    const emailValidity = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });

  // Note: 실제 로그인 테스트는 테스트 계정이 필요합니다
  test.skip('유효한 계정으로 로그인 성공', async ({ page }) => {
    // 환경 변수에서 테스트 계정 정보 가져오기
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await loginPage.login(email, password);
    await loginPage.expectLoginSuccess();
  });

  test.skip('잘못된 비밀번호로 로그인 실패', async ({ page }) => {
    await loginPage.login('test@example.com', 'wrong-password');
    await loginPage.expectLoginError();
  });
});
