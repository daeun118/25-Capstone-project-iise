import { Page, Locator } from '@playwright/test';

/**
 * 대기 관련 헬퍼 함수들
 *
 * 특정 조건이 만족될 때까지 기다리는 유틸리티들입니다.
 * 고정된 대기(waitForTimeout) 대신 조건부 대기를 사용하세요.
 */

/**
 * 요소가 나타날 때까지 대기
 */
export async function waitForElement(
  page: Page,
  selector: string | Locator,
  options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' }
) {
  const locator = typeof selector === 'string' ? page.locator(selector) : selector;
  await locator.waitFor({
    state: options?.state || 'visible',
    timeout: options?.timeout || 30000,
  });
}

/**
 * 요소가 사라질 때까지 대기
 */
export async function waitForElementToDisappear(
  page: Page,
  selector: string | Locator,
  timeout = 30000
) {
  const locator = typeof selector === 'string' ? page.locator(selector) : selector;
  await locator.waitFor({ state: 'hidden', timeout });
}

/**
 * 텍스트가 포함된 요소가 나타날 때까지 대기
 */
export async function waitForText(
  page: Page,
  text: string | RegExp,
  timeout = 30000
) {
  await page.waitForSelector(
    typeof text === 'string'
      ? `text="${text}"`
      : `text=/${text.source}/`,
    { timeout }
  );
}

/**
 * 로딩 스피너가 사라질 때까지 대기
 */
export async function waitForLoadingToComplete(page: Page, timeout = 30000) {
  try {
    // 로딩 스피너가 먼저 나타나는지 확인
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'visible',
      timeout: 2000,
    });

    // 그 다음 사라질 때까지 대기
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'hidden',
      timeout,
    });
  } catch {
    // 로딩 스피너가 나타나지 않으면 이미 로딩 완료
  }
}

/**
 * 네트워크가 idle 상태가 될 때까지 대기
 */
export async function waitForNetworkIdle(page: Page, timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * URL 변경을 대기
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30000
) {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * 특정 API 응답을 대기
 */
export async function waitForAPI(
  page: Page,
  urlPattern: string | RegExp,
  options?: {
    timeout?: number;
    method?: string;
  }
) {
  return await page.waitForResponse(
    (response) => {
      const matchesUrl = typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url());

      const matchesMethod = options?.method
        ? response.request().method() === options.method
        : true;

      return matchesUrl && matchesMethod;
    },
    { timeout: options?.timeout || 30000 }
  );
}

/**
 * 조건이 만족될 때까지 대기 (커스텀 조건)
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  options?: {
    timeout?: number;
    interval?: number;
    errorMessage?: string;
  }
) {
  const timeout = options?.timeout || 30000;
  const interval = options?.interval || 500;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(
    options?.errorMessage || `Condition not met within ${timeout}ms`
  );
}

/**
 * 음악 생성 완료 대기 (특수 케이스)
 */
export async function waitForMusicGeneration(page: Page, timeout = 60000) {
  // 1. 음악 생성 시작 대기
  await waitForText(page, /음악을 생성하고 있습니다|Generating music/, 5000);

  // 2. API 응답 대기
  await waitForAPI(page, '/api/music/generate', { timeout, method: 'POST' });

  // 3. 음악 플레이어 표시 대기
  await waitForElement(page, '[data-testid="music-player"]', { timeout: 10000 });
}

/**
 * 애니메이션 완료 대기
 */
export async function waitForAnimation(page: Page, selector: string | Locator) {
  const locator = typeof selector === 'string' ? page.locator(selector) : selector;

  // CSS transition/animation이 완료될 때까지 대기
  const element = await locator.elementHandle();
  if (element) {
    await page.evaluate((el) => {
      return Promise.all(
        el.getAnimations().map((animation) => animation.finished)
      );
    }, element);
  }
}

/**
 * 페이지 로드 완료 대기
 */
export async function waitForPageLoad(
  page: Page,
  state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'
) {
  await page.waitForLoadState(state);
}

/**
 * 파일 다운로드 대기
 */
export async function waitForDownload(page: Page, triggerAction: () => Promise<void>) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    triggerAction(),
  ]);
  return download;
}

/**
 * 새 탭/팝업 열림 대기
 */
export async function waitForNewPage(page: Page, triggerAction: () => Promise<void>) {
  const [newPage] = await Promise.all([
    page.context().waitForEvent('page'),
    triggerAction(),
  ]);
  return newPage;
}
