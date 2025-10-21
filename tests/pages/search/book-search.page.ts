import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * 도서 검색 페이지 객체
 *
 * Phase 1, 2 구현: Google Books API 연동 도서 검색
 */
export class BookSearchPage extends BasePage {
  // Locators
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly bookCards: Locator;
  readonly firstBookCard: Locator;
  readonly loadingSpinner: Locator;
  readonly noResultsMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // 셀렉터 정의
    this.searchInput = page.locator('input[placeholder*="검색"], input[type="search"]');
    this.searchButton = page.locator('button:has-text("검색")');
    this.bookCards = page.locator('[data-testid="book-card"]');
    this.firstBookCard = this.bookCards.first();
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.noResultsMessage = page.locator('text=/검색 결과가 없습니다|No results/i');
    this.errorMessage = page.locator('[role="alert"]');
  }

  /**
   * 도서 검색 (헤더 검색창 사용)
   */
  async searchBook(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForSearchResults();
  }

  /**
   * 도서 검색 (검색 버튼 클릭)
   */
  async searchBookWithButton(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForSearchResults();
  }

  /**
   * 검색 결과 로딩 대기
   */
  async waitForSearchResults() {
    // 로딩 스피너가 나타났다가 사라질 때까지 대기
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 2000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    } catch {
      // 로딩 스피너가 너무 빨리 사라져서 못 잡을 수도 있음
    }
  }

  /**
   * 첫 번째 도서 선택
   */
  async selectFirstBook() {
    await this.firstBookCard.click();
  }

  /**
   * n번째 도서 선택
   */
  async selectBookByIndex(index: number) {
    await this.bookCards.nth(index).click();
  }

  /**
   * 특정 제목의 도서 선택
   */
  async selectBookByTitle(title: string) {
    await this.page.locator(`[data-testid="book-card"]:has-text("${title}")`).first().click();
  }

  /**
   * 검색 결과 개수 확인
   */
  async getSearchResultsCount(): Promise<number> {
    return await this.bookCards.count();
  }

  /**
   * 검색 결과가 표시되는지 확인
   */
  async expectSearchResults() {
    await this.expectVisible(this.bookCards.first());
    const count = await this.getSearchResultsCount();
    if (count === 0) {
      throw new Error('No search results found');
    }
  }

  /**
   * 검색 결과가 없는지 확인
   */
  async expectNoResults() {
    await this.expectVisible(this.noResultsMessage);
  }

  /**
   * 검색 에러 확인
   */
  async expectSearchError(message?: string) {
    await this.expectVisible(this.errorMessage);
    if (message) {
      await this.expectText(this.errorMessage, message);
    }
  }

  /**
   * 특정 제목의 도서가 검색 결과에 있는지 확인
   */
  async expectBookInResults(title: string) {
    const bookCard = this.page.locator(`[data-testid="book-card"]:has-text("${title}")`);
    await this.expectVisible(bookCard.first());
  }

  /**
   * 도서 카드의 정보 확인 (제목, 저자 등)
   */
  async getBookInfo(index: number = 0) {
    const card = this.bookCards.nth(index);
    await card.waitFor({ state: 'visible' });

    return {
      title: await card.locator('[data-testid="book-title"]').textContent(),
      author: await card.locator('[data-testid="book-author"]').textContent(),
      cover: await card.locator('img').getAttribute('src'),
    };
  }
}
