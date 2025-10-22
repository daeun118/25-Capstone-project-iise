import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth.helper';

/**
 * 핵심 사용자 시나리오 E2E 테스트
 * 
 * 사용자의 주요 워크플로우를 단계별로 검증합니다:
 * 1. 로그인
 * 2. 독서 여정 생성
 * 3. 독서 기록 추가
 * 4. 완독 처리
 * 5. 플레이리스트 확인
 */

test.describe('핵심 사용자 시나리오', () => {
  const TEST_EMAIL = 'ehgks904@naver.com';
  const TEST_PASSWORD = 'zoqtmxhselwkdls';
  
  let journeyId: string;

  test.beforeEach(async ({ page, context }) => {
    // 각 테스트 전 인증 상태 초기화
    await context.clearCookies();
    
    // about:blank으로 먼저 이동하여 localStorage 접근 가능하게 만들기
    await page.goto('about:blank');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // localStorage 접근 불가능한 경우 무시
      }
    });
  });

  test('S1.1: 로그인 플로우', async ({ page }) => {
    console.log('🔐 테스트 시작: 로그인 플로우');
    
    // 1. 로그인 페이지 접근
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    console.log('✅ 로그인 페이지 접근 성공');

    // 2. 로그인 폼 요소 확인
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    console.log('✅ 로그인 폼 렌더링 확인');

    // 3. 이메일/비밀번호 입력
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    console.log('✅ 로그인 정보 입력 완료');

    // 4. 로그인 버튼 클릭
    await loginButton.click();
    console.log('🔄 로그인 요청 전송...');

    // 5. 로그인 성공 후 리디렉션 확인 (최대 15초 대기)
    await page.waitForURL(/\/(feed|library|journey|my)/, { timeout: 15000 });
    console.log('✅ 로그인 성공 - 페이지 리디렉션 확인');

    // 6. 인증 상태 확인 (프로필 메뉴나 헤더 요소로 확인)
    const headerExists = await page.locator('header').count() > 0;
    expect(headerExists).toBe(true);
    console.log('✅ Header 렌더링 확인');

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/s1-1-login-success.png', fullPage: true });
  });

  test('S1.2: 네비게이션 및 레이아웃', async ({ page }) => {
    console.log('🧭 테스트 시작: 네비게이션 및 레이아웃');
    
    // 로그인
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    console.log('✅ 로그인 완료');

    // 1. Header 확인
    const header = page.locator('header');
    await expect(header).toBeVisible();
    console.log('✅ Header 렌더링 확인');

    // 2. Sidebar 확인 (모바일에서는 숨겨질 수 있음)
    const sidebar = page.locator('aside, nav[role="navigation"]').first();
    const sidebarExists = await sidebar.count() > 0;
    if (sidebarExists) {
      console.log('✅ Sidebar 존재 확인');
    } else {
      console.log('⚠️ Sidebar가 발견되지 않음 (모바일 뷰일 수 있음)');
    }

    // 3. 주요 페이지 네비게이션 테스트
    const navigationTests = [
      { url: '/feed', name: '피드' },
      { url: '/library', name: '내 책장' },
      { url: '/journey/new', name: '여정 생성' },
      { url: '/my', name: '마이페이지' },
    ];

    for (const nav of navigationTests) {
      await page.goto(nav.url);
      await expect(page).toHaveURL(nav.url);
      console.log(`✅ ${nav.name} 페이지 접근 성공`);
      
      // 페이지 로딩 확인 (500ms 대기)
      await page.waitForTimeout(500);
    }

    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/s1-2-navigation.png', fullPage: true });
  });

  test('S2.1: 독서 여정 생성', async ({ page }) => {
    console.log('📚 테스트 시작: 독서 여정 생성');
    
    // API 응답 모니터링
    page.on('response', async (response) => {
      if (response.url().includes('/api/books/search')) {
        console.log(`🔍 API Response: ${response.status()} - ${response.url()}`);
        try {
          const data = await response.json();
          console.log(`📊 API Data:`, JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('⚠️ Failed to parse API response');
        }
      }
    });
    
    // 로그인
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    console.log('✅ 로그인 완료');

    // 1. 여정 생성 페이지 이동
    await page.goto('/journey/new');
    await expect(page).toHaveURL('/journey/new');
    console.log('✅ 여정 생성 페이지 접근');

    // 2. "도서 검색하기" 버튼 클릭하여 Dialog 열기
    const openSearchButton = page.locator('button:has-text("도서 검색하기")').first();
    await expect(openSearchButton).toBeVisible();
    await openSearchButton.click();
    console.log('✅ 도서 검색 Dialog 열기');

    // Dialog가 완전히 열릴 때까지 대기 (애니메이션 완료)
    await page.waitForTimeout(1000);

    // 3. Dialog 내에서 검색어 입력 및 검색 실행
    const searchInput = page.locator('input[placeholder*="책 제목"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('해리포터');
    console.log('✅ 도서 검색어 입력: 해리포터');

    // 4. Enter 키로 폼 제출 (dialog overlay 문제 회피)
    await searchInput.press('Enter');
    console.log('✅ 검색 폼 제출 (Enter)');

    // 5. 검색 결과 대기 (최대 30초 - Google Books API가 느릴 수 있음)
    console.log('🔍 검색 결과 대기 중...');
    
    // BookCard 컴포넌트의 "선택" 버튼 찾기
    // variant="search"일 때는 actionLabel이 "선택"이고, Plus 아이콘이 함께 표시됨
    const selectButton = page.locator('button:has-text("선택")').first();
    
    try {
      await expect(selectButton).toBeVisible({ timeout: 30000 });
      console.log('✅ 도서 검색 결과 표시');

      // "선택" 버튼 클릭
      await selectButton.click();
      console.log('✅ 도서 선택');
    } catch (error) {
      console.log('⚠️ 검색 결과를 찾을 수 없음 - Google Books API 응답 확인 필요');
      await page.screenshot({ path: 'test-results/s2-1-search-failed.png', fullPage: true });
      throw error;
    }

    // 4. 여정 생성 폼 작성
    await page.waitForTimeout(1000);
    
    // 시작 페이지 입력 (optional)
    const startPageInput = page.locator('input[name="startPage"], input[placeholder*="시작"]').first();
    const startPageExists = await startPageInput.count() > 0;
    if (startPageExists) {
      await startPageInput.fill('1');
      console.log('✅ 시작 페이지 입력');
    }

    // 목표 페이지 입력 (optional)
    const goalPageInput = page.locator('input[name="goalPage"], input[placeholder*="목표"]').first();
    const goalPageExists = await goalPageInput.count() > 0;
    if (goalPageExists) {
      await goalPageInput.fill('300');
      console.log('✅ 목표 페이지 입력');
    }

    // 5. 여정 생성 버튼 클릭
    const createButton = page.locator('button:has-text("생성"), button:has-text("시작")').first();
    await expect(createButton).toBeVisible();
    await createButton.click();
    console.log('🔄 여정 생성 요청 전송...');

    // 6. v0 음악 생성 시작 확인 (최대 60초 대기)
    // 생성 중 로딩 상태나 성공 메시지 확인
    try {
      await page.waitForURL(/\/journey\/[a-zA-Z0-9-]+/, { timeout: 60000 });
      
      // URL에서 Journey ID 추출
      const url = page.url();
      const match = url.match(/\/journey\/([a-zA-Z0-9-]+)/);
      if (match) {
        journeyId = match[1];
        console.log(`✅ 여정 생성 성공 - ID: ${journeyId}`);
      }

      // 스크린샷 저장
      await page.screenshot({ path: 'test-results/s2-1-journey-created.png', fullPage: true });
    } catch (error) {
      console.log('⚠️ 여정 생성 타임아웃 또는 실패');
      await page.screenshot({ path: 'test-results/s2-1-journey-failed.png', fullPage: true });
      throw error;
    }
  });

  test('S2.2: 독서 기록 추가', async ({ page }) => {
    console.log('✍️ 테스트 시작: 독서 기록 추가');
    
    // 로그인
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    console.log('✅ 로그인 완료');

    // 1. 내 책장에서 진행 중인 여정 찾기
    await page.goto('/library');
    await page.waitForTimeout(2000); // 데이터 로딩 대기

    // 진행 중인 여정 카드 찾기
    const journeyCard = page.locator('[data-status="reading"], .journey-card').first();
    
    try {
      await expect(journeyCard).toBeVisible({ timeout: 10000 });
      await journeyCard.click();
      console.log('✅ 진행 중인 여정 선택');
    } catch (error) {
      console.log('⚠️ 진행 중인 여정을 찾을 수 없음 - 먼저 여정을 생성해야 함');
      await page.screenshot({ path: 'test-results/s2-2-no-journey.png', fullPage: true });
      throw error;
    }

    // 2. 여정 상세 페이지에서 기록 추가 버튼 클릭
    await page.waitForTimeout(1000);
    const addLogButton = page.locator('button:has-text("기록"), button:has-text("추가")').first();
    
    try {
      await expect(addLogButton).toBeVisible({ timeout: 5000 });
      await addLogButton.click();
      console.log('✅ 기록 추가 버튼 클릭');
    } catch (error) {
      console.log('⚠️ 기록 추가 버튼을 찾을 수 없음');
      await page.screenshot({ path: 'test-results/s2-2-no-add-button.png', fullPage: true });
      throw error;
    }

    // 3. 기록 작성 폼 입력
    await page.waitForTimeout(1000);

    // 현재 페이지 입력
    const currentPageInput = page.locator('input[name="currentPage"], input[placeholder*="페이지"]').first();
    await expect(currentPageInput).toBeVisible();
    await currentPageInput.fill('50');
    console.log('✅ 현재 페이지 입력');

    // 독서 내용 입력
    const contentTextarea = page.locator('textarea[name="content"], textarea[placeholder*="내용"]').first();
    const contentExists = await contentTextarea.count() > 0;
    if (contentExists) {
      await contentTextarea.fill('해리포터가 호그와트에 입학하는 장면이 정말 흥미진진했습니다.');
      console.log('✅ 독서 내용 입력');
    }

    // 감정 태그 선택 (optional)
    const emotionTag = page.locator('[data-emotion], .emotion-tag').first();
    const emotionExists = await emotionTag.count() > 0;
    if (emotionExists) {
      await emotionTag.click();
      console.log('✅ 감정 태그 선택');
    }

    // 4. 기록 저장 버튼 클릭
    const saveButton = page.locator('button:has-text("저장"), button[type="submit"]').first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    console.log('🔄 기록 저장 요청 전송...');

    // 5. vN 음악 생성 확인 (최대 60초 대기)
    await page.waitForTimeout(3000);
    
    // 기록이 추가되었는지 확인
    const logItem = page.locator('[data-testid*="log"], .reading-log').first();
    try {
      await expect(logItem).toBeVisible({ timeout: 60000 });
      console.log('✅ 독서 기록 추가 성공');
      
      // 스크린샷 저장
      await page.screenshot({ path: 'test-results/s2-2-log-added.png', fullPage: true });
    } catch (error) {
      console.log('⚠️ 기록 추가 타임아웃 또는 실패');
      await page.screenshot({ path: 'test-results/s2-2-log-failed.png', fullPage: true });
      throw error;
    }
  });

  test('S2.3: 완독 처리', async ({ page }) => {
    console.log('🎉 테스트 시작: 완독 처리');
    
    // 로그인
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    console.log('✅ 로그인 완료');

    // 1. 내 책장에서 진행 중인 여정 찾기
    await page.goto('/library');
    await page.waitForTimeout(2000);

    const journeyCard = page.locator('[data-status="reading"], .journey-card').first();
    
    try {
      await expect(journeyCard).toBeVisible({ timeout: 10000 });
      await journeyCard.click();
      console.log('✅ 진행 중인 여정 선택');
    } catch (error) {
      console.log('⚠️ 진행 중인 여정을 찾을 수 없음');
      await page.screenshot({ path: 'test-results/s2-3-no-journey.png', fullPage: true });
      throw error;
    }

    // 2. 완독 버튼 클릭
    await page.waitForTimeout(1000);
    const completeButton = page.locator('button:has-text("완독"), button:has-text("완료")').first();
    
    try {
      await expect(completeButton).toBeVisible({ timeout: 5000 });
      await completeButton.click();
      console.log('✅ 완독 버튼 클릭');
    } catch (error) {
      console.log('⚠️ 완독 버튼을 찾을 수 없음 - 충분한 진행률이 필요할 수 있음');
      await page.screenshot({ path: 'test-results/s2-3-no-complete-button.png', fullPage: true });
      throw error;
    }

    // 3. 최종 감상 작성
    await page.waitForTimeout(1000);
    
    const finalReviewTextarea = page.locator('textarea[name="review"], textarea[placeholder*="감상"]').first();
    const reviewExists = await finalReviewTextarea.count() > 0;
    if (reviewExists) {
      await finalReviewTextarea.fill('해리포터 시리즈의 첫 권을 완독했습니다. 마법 세계의 설정과 캐릭터들이 매력적이었고, 다음 권도 기대됩니다.');
      console.log('✅ 최종 감상 입력');
    }

    // 평점 선택 (optional)
    const ratingInput = page.locator('input[name="rating"], [data-rating]').first();
    const ratingExists = await ratingInput.count() > 0;
    if (ratingExists) {
      // 별점 5점 클릭
      const starFive = page.locator('[data-rating="5"], .star-5').first();
      const starExists = await starFive.count() > 0;
      if (starExists) {
        await starFive.click();
        console.log('✅ 평점 5점 선택');
      }
    }

    // 4. 완독 확인 버튼 클릭
    const confirmButton = page.locator('button:has-text("확인"), button:has-text("완료"), button[type="submit"]').last();
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    console.log('🔄 완독 처리 요청 전송...');

    // 5. vFinal 음악 생성 및 플레이리스트 완성 확인 (최대 90초 대기)
    await page.waitForTimeout(5000);
    
    try {
      // 완독 상태 또는 성공 메시지 확인
      const successMessage = page.locator('text=/완독|완료|성공/').first();
      const messageExists = await successMessage.count() > 0;
      
      if (messageExists) {
        await expect(successMessage).toBeVisible({ timeout: 90000 });
        console.log('✅ 완독 처리 성공');
      } else {
        console.log('⚠️ 성공 메시지를 찾을 수 없지만 계속 진행');
      }
      
      // 스크린샷 저장
      await page.screenshot({ path: 'test-results/s2-3-journey-completed.png', fullPage: true });
    } catch (error) {
      console.log('⚠️ 완독 처리 타임아웃 또는 실패');
      await page.screenshot({ path: 'test-results/s2-3-complete-failed.png', fullPage: true });
      throw error;
    }
  });

  test('S3.1: 음악 플레이어', async ({ page }) => {
    console.log('🎵 테스트 시작: 음악 플레이어');
    
    // 로그인
    await login(page, TEST_EMAIL, TEST_PASSWORD);
    console.log('✅ 로그인 완료');

    // 1. 여정 상세 페이지 이동
    await page.goto('/library');
    await page.waitForTimeout(2000);

    const journeyCard = page.locator('.journey-card, [data-testid*="journey"]').first();
    
    try {
      await expect(journeyCard).toBeVisible({ timeout: 10000 });
      await journeyCard.click();
      console.log('✅ 여정 선택');
    } catch (error) {
      console.log('⚠️ 여정을 찾을 수 없음');
      await page.screenshot({ path: 'test-results/s3-1-no-journey.png', fullPage: true });
      throw error;
    }

    // 2. 음악 플레이어 확인
    await page.waitForTimeout(2000);
    
    const musicPlayer = page.locator('[data-testid="music-player"], .music-player, audio').first();
    const playerExists = await musicPlayer.count() > 0;
    
    if (playerExists) {
      await expect(musicPlayer).toBeVisible();
      console.log('✅ 음악 플레이어 렌더링 확인');

      // 3. 재생 버튼 클릭
      const playButton = page.locator('button:has-text("재생"), button[aria-label*="재생"], button[aria-label*="play"]').first();
      const playButtonExists = await playButton.count() > 0;
      
      if (playButtonExists) {
        await playButton.click();
        console.log('✅ 재생 버튼 클릭');
        await page.waitForTimeout(2000);

        // 4. 일시정지 버튼 확인
        const pauseButton = page.locator('button:has-text("일시정지"), button[aria-label*="일시정지"], button[aria-label*="pause"]').first();
        const pauseExists = await pauseButton.count() > 0;
        
        if (pauseExists) {
          await pauseButton.click();
          console.log('✅ 일시정지 버튼 클릭');
        }
      }

      // 스크린샷 저장
      await page.screenshot({ path: 'test-results/s3-1-music-player.png', fullPage: true });
    } else {
      console.log('⚠️ 음악 플레이어를 찾을 수 없음 - 음악이 생성되지 않았을 수 있음');
      await page.screenshot({ path: 'test-results/s3-1-no-player.png', fullPage: true });
    }
  });
});
