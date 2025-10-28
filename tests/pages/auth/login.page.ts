import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * 로그인 페이지 객체
 *
 * Phase 1, 2 구현: 이메일/비밀번호 로그인
 */
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signupLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // 셀렉터 정의
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.signupLink = page.locator('a[href="/signup"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  /**
   * 로그인 페이지로 이동
   */
  async goto() {
    await super.goto('/login');
    await this.expectTitle(/로그인|Login|ReadTune/);
  }

  /**
   * 로그인 수행
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * 회원가입 페이지로 이동
   */
  async goToSignup() {
    await this.signupLink.click();
    await this.expectURL('/signup');
  }

  /**
   * 로그인 성공 검증
   */
  async expectLoginSuccess() {
    // 로그인 후 피드 또는 책장으로 리다이렉트
    await this.expectURL(/\/(feed|library)/);
  }

  /**
   * 로그인 실패 검증
   */
  async expectLoginError(message?: string) {
    await this.expectVisible(this.errorMessage);
    if (message) {
      await this.expectText(this.errorMessage, message);
    }
  }

  /**
   * 이메일 입력 필드가 비어있는지 확인
   */
  async expectEmptyEmail() {
    const value = await this.emailInput.inputValue();
    if (value !== '') {
      throw new Error('Email input is not empty');
    }
  }

  /**
   * 비밀번호 입력 필드가 비어있는지 확인
   */
  async expectEmptyPassword() {
    const value = await this.passwordInput.inputValue();
    if (value !== '') {
      throw new Error('Password input is not empty');
    }
  }
}
