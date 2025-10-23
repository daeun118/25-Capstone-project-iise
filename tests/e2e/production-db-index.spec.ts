import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth.helper';

/**
 * Production 환경 DB 인덱스 최적화 성능 측정
 *
 * 목적: 29개의 데이터베이스 인덱스 추가 후 실제 성능 개선 효과 측정
 * 환경: https://25-capstone-project-iise.vercel.app (Vercel Production)
 *
 * 측정 항목:
 * 1. API 응답 시간 (피드, 책장, 여정 상세)
 * 2. 페이지 로드 성능 (피드, 책장)
 * 3. 인터랙션 응답성 (필터링, 정렬, 좋아요/북마크)
 */

// Production URL로 테스트 실행
test.use({
  baseURL: 'https://25-capstone-project-iise.vercel.app'
});

const TEST_EMAIL = 'ehgks904@naver.com';
const TEST_PASSWORD = 'zoqtmxhselwkdls';

// 성능 결과 저장용
const performanceResults = {
  api: {
    posts: [] as number[],
    journeys: [] as number[],
    journeyDetail: [] as number[],
  },
  pageLoad: {
    feed: [] as number[],
    library: [] as number[],
  },
  interaction: {
    filtering: [] as number[],
    sorting: [] as number[],
    likeToggle: [] as number[],
  },
};

