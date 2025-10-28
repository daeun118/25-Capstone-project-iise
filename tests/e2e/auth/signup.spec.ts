import { test, expect } from '@playwright/test';
import { SignupPage } from '../../pages/auth/signup.page';
import { generateTestUser } from '../../utils/test-data';

test.describe('회원가입 기능', () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.goto();
  });

  test('회원가입 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/회원가입|Sign.*up|ReadTune/);

    // 회원가입 폼 요소들이 보이는지 확인
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.passwordInput).toBeVisible();
    await expect(signupPage.passwordConfirmInput).toBeVisible();
    await expect(signupPage.nicknameInput).toBeVisible();
    await expect(signupPage.signupButton).toBeVisible();
  });

  test('로그인 링크가 작동한다', async ({ page }) => {
    await signupPage.loginLink.click();
    await expect(page).toHaveURL('/login');
  });

  test('빈 입력으로 회원가입 시도 시 검증 메시지가 표시된다', async ({ page }) => {
    await signupPage.signupButton.click();

    // HTML5 validation 확인
    const emailValidity = await signupPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });

  test('유효하지 않은 이메일 형식으로 입력 시 검증된다', async ({ page }) => {
    await signupPage.emailInput.fill('invalid-email');
    await signupPage.passwordInput.fill('Password123!');
    await signupPage.passwordConfirmInput.fill('Password123!');
    await signupPage.nicknameInput.fill('테스터');
    await signupPage.signupButton.click();

    // 이메일 validation 확인
    const emailValidity = await signupPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });

  test('비밀번호와 비밀번호 확인이 일치하지 않으면 에러가 표시된다', async ({ page }) => {
    const user = generateTestUser();

    await signupPage.emailInput.fill(user.email);
    await signupPage.passwordInput.fill(user.password);
    await signupPage.passwordConfirmInput.fill('different-password');
    await signupPage.nicknameInput.fill(user.nickname);
    await signupPage.signupButton.click();

    // 비밀번호 불일치 에러 메시지 확인
    await expect(signupPage.errorMessage).toBeVisible();
  });

  // Note: 실제 회원가입 테스트는 DB cleanup이 필요합니다
  test.skip('유효한 정보로 회원가입 성공', async ({ page }) => {
    const user = generateTestUser();
    await signupPage.signup(user.email, user.password, user.nickname);
    await signupPage.expectSignupSuccess();
  });
});
