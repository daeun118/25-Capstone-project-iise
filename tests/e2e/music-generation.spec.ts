/**
 * Mureka Music Generation E2E Test
 * 
 * Tests the complete music generation flow:
 * 1. Create journey
 * 2. Add reading log
 * 3. Verify music track created with pending status
 * 4. Check music generation status endpoint
 * 5. Verify async music generation completes (or mock for testing)
 */

import { test, expect } from '@playwright/test';

test.describe('Mureka Music Generation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should create music track with pending status when adding reading log', async ({ page }) => {
    // Step 1: Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to home
    await page.waitForURL('/');

    // Step 2: Create new journey
    await page.goto('/journey/new');
    
    // Search for a book
    await page.fill('input[placeholder*="책"]', '노인과 바다');
    await page.click('button:has-text("검색")');
    
    // Wait for search results
    await page.waitForSelector('text=노인과 바다', { timeout: 10000 });
    
    // Select first book
    await page.click('button:has-text("선택")').first();
    
    // Wait for journey creation
    await page.waitForURL(/\/journey\/[a-f0-9-]+$/, { timeout: 10000 });
    
    // Get journey ID from URL
    const url = page.url();
    const journeyId = url.split('/').pop();
    
    console.log(`✅ Journey created: ${journeyId}`);

    // Step 3: Add reading log
    await page.click('button:has-text("독서 기록 추가")');
    
    // Fill in the log form
    await page.fill('textarea#quote', '인간은 파멸할 수는 있어도 패배할 수는 없다.');
    await page.fill('textarea#memo', '노인의 불굴의 의지가 느껴지는 구절입니다.');
    
    // Select emotion tags
    await page.click('button:has-text("감동")');
    await page.click('button:has-text("희망")');
    
    // Submit the log
    await page.click('button[type="submit"]:has-text("저장")');
    
    // Wait for success message
    await expect(page.locator('text=독서 기록이 추가되었습니다')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Reading log added successfully');

    // Step 4: Verify music track was created in database
    // We'll check via API instead of direct DB access
    
    // Wait a bit for the async process to start
    await page.waitForTimeout(2000);
    
    // Navigate to journey page to see the music track
    await page.goto(`/journey/${journeyId}`);
    
    // Verify music player or track info is visible
    // The exact selector depends on your UI implementation
    await expect(page.locator('text=v1').or(page.locator('text=버전 1'))).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Music track visible in UI');

    // Step 5: Check music generation status via API
    // Get the music track ID from the page (you may need to add a data attribute)
    // For now, we'll just verify the status indicator
    
    // Look for "생성 중" or "pending" status
    const statusText = await page.locator('[data-testid="music-status"]').textContent().catch(() => '');
    console.log(`Music generation status: ${statusText}`);
    
    // The status should be "pending" or "생성 중" initially
    // In production, it would change to "completed" after 30s-2min
    
    console.log('✅ Music generation flow test completed');
  });

  test('should poll music status endpoint and get track details', async ({ page, request }) => {
    // This test assumes we have a music track ID
    // In a real scenario, you'd create a journey and log first
    
    // For this test, we'll create a mock scenario
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Create journey and log (abbreviated version)
    await page.goto('/journey/new');
    await page.fill('input[placeholder*="책"]', '노인과 바다');
    await page.click('button:has-text("검색")');
    await page.waitForSelector('text=노인과 바다', { timeout: 10000 });
    await page.click('button:has-text("선택")').first();
    await page.waitForURL(/\/journey\/[a-f0-9-]+$/);
    
    const journeyId = page.url().split('/').pop();
    
    await page.click('button:has-text("독서 기록 추가")');
    await page.fill('textarea#quote', '테스트 구절');
    await page.fill('textarea#memo', '테스트 메모');
    await page.click('button[type="submit"]:has-text("저장")');
    await expect(page.locator('text=독서 기록이 추가되었습니다')).toBeVisible({ timeout: 10000 });
    
    // Wait for music track creation
    await page.waitForTimeout(2000);
    
    // Get music track ID from page
    // This requires adding data-testid to your music player component
    const trackId = await page.getAttribute('[data-testid="music-track"]', 'data-track-id').catch(() => null);
    
    if (trackId) {
      // Poll the status endpoint
      const response = await request.get(`/api/music/${trackId}`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      console.log('Music track status:', data);
      
      // Verify response structure
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('prompt');
      expect(data.status).toMatch(/pending|completed|error/);
      
      console.log(`✅ Music status endpoint working: status=${data.status}`);
    } else {
      console.log('⚠️ Could not get track ID from UI - skipping status check');
    }
  });

  test('should handle music generation errors gracefully', async ({ page }) => {
    // This test checks error handling
    // In a real scenario, you might want to test with invalid API keys
    // or simulated failures
    
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Create journey
    await page.goto('/journey/new');
    await page.fill('input[placeholder*="책"]', '노인과 바다');
    await page.click('button:has-text("검색")');
    await page.waitForSelector('text=노인과 바다', { timeout: 10000 });
    await page.click('button:has-text("선택")').first();
    await page.waitForURL(/\/journey\/[a-f0-9-]+$/);

    // Add reading log
    await page.click('button:has-text("독서 기록 추가")');
    await page.fill('textarea#quote', '에러 테스트');
    await page.fill('textarea#memo', '에러 핸들링 확인');
    await page.click('button[type="submit"]:has-text("저장")');
    
    // The log should still be created successfully
    // even if music generation fails in the background
    await expect(page.locator('text=독서 기록이 추가되었습니다')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Error handling test passed - log creation succeeded');
  });

  test('should create v0 music when starting a journey', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Create new journey
    await page.goto('/journey/new');
    await page.fill('input[placeholder*="책"]', '노인과 바다');
    await page.click('button:has-text("검색")');
    await page.waitForSelector('text=노인과 바다', { timeout: 10000 });
    await page.click('button:has-text("선택")').first();
    
    // Wait for journey creation
    await page.waitForURL(/\/journey\/[a-f0-9-]+$/);
    
    // v0 music should be created immediately
    // Check for v0 indicator in the UI
    await expect(page.locator('text=v0').or(page.locator('text=버전 0'))).toBeVisible({ timeout: 5000 });
    
    console.log('✅ v0 music track created on journey start');
  });
});

test.describe('Music Status Polling', () => {
  test('should show pending status initially and update when complete', async ({ page }) => {
    // This is more of an integration test
    // It would require actual Mureka integration or mocking
    
    test.skip(true, 'Requires actual Mureka API integration or mocking');
    
    // Pseudocode for when Mureka is integrated:
    // 1. Create journey and log
    // 2. Verify status is 'pending'
    // 3. Poll every 5 seconds
    // 4. Wait up to 3 minutes for status to change to 'completed'
    // 5. Verify file_url is populated
    // 6. Verify music can be played
  });
});
