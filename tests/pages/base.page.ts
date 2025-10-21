import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - 모든 Page Object의 기본 클래스
 *
 * 공통적으로 사용되는 메서드들을 제공합니다.
 * 모든 페이지 객체는 이 클래스를 상속받아야 합니다.
 */
export class BasePage {
  readonly page: Page;
  readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  }

  /**
   * 특정 URL로 이동
   */
  async goto(path: string = '') {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * 페이지 타이틀 확인
   */
  async expectTitle(title: string | RegExp) {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * URL 확인
   */
  async expectURL(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }

  /**
   * 요소가 보이는지 확인
   */
  async expectVisible(selector: string | Locator) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator).toBeVisible();
  }

  /**
   * 요소가 숨겨져 있는지 확인
   */
  async expectHidden(selector: string | Locator) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator).toBeHidden();
  }

  /**
   * 텍스트가 포함되어 있는지 확인
   */
  async expectText(selector: string | Locator, text: string | RegExp) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator).toContainText(text);
  }

  /**
   * 요소 클릭
   */
  async click(selector: string | Locator) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.click();
  }

  /**
   * 텍스트 입력
   */
  async fill(selector: string | Locator, text: string) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.fill(text);
  }

  /**
   * 체크박스/라디오 버튼 체크
   */
  async check(selector: string | Locator) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.check();
  }

  /**
   * 선택 (select 요소)
   */
  async selectOption(selector: string | Locator, value: string) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.selectOption(value);
  }

  /**
   * 요소가 나타날 때까지 대기
   */
  async waitForSelector(selector: string, options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' }) {
    await this.page.waitForSelector(selector, options || {});
  }

  /**
   * 특정 시간 대기 (가능하면 사용하지 않기)
   */
  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * 네트워크 요청 대기
   */
  async waitForRequest(urlPattern: string | RegExp) {
    return await this.page.waitForRequest(urlPattern);
  }

  /**
   * 네트워크 응답 대기
   */
  async waitForResponse(urlPattern: string | RegExp, options?: { timeout?: number }) {
    return await this.page.waitForResponse(urlPattern, options);
  }

  /**
   * 로딩 상태 대기 (네트워크 요청 완료까지)
   */
  async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle') {
    await this.page.waitForLoadState(state);
  }

  /**
   * 스크린샷 캡처
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * 스크롤 (요소로)
   */
  async scrollToElement(selector: string | Locator) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * 로컬 스토리지 설정
   */
  async setLocalStorage(key: string, value: string) {
    await this.page.evaluate(
      ({ key, value }) => localStorage.setItem(key, value),
      { key, value }
    );
  }

  /**
   * 로컬 스토리지 가져오기
   */
  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate(
      (key) => localStorage.getItem(key),
      key
    );
  }

  /**
   * 로컬 스토리지 초기화
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * 쿠키 설정
   */
  async setCookie(name: string, value: string) {
    await this.page.context().addCookies([
      {
        name,
        value,
        domain: new URL(this.baseURL).hostname,
        path: '/',
      },
    ]);
  }

  /**
   * 쿠키 가져오기
   */
  async getCookie(name: string) {
    const cookies = await this.page.context().cookies();
    return cookies.find((cookie) => cookie.name === name);
  }

  /**
   * 쿠키 삭제
   */
  async clearCookies() {
    await this.page.context().clearCookies();
  }

  /**
   * 페이지 리로드
   */
  async reload() {
    await this.page.reload();
  }

  /**
   * 뒤로 가기
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * 앞으로 가기
   */
  async goForward() {
    await this.page.goForward();
  }

  /**
   * 새 탭/창에서 열기
   */
  async openNewTab(url: string) {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.evaluate((url) => window.open(url), url),
    ]);
    return newPage;
  }

  /**
   * 콘솔 메시지 수집
   */
  setupConsoleListener() {
    const messages: string[] = [];
    this.page.on('console', (msg) => messages.push(msg.text()));
    return messages;
  }

  /**
   * 네트워크 에러 수집
   */
  setupNetworkErrorListener() {
    const errors: string[] = [];
    this.page.on('requestfailed', (request) => {
      errors.push(`${request.url()} ${request.failure()?.errorText}`);
    });
    return errors;
  }
}
