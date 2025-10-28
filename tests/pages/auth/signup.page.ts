import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * 회원가입 페이지 객체
 *
 * Phase 1, 2 구현: 이메일/비밀번호 회원가입
 */
export class SignupPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly nicknameInput: Locator;
  readonly signupButton: Locator;
  readonly loginLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // 셀렉터 정의
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.passwordConfirmInput = page.locator('input[name="confirmPassword"]');
    this.nicknameInput = page.locator('input[name="nickname"]');
    this.signupButton = page.locator('button[type="submit"]');
    this.loginLink = page.locator('a[href="/login"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  /**
   * 회원가입 페이지로 이동
   */
  async goto() {
    await super.goto('/signup');
    await this.expectTitle(/회원가입|Sign ?up|ReadTune/);
  }

  /**
   * 회원가입 수행
   */
  async signup(email: string, password: string, nickname: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordConfirmInput.fill(password);
    await this.nicknameInput.fill(nickname);
    await this.signupButton.click();
  }

  /**
   * 비밀번호 확인 불일치로 회원가입
   */
  async signupWithMismatchedPassword(
    email: string,
    password: string,
    passwordConfirm: string,
    nickname: string
  ) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordConfirmInput.fill(passwordConfirm);
    await this.nicknameInput.fill(nickname);
    await this.signupButton.click();
  }

  /**
   * 로그인 페이지로 이동
   */
  async goToLogin() {
    await this.loginLink.click();
    await this.expectURL('/login');
  }

  /**
   * 회원가입 성공 검증
   */
  async expectSignupSuccess() {
    // 회원가입 후 피드 또는 책장으로 리다이렉트
    await this.expectURL(/\/(feed|library)/);
  }

  /**
   * 회원가입 실패 검증
   */
  async expectSignupError(message?: string | RegExp) {
    await this.expectVisible(this.errorMessage);
    if (message) {
      await this.expectText(this.errorMessage, message);
    }
  }

  /**
   * 이메일 유효성 검증 에러
   */
  async expectInvalidEmailError() {
    await this.expectSignupError(/이메일|email/i);
  }

  /**
   * 비밀번호 불일치 에러
   */
  async expectPasswordMismatchError() {
    await this.expectSignupError(/비밀번호가 일치하지|password.*match/i);
  }

  /**
   * 비밀번호 강도 에러
   */
  async expectWeakPasswordError() {
    await this.expectSignupError(/비밀번호.*8자|password.*8 char/i);
  }
}
