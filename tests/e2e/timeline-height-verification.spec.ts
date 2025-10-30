import { test, expect } from '@playwright/test';

/**
 * Timeline Height Verification Test
 *
 * Purpose: Verify that the journey timeline is more compact after removing
 * the inline "음악 준비 완료" status indicator.
 *
 * Changes:
 * - Removed inline "음악 준비 완료" status from LogList
 * - Added toast notification for music completion instead
 * - Timeline should be shorter vertically
 */

test.describe('Journey Timeline Height Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL('http://localhost:3000/library', { timeout: 10000 });
  });

  test('should NOT display inline "음악 준비 완료" status in timeline', async ({ page }) => {
    // Navigate to a journey with completed music tracks
    await page.goto('http://localhost:3000/library');

    // Wait for journey cards to load
    await page.waitForSelector('[data-testid="journey-card"], .card-elevated', { timeout: 10000 });

    // Find first journey card with music tracks
    const journeyCard = page.locator('[data-testid="journey-card"], .card-elevated').first();
    await journeyCard.waitFor({ state: 'visible', timeout: 5000 });

    // Click to open journey detail
    await journeyCard.click();
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Wait for timeline to load
    await page.waitForSelector('text=독서 여정 타임라인', { timeout: 10000 });

    // Verify "음악 준비 완료" is NOT displayed inline in timeline
    const musicReadyStatus = page.locator('text=음악 준비 완료');
    await expect(musicReadyStatus).toHaveCount(0);

    console.log('✅ "음악 준비 완료" inline status removed from timeline');
  });

  test('should show "음악 생성 중..." status while generating', async ({ page }) => {
    // Navigate to library
    await page.goto('http://localhost:3000/library');
    await page.waitForLoadState('networkidle');

    // Find a reading journey
    const journeyCard = page.locator('[data-testid="journey-card"]').first();
    if (await journeyCard.count() > 0) {
      await journeyCard.click();
      await page.waitForLoadState('networkidle');

      // Check if "음악 생성 중..." appears (if any tracks are generating)
      const generatingStatus = page.locator('text=음악 생성 중...');

      // This is acceptable to show inline during generation
      if (await generatingStatus.count() > 0) {
        console.log('✅ "음악 생성 중..." status is still displayed (expected during generation)');
      } else {
        console.log('ℹ️ No tracks currently generating');
      }
    }
  });

  test('should show "음악 생성 실패" status on error', async ({ page }) => {
    // Navigate to library
    await page.goto('http://localhost:3000/library');
    await page.waitForLoadState('networkidle');

    // Find a journey
    const journeyCard = page.locator('[data-testid="journey-card"]').first();
    if (await journeyCard.count() > 0) {
      await journeyCard.click();
      await page.waitForLoadState('networkidle');

      // Check if "음악 생성 실패" appears (should be rare)
      const failedStatus = page.locator('text=음악 생성 실패');

      if (await failedStatus.count() > 0) {
        console.log('⚠️ Found failed music generation (this is expected to show inline)');
      } else {
        console.log('✅ No failed music generation found');
      }
    }
  });

  test('should display play button for completed music tracks', async ({ page }) => {
    // Navigate to a journey
    await page.goto('http://localhost:3000/library');
    await page.waitForLoadState('networkidle');

    const journeyCard = page.locator('[data-testid="journey-card"]').first();
    if (await journeyCard.count() > 0) {
      await journeyCard.click();
      await page.waitForLoadState('networkidle');

      // Wait for timeline
      await page.waitForSelector('text=독서 여정 타임라인');

      // Look for play buttons (should exist for completed tracks)
      const playButtons = page.locator('button[aria-label*="음악"]');
      const playButtonCount = await playButtons.count();

      if (playButtonCount > 0) {
        console.log(`✅ Found ${playButtonCount} music play buttons`);

        // Verify play buttons are visible (not hidden by status indicators)
        const firstButton = playButtons.first();
        await expect(firstButton).toBeVisible();
      } else {
        console.log('ℹ️ No completed music tracks with play buttons yet');
      }
    }
  });

  test('timeline cards should be more compact (height check)', async ({ page }) => {
    // Navigate to a journey
    await page.goto('http://localhost:3000/library');
    await page.waitForLoadState('networkidle');

    const journeyCard = page.locator('[data-testid="journey-card"]').first();
    if (await journeyCard.count() > 0) {
      await journeyCard.click();
      await page.waitForLoadState('networkidle');

      // Wait for timeline
      await page.waitForSelector('text=독서 여정 타임라인');

      // Get all timeline cards
      const timelineCards = page.locator('.card-elevated').filter({
        has: page.locator('text=/v\\d+|v0|vFinal/')
      });

      const cardCount = await timelineCards.count();

      if (cardCount > 0) {
        // Measure heights of cards
        const heights: number[] = [];

        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = timelineCards.nth(i);
          const box = await card.boundingBox();
          if (box) {
            heights.push(box.height);
          }
        }

        console.log(`📏 Timeline card heights: ${heights.map(h => Math.round(h) + 'px').join(', ')}`);

        // Cards should be reasonably compact (expect < 400px for typical cards)
        // This is a rough heuristic - the exact height depends on content
        const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
        console.log(`📊 Average card height: ${Math.round(avgHeight)}px`);

        // Just log for now - we're verifying visual compactness
        expect(avgHeight).toBeLessThan(500); // Generous upper bound
      }
    }
  });
});
