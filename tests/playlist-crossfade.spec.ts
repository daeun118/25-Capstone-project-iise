import { test, expect } from '@playwright/test';

test.describe('Playlist and Crossfade Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and login
    await page.goto('http://localhost:3000');
    
    // Assuming test user is already set up in the test environment
    // You might need to adjust this based on your test setup
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/library');
  });

  test.describe('Journey Playlist Display', () => {
    test('should display playlist section for completed journeys', async ({ page }) => {
      // Navigate to a completed journey (you'll need to set up test data)
      // This assumes you have a completed journey in your test database
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      
      // Wait for the page to load
      await page.waitForSelector('text=독서 플레이리스트');
      
      // Check if playlist section is visible
      const playlistSection = page.locator('h2:has-text("독서 플레이리스트")');
      await expect(playlistSection).toBeVisible();
      
      // Check if "전체 재생" button exists
      const playAllButton = page.locator('button:has-text("전체 재생")');
      await expect(playAllButton).toBeVisible();
      
      // Check if track list is displayed
      const tracks = page.locator('[data-testid^="track-"]');
      await expect(tracks).toHaveCount(3); // Assuming test journey has 3 tracks
    });

    test('should NOT display playlist section for reading journeys', async ({ page }) => {
      // Navigate to an ongoing journey
      await page.goto('http://localhost:3000/journey/test-reading-journey-id');
      
      // Wait for the page to load
      await page.waitForSelector('text=독서 여정 타임라인');
      
      // Check that playlist section is NOT visible
      const playlistSection = page.locator('h2:has-text("독서 플레이리스트")');
      await expect(playlistSection).not.toBeVisible();
    });
  });

  test.describe('Playlist Playback', () => {
    test('should play entire playlist when clicking 전체 재생', async ({ page }) => {
      // Navigate to completed journey
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      
      // Click play all button
      await page.click('button:has-text("전체 재생")');
      
      // Check if music player bar appears
      const playerBar = page.locator('.fixed.bottom-0'); // Music player bar
      await expect(playerBar).toBeVisible();
      
      // Check if playlist mode is active (shows track progress)
      const trackProgress = page.locator('text=/\\d+ \\/ \\d+ 트랙/');
      await expect(trackProgress).toBeVisible();
      
      // Check if previous/next buttons are visible
      const prevButton = page.locator('[aria-label="Previous track"]');
      const nextButton = page.locator('[aria-label="Next track"]');
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
    });

    test('should play individual track from playlist', async ({ page }) => {
      // Navigate to completed journey
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      
      // Click on a specific track in the playlist
      const firstTrack = page.locator('[data-testid="track-0"] button').first();
      await firstTrack.click();
      
      // Check if music player bar appears
      const playerBar = page.locator('.fixed.bottom-0');
      await expect(playerBar).toBeVisible();
      
      // Check if the correct track is playing
      const trackTitle = page.locator('.fixed.bottom-0 text=v0 - 여정의 시작');
      await expect(trackTitle).toBeVisible();
    });

    test('should navigate between tracks using previous/next buttons', async ({ page }) => {
      // Navigate to completed journey and start playlist
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      await page.click('button:has-text("전체 재생")');
      
      // Wait for player bar
      await page.waitForSelector('.fixed.bottom-0');
      
      // Check initial track (1/3)
      await expect(page.locator('text=1 / 3 트랙')).toBeVisible();
      
      // Click next button
      const nextButton = page.locator('[aria-label="Next track"]');
      await nextButton.click();
      
      // Check if track progressed (2/3)
      await expect(page.locator('text=2 / 3 트랙')).toBeVisible();
      
      // Click previous button
      const prevButton = page.locator('[aria-label="Previous track"]');
      await prevButton.click();
      
      // Check if went back to track 1
      await expect(page.locator('text=1 / 3 트랙')).toBeVisible();
    });
  });

  test.describe('API Integration', () => {
    test('should fetch playlist data from API for completed journeys', async ({ page }) => {
      // Set up API response interceptor
      await page.route('**/api/journeys/*', async (route) => {
        const url = route.request().url();
        if (url.includes('test-completed-journey-id')) {
          // Mock completed journey response with playlist
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              journey: {
                id: 'test-completed-journey-id',
                book_title: '테스트 책',
                status: 'completed',
                completed_at: '2024-01-01T00:00:00Z'
              },
              playlist: [
                {
                  id: 'track-1',
                  version: 0,
                  logType: 'start',
                  title: 'v0 - 여정의 시작',
                  fileUrl: 'https://example.com/track1.mp3',
                  genre: 'ambient',
                  mood: 'contemplative',
                  tempo: 80,
                  duration: 120
                },
                {
                  id: 'track-2',
                  version: 1,
                  logType: 'progress',
                  title: 'v1 - 독서 중',
                  fileUrl: 'https://example.com/track2.mp3',
                  genre: 'ambient',
                  mood: 'thoughtful',
                  tempo: 85,
                  duration: 120
                },
                {
                  id: 'track-3',
                  version: 2,
                  logType: 'complete',
                  title: 'vFinal - 여정의 완성',
                  fileUrl: 'https://example.com/track3.mp3',
                  genre: 'orchestral',
                  mood: 'triumphant',
                  tempo: 90,
                  duration: 120
                }
              ]
            })
          });
        } else {
          await route.continue();
        }
      });

      // Navigate to the journey page
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      
      // Wait for playlist to be rendered
      await page.waitForSelector('h2:has-text("독서 플레이리스트")');
      
      // Verify all tracks are displayed
      const tracks = page.locator('[data-testid^="track-"]');
      await expect(tracks).toHaveCount(3);
      
      // Verify track titles
      await expect(page.locator('text=v0 - 여정의 시작')).toBeVisible();
      await expect(page.locator('text=v1 - 독서 중')).toBeVisible();
      await expect(page.locator('text=vFinal - 여정의 완성')).toBeVisible();
    });

    test('should NOT include playlist data for ongoing journeys', async ({ page }) => {
      // Set up API response interceptor
      await page.route('**/api/journeys/*', async (route) => {
        const url = route.request().url();
        if (url.includes('test-reading-journey-id')) {
          // Mock ongoing journey response without playlist
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              journey: {
                id: 'test-reading-journey-id',
                book_title: '읽는 중인 책',
                status: 'reading',
                started_at: '2024-01-01T00:00:00Z'
              }
              // No playlist field for ongoing journeys
            })
          });
        } else {
          await route.continue();
        }
      });

      // Navigate to the journey page
      await page.goto('http://localhost:3000/journey/test-reading-journey-id');
      
      // Wait for page to load
      await page.waitForSelector('h2:has-text("독서 여정 타임라인")');
      
      // Verify playlist is NOT displayed
      const playlistSection = page.locator('h2:has-text("독서 플레이리스트")');
      await expect(playlistSection).not.toBeVisible();
    });
  });

  test.describe('Crossfade Features', () => {
    test('should have smooth transition UI elements', async ({ page }) => {
      // This test verifies that the UI elements for crossfade are present
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      await page.click('button:has-text("전체 재생")');
      
      // The actual crossfade happens in the AudioCrossfadeManager
      // We can only test that the UI properly integrates with it
      
      // Check that the player bar shows smooth progress
      const progressBar = page.locator('.fixed.bottom-0 [role="slider"]');
      await expect(progressBar).toBeVisible();
      
      // Verify that the track transitions update the UI
      // This would require mocking the audio playback, which is complex
      // For now, we just verify the UI elements are in place
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({
      viewport: { width: 375, height: 667 }, // iPhone SE size
    });

    test('should display playlist properly on mobile', async ({ page }) => {
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      
      // Check if playlist section is visible on mobile
      const playlistSection = page.locator('h2:has-text("독서 플레이리스트")');
      await expect(playlistSection).toBeVisible();
      
      // Check if play all button is accessible
      const playAllButton = page.locator('button:has-text("전체 재생")');
      await expect(playAllButton).toBeVisible();
      await expect(playAllButton).toBeEnabled();
    });

    test('should show mobile-optimized player bar', async ({ page }) => {
      await page.goto('http://localhost:3000/journey/test-completed-journey-id');
      await page.click('button:has-text("전체 재생")');
      
      // Check if player bar is visible at bottom
      const playerBar = page.locator('.fixed.bottom-0');
      await expect(playerBar).toBeVisible();
      
      // Check if mobile progress bar is visible (different from desktop)
      const mobileProgressBar = page.locator('.md\\:hidden [role="slider"]');
      await expect(mobileProgressBar).toBeVisible();
    });
  });
});