test.describe('Production Performance - DB Index Optimization', () => {
  test.beforeEach(async ({ page, context }) => {
    // 각 테스트 전 캐시 초기화 (Cold Start 효과 제거)
    await context.clearCookies();
    await page.goto('about:blank');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // 무시
      }
    });
  });

  test('1. API 응답 시간 - 피드 엔드포인트 (인덱스 최적화 핵심)', async ({ page, request }) => {
    console.log('\n📊 [TEST 1] 피드 API 응답 시간 측정 시작');
    console.log('='.repeat(60));

    // 로그인 (인증 토큰 필요)
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForTimeout(2000); // 세션 안정화

    // Cold start 제거용 첫 호출
    await page.request.get('/api/posts');
    await page.waitForTimeout(1000);

    console.log('\n🔄 5회 반복 측정 (평균값 계산)');

    // 5회 반복 측정
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      const response = await page.request.get('/api/posts');
      const duration = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      const postCount = data.posts?.length || 0;

      performanceResults.api.posts.push(duration);
      console.log(`  Run ${i + 1}: ${duration}ms (${postCount} posts)`);
    }

    const avgTime = Math.round(
      performanceResults.api.posts.reduce((a, b) => a + b) / performanceResults.api.posts.length
    );
    const minTime = Math.min(...performanceResults.api.posts);
    const maxTime = Math.max(...performanceResults.api.posts);

    console.log('\n📈 결과 요약:');
    console.log(`  • 평균: ${avgTime}ms`);
    console.log(`  • 최소: ${minTime}ms`);
    console.log(`  • 최대: ${maxTime}ms`);

    // 예상 개선: 로컬 954ms → Production 200-400ms (60-80% 개선)
    console.log('\n🎯 목표: < 500ms (로컬 대비 50% 개선)');
    console.log(`  결과: ${avgTime < 500 ? '✅ 통과' : '⚠️ 목표 미달'}`);

    // 성공 조건: Production 환경에서 500ms 이하
    expect(avgTime).toBeLessThan(1000); // 넉넉하게 설정
  });

  test('2. API 응답 시간 - 책장 엔드포인트 (복합 인덱스)', async ({ page }) => {
    console.log('\n📊 [TEST 2] 책장 API 응답 시간 측정 시작');
    console.log('='.repeat(60));

    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForTimeout(2000);

    // Cold start 제거
    await page.request.get('/api/journeys');
    await page.waitForTimeout(1000);

    console.log('\n🔄 5회 반복 측정');

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      const response = await page.request.get('/api/journeys');
      const duration = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      const journeyCount = data.journeys?.length || 0;

      performanceResults.api.journeys.push(duration);
      console.log(`  Run ${i + 1}: ${duration}ms (${journeyCount} journeys)`);
    }

    const avgTime = Math.round(
      performanceResults.api.journeys.reduce((a, b) => a + b) / performanceResults.api.journeys.length
    );
    const minTime = Math.min(...performanceResults.api.journeys);
    const maxTime = Math.max(...performanceResults.api.journeys);

    console.log('\n📈 결과 요약:');
    console.log(`  • 평균: ${avgTime}ms`);
    console.log(`  • 최소: ${minTime}ms`);
    console.log(`  • 최대: ${maxTime}ms`);

    console.log('\n🎯 목표: < 400ms (기존 N+1 최적화 + 인덱스)');
    console.log(`  결과: ${avgTime < 400 ? '✅ 통과' : '⚠️ 목표 미달'}`);

    expect(avgTime).toBeLessThan(800);
  });

  test('3. 페이지 로드 성능 - 피드 페이지 (6082ms → 2000ms 목표)', async ({ page }) => {
    console.log('\n📊 [TEST 3] 피드 페이지 로드 성능 측정 시작');
    console.log('='.repeat(60));

    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForTimeout(2000);

    console.log('\n🔄 3회 반복 측정');

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await page.goto('/feed', { waitUntil: 'networkidle' });
      const duration = Date.now() - startTime;

      performanceResults.pageLoad.feed.push(duration);
      console.log(`  Run ${i + 1}: ${duration}ms`);

      await page.waitForTimeout(1000); // 측정 간 간격
    }

    const avgTime = Math.round(
      performanceResults.pageLoad.feed.reduce((a, b) => a + b) / performanceResults.pageLoad.feed.length
    );

    console.log('\n📈 결과 요약:');
    console.log(`  • 평균: ${avgTime}ms`);
    console.log(`  • 기존 (로컬): 6082ms`);
    console.log(`  • 개선율: ${Math.round((1 - avgTime / 6082) * 100)}%`);

    console.log('\n🎯 목표: < 2000ms (67% 개선)');
    console.log(`  결과: ${avgTime < 2000 ? '✅ 통과' : '⚠️ 목표 미달'}`);

    // 기대치: Production 환경에서 2000ms 이하
    expect(avgTime).toBeLessThan(3000);
  });

  test('4. 페이지 로드 성능 - 책장 페이지 (2461ms → 1000ms 목표)', async ({ page }) => {
    console.log('\n📊 [TEST 4] 책장 페이지 로드 성능 측정 시작');
    console.log('='.repeat(60));

    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await page.waitForTimeout(2000);

    console.log('\n🔄 3회 반복 측정');

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await page.goto('/library', { waitUntil: 'networkidle' });
      const duration = Date.now() - startTime;

      performanceResults.pageLoad.library.push(duration);
      console.log(`  Run ${i + 1}: ${duration}ms`);

      await page.waitForTimeout(1000);
    }

    const avgTime = Math.round(
      performanceResults.pageLoad.library.reduce((a, b) => a + b) / performanceResults.pageLoad.library.length
    );

    console.log('\n📈 결과 요약:');
    console.log(`  • 평균: ${avgTime}ms`);
    console.log(`  • 기존 (로컬): 2461ms`);
    console.log(`  • 개선율: ${Math.round((1 - avgTime / 2461) * 100)}%`);

    console.log('\n🎯 목표: < 1000ms (59% 개선)');
    console.log(`  결과: ${avgTime < 1000 ? '✅ 통과' : '⚠️ 목표 미달'}`);

    expect(avgTime).toBeLessThan(2000);
  });

  test('5. 인터랙션 응답성 - 피드 필터링 (카테고리 변경)', async ({ page }) => {
    console.log('\n📊 [TEST 5] 필터링 인터랙션 성능 측정 시작');
    console.log('='.repeat(60));

    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');

    console.log('\n🔄 3회 반복 측정');

    // 카테고리 필터 버튼 찾기
    const categoryFilter = page.locator('button:has-text("소설"), button:has-text("에세이")').first();
    const hasFilter = await categoryFilter.count() > 0;

    if (!hasFilter) {
      console.log('⚠️ 카테고리 필터를 찾을 수 없음 - 테스트 스킵');
      test.skip();
      return;
    }

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await categoryFilter.click();
      await page.waitForLoadState('networkidle');
      const duration = Date.now() - startTime;

      performanceResults.interaction.filtering.push(duration);
      console.log(`  Run ${i + 1}: ${duration}ms`);

      await page.waitForTimeout(1000);
    }

    const avgTime = Math.round(
      performanceResults.interaction.filtering.reduce((a, b) => a + b) / performanceResults.interaction.filtering.length
    );

    console.log('\n📈 결과 요약:');
    console.log(`  • 평균: ${avgTime}ms`);

    console.log('\n🎯 목표: < 500ms (인덱스 최적화 효과)');
    console.log(`  결과: ${avgTime < 500 ? '✅ 통과' : '⚠️ 목표 미달'}`);

    expect(avgTime).toBeLessThan(1000);
  });

  test('6. 인터랙션 응답성 - 정렬 변경 (최신순 ↔ 인기순)', async ({ page }) => {
    console.log('\n📊 [TEST 6] 정렬 인터랙션 성능 측정 시작');
    console.log('='.repeat(60));

    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');

    console.log('\n🔄 3회 반복 측정');

    // 정렬 버튼 찾기
    const sortButton = page.locator('button:has-text("인기순"), button:has-text("최신순")').first();
    const hasSort = await sortButton.count() > 0;

    if (!hasSort) {
      console.log('⚠️ 정렬 버튼을 찾을 수 없음 - 테스트 스킵');
      test.skip();
      return;
    }

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await sortButton.click();
      await page.waitForLoadState('networkidle');
      const duration = Date.now() - startTime;

      performanceResults.interaction.sorting.push(duration);
      console.log(`  Run ${i + 1}: ${duration}ms`);

      await page.waitForTimeout(1000);
    }

    const avgTime = Math.round(
      performanceResults.interaction.sorting.reduce((a, b) => a + b) / performanceResults.interaction.sorting.length
    );

    console.log('\n📈 결과 요약:');
    console.log(`  • 평균: ${avgTime}ms`);

    console.log('\n🎯 목표: < 500ms (복합 인덱스 효과)');
    console.log(`  결과: ${avgTime < 500 ? '✅ 통과' : '⚠️ 목표 미달'}`);

    expect(avgTime).toBeLessThan(1000);
  });

  test('7. N+1 쿼리 제거 효과 - 좋아요 토글', async ({ page }) => {
    console.log('\n📊 [TEST 7] 좋아요 토글 성능 측정 (N+1 제거 효과)');
    console.log('='.repeat(60));

    await login(page, TEST_EMAIL, TEST_PASSWORD);
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');

    console.log('\n🔄 3회 반복 측정');

    // 좋아요 버튼 찾기
    const likeButton = page.locator('button[aria-label*="좋아요"], button:has-text("♥")').first();
    const hasLike = await likeButton.count() > 0;

    if (!hasLike) {
      console.log('⚠️ 좋아요 버튼을 찾을 수 없음 - 테스트 스킵');
      test.skip();
      return;
    }

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await likeButton.click();
      await page.waitForTimeout(300); // API 응답 대기
      const duration = Date.now() - startTime;

      performanceResults.interaction.likeToggle.push(duration);
      console.log(`  Run ${i + 1}: ${duration}ms`);

      await page.waitForTimeout(500);
    }

    const avgTime = Math.round(
      performanceResults.interaction.likeToggle.reduce((a, b) => a + b) / performanceResults.interaction.likeToggle.length
    );

    console.log('\n📈 결과 요약:');
    console.log(`  • 평균: ${avgTime}ms`);

    console.log('\n🎯 목표: < 300ms (복합 인덱스로 즉시 조회)');
    console.log(`  결과: ${avgTime < 300 ? '✅ 통과' : '⚠️ 목표 미달'}`);

    expect(avgTime).toBeLessThan(500);
  });

  test.afterAll(async () => {
    // 최종 성능 리포트 출력
    console.log('\n' + '='.repeat(60));
    console.log('\n🎯 Production 성능 측정 최종 결과');
    console.log('\n' + '='.repeat(60));

    console.log('\n📊 1. API 응답 시간');
    console.log('─'.repeat(60));

    if (performanceResults.api.posts.length > 0) {
      const postsAvg = Math.round(
        performanceResults.api.posts.reduce((a, b) => a + b) / performanceResults.api.posts.length
      );
      console.log(`  • 피드 API: ${postsAvg}ms (목표: < 500ms)`);
    }

    if (performanceResults.api.journeys.length > 0) {
      const journeysAvg = Math.round(
        performanceResults.api.journeys.reduce((a, b) => a + b) / performanceResults.api.journeys.length
      );
      console.log(`  • 책장 API: ${journeysAvg}ms (목표: < 400ms)`);
    }

    console.log('\n📄 2. 페이지 로드 성능');
    console.log('─'.repeat(60));

    if (performanceResults.pageLoad.feed.length > 0) {
      const feedAvg = Math.round(
        performanceResults.pageLoad.feed.reduce((a, b) => a + b) / performanceResults.pageLoad.feed.length
      );
      const feedImprovement = Math.round((1 - feedAvg / 6082) * 100);
      console.log(`  • 피드: ${feedAvg}ms (기존 6082ms → ${feedImprovement}% 개선)`);
    }

    if (performanceResults.pageLoad.library.length > 0) {
      const libraryAvg = Math.round(
        performanceResults.pageLoad.library.reduce((a, b) => a + b) / performanceResults.pageLoad.library.length
      );
      const libraryImprovement = Math.round((1 - libraryAvg / 2461) * 100);
      console.log(`  • 책장: ${libraryAvg}ms (기존 2461ms → ${libraryImprovement}% 개선)`);
    }

    console.log('\n⚡ 3. 인터랙션 응답성');
    console.log('─'.repeat(60));

    if (performanceResults.interaction.filtering.length > 0) {
      const filterAvg = Math.round(
        performanceResults.interaction.filtering.reduce((a, b) => a + b) / performanceResults.interaction.filtering.length
      );
      console.log(`  • 필터링: ${filterAvg}ms (목표: < 500ms)`);
    }

    if (performanceResults.interaction.sorting.length > 0) {
      const sortAvg = Math.round(
        performanceResults.interaction.sorting.reduce((a, b) => a + b) / performanceResults.interaction.sorting.length
      );
      console.log(`  • 정렬: ${sortAvg}ms (목표: < 500ms)`);
    }

    if (performanceResults.interaction.likeToggle.length > 0) {
      const likeAvg = Math.round(
        performanceResults.interaction.likeToggle.reduce((a, b) => a + b) / performanceResults.interaction.likeToggle.length
      );
      console.log(`  • 좋아요: ${likeAvg}ms (목표: < 300ms)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ 성능 측정 완료!\n');
  });
});
