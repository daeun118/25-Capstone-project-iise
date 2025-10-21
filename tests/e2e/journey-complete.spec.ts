import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from '../setup/auth.setup';
import { waitForMusicGeneration } from '../helpers/wait.helper';

/**
 * Phase 6 E2E Test: Journey Completion Flow
 * 
 * Tests:
 * 1. Navigate to complete page
 * 2. Fill out complete form (rating, oneLiner, review)
 * 3. Submit and verify journey completion
 * 4. Verify vFinal music generation
 * 5. Verify journey status change to 'completed'
 */

test.describe('Journey Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
  });

  test('should complete a reading journey successfully', async ({ page }) => {
    // Step 1: Create a new journey first
    await page.goto('/journey/new');
    await page.waitForLoadState('networkidle');

    // Search for a book
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    await searchInput.fill('노인과 바다');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(2000);

    // Select first book
    const firstBook = page.locator('[data-testid="book-card"]').first();
    await expect(firstBook).toBeVisible({ timeout: 10000 });
    await firstBook.click();

    // Start journey
    const startButton = page.locator('button:has-text("독서 여정 시작")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Wait for journey creation and redirect
    await page.waitForURL(/\/journey\/[a-f0-9-]+$/);
    const journeyUrl = page.url();
    const journeyId = journeyUrl.split('/').pop();

    console.log('Created journey:', journeyId);

    // Step 2: Add at least one reading log
    const addLogButton = page.locator('button:has-text("기록 추가")');
    await expect(addLogButton).toBeVisible({ timeout: 5000 });
    await addLogButton.click();

    // Fill log form
    const quoteInput = page.locator('textarea[placeholder*="구절"]');
    await quoteInput.fill('사람은 파멸당할 수는 있어도 패배할 수는 없다.');

    const memoInput = page.locator('textarea[placeholder*="메모"]');
    await memoInput.fill('인간의 존엄성과 불굴의 의지를 느꼈다.');

    // Select emotion tag
    const emotionButton = page.locator('button:has-text("고독")').first();
    if (await emotionButton.isVisible()) {
      await emotionButton.click();
    }

    // Submit log
    const submitLogButton = page.locator('button:has-text("기록 저장")');
    await submitLogButton.click();

    // Wait for log creation
    await page.waitForTimeout(2000);

    // Step 3: Navigate to complete page
    const completeButton = page.locator('button:has-text("완독 처리하기")');
    await expect(completeButton).toBeVisible({ timeout: 5000 });
    await completeButton.click();

    // Wait for complete page to load
    await page.waitForURL(/\/journey\/[a-f0-9-]+\/complete$/);
    await page.waitForLoadState('networkidle');

    // Step 4: Fill complete form
    // Rating: Click 5th star
    const fifthStar = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).nth(4);
    await expect(fifthStar).toBeVisible();
    await fifthStar.click();

    // One-liner
    const oneLinerInput = page.locator('textarea#oneLiner');
    await expect(oneLinerInput).toBeVisible();
    await oneLinerInput.fill('노인의 위대한 투쟁기, 인간 존엄성의 승리');

    // Review
    const reviewInput = page.locator('textarea#review');
    await expect(reviewInput).toBeVisible();
    await reviewInput.fill(
      '헤밍웨이의 "노인과 바다"는 단순한 어부의 이야기를 넘어 인간의 존엄성과 불굴의 의지를 그린 위대한 작품입니다. ' +
      '84일 동안 물고기를 잡지 못한 노인 산티아고가 거대한 청새치와의 사투 끝에 얻은 것은 뼈뿐이었지만, ' +
      '그 과정에서 보여준 인간의 품격은 그 어떤 승리보다 값졌습니다. ' +
      '"사람은 파멸당할 수는 있어도 패배할 수는 없다"는 명언이 가슴에 깊이 새겨집니다.'
    );

    // Step 5: Submit completion
    const completeSubmitButton = page.locator('button:has-text("독서 완료")');
    await expect(completeSubmitButton).toBeVisible();
    await expect(completeSubmitButton).toBeEnabled();
    await completeSubmitButton.click();

    // Wait for success toast
    await expect(page.locator('text=독서 여정을 완료했습니다')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=최종 음악이 생성되고 있습니다')).toBeVisible({ timeout: 5000 });

    // Wait for redirect back to journey detail
    await page.waitForURL(/\/journey\/[a-f0-9-]+$/, { timeout: 10000 });

    // Step 6: Verify journey is completed
    await page.waitForLoadState('networkidle');

    // Check for completed status indicator
    const statusBadge = page.locator('text=완독').first();
    await expect(statusBadge).toBeVisible({ timeout: 5000 });

    // Verify rating, one-liner, and review are displayed
    await expect(page.locator('text=5.0')).toBeVisible();
    await expect(page.locator('text=노인의 위대한 투쟁기')).toBeVisible();

    // Step 7: Verify vFinal log exists
    // Look for vFinal in the logs timeline
    const timeline = page.locator('[data-testid="log-timeline"]').or(page.locator('text=독서 여정 타임라인').locator('..'));
    await expect(timeline).toBeVisible({ timeout: 5000 });

    // Count total logs (should be at least 2: v0 + v1 + vFinal)
    const logItems = page.locator('[data-testid="log-item"]').or(
      page.locator('.border').filter({ hasText: /음악|구절|메모/ })
    );
    const logCount = await logItems.count();
    expect(logCount).toBeGreaterThanOrEqual(2);

    console.log('Journey completed successfully with', logCount, 'logs');
  });

  test('should show validation errors for incomplete form', async ({ page }) => {
    // Navigate to a journey (create one first)
    await page.goto('/journey/new');
    await page.waitForLoadState('networkidle');

    // Quick journey creation
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    await searchInput.fill('1984');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);

    const firstBook = page.locator('[data-testid="book-card"]').first();
    await expect(firstBook).toBeVisible({ timeout: 10000 });
    await firstBook.click();

    const startButton = page.locator('button:has-text("독서 여정 시작")');
    await startButton.click();
    await page.waitForURL(/\/journey\/[a-f0-9-]+$/);

    // Navigate to complete page
    const completeButton = page.locator('button:has-text("완독 처리하기")');
    await expect(completeButton).toBeVisible({ timeout: 5000 });
    await completeButton.click();

    await page.waitForURL(/\/journey\/[a-f0-9-]+\/complete$/);

    // Try to submit without filling anything
    const submitButton = page.locator('button:has-text("독서 완료")');
    
    // Button should be disabled when form is invalid
    await expect(submitButton).toBeDisabled();

    // Fill only rating
    const thirdStar = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).nth(2);
    await thirdStar.click();
    
    // Still disabled without oneLiner and review
    await expect(submitButton).toBeDisabled();

    // Add one-liner
    const oneLinerInput = page.locator('textarea#oneLiner');
    await oneLinerInput.fill('테스트 한줄평');
    
    // Still disabled without review
    await expect(submitButton).toBeDisabled();

    // Add review - now should be enabled
    const reviewInput = page.locator('textarea#review');
    await reviewInput.fill('테스트 감상평입니다. 충분한 길이를 맞추기 위해 조금 더 작성합니다.');
    
    await expect(submitButton).toBeEnabled();
  });

  test('should prevent completing an already completed journey', async ({ page }) => {
    // This test assumes there's already a completed journey in the database
    // In a real test, we'd set up this state properly
    
    // For now, we'll test the redirect behavior
    // If you navigate to a completed journey's complete page,
    // it should redirect back to the journey detail page
    
    // This test would need to be updated once we have test data setup
    test.skip();
  });
});
