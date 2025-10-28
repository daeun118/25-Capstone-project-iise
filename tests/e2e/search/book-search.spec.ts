import { test, expect } from '@playwright/test';
import { BookSearchPage } from '../../pages/search/book-search.page';

test.describe('도서 검색 기능', () => {
  let bookSearchPage: BookSearchPage;

  test.beforeEach(async ({ page }) => {
    bookSearchPage = new BookSearchPage(page);
    await page.goto('/');
  });

  test('홈페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/ReadTune/);
  });

  test('헤더에 검색 입력창이 표시된다', async ({ page }) => {
    await expect(bookSearchPage.searchInput).toBeVisible();
  });

  test('검색어 입력 및 검색이 가능하다', async ({ page }) => {
    // 검색어 입력
    await bookSearchPage.searchInput.fill('노인과 바다');
    await expect(bookSearchPage.searchInput).toHaveValue('노인과 바다');

    // Enter로 검색
    await bookSearchPage.searchInput.press('Enter');

    // 검색 결과 로딩 대기
    await page.waitForTimeout(2000);
  });

  test.skip('유효한 검색어로 검색 시 결과가 표시된다', async ({ page }) => {
    await bookSearchPage.searchBook('노인과 바다');

    // 검색 결과 확인
    await bookSearchPage.expectSearchResults();

    const count = await bookSearchPage.getSearchResultsCount();
    expect(count).toBeGreaterThan(0);
  });

  test.skip('검색 결과에서 도서를 선택할 수 있다', async ({ page }) => {
    await bookSearchPage.searchBook('어린 왕자');
    await bookSearchPage.expectSearchResults();

    // 첫 번째 도서 선택
    await bookSearchPage.selectFirstBook();

    // 페이지 이동 확인 (여정 생성 페이지 또는 상세 페이지)
    await page.waitForURL(/journey|book/, { timeout: 5000 });
  });

  test.skip('존재하지 않는 도서 검색 시 결과 없음 메시지가 표시된다', async ({ page }) => {
    await bookSearchPage.searchBook('xyzabc123nonexistentbook999');
    await bookSearchPage.expectNoResults();
  });

  test('네비게이션 링크들이 작동한다', async ({ page }) => {
    // 헤더의 피드 링크 확인 (role-based selector 사용)
    const feedLink = page.getByRole('link', { name: '피드', exact: true });
    await expect(feedLink).toBeVisible();

    // 피드 링크 클릭 시 /feed로 이동하는지 확인
    await feedLink.click();
    await expect(page).toHaveURL('/feed');
  });
});
