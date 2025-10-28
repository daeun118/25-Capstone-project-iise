import { test, expect } from '@playwright/test';

test.describe('피드 플레이리스트 재생', () => {
  test('피드 게시물에서 플레이리스트 재생이 정상 작동해야 함', async ({ page }) => {
    // 1. 피드 페이지로 이동
    await page.goto('http://localhost:3000/feed');
    
    // 게시물이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 10000 });
    
    // 2. 첫 번째 게시물 클릭
    const firstPost = page.locator('[data-testid="post-card"]').first();
    await firstPost.click();
    
    // 게시물 상세 페이지 로드 대기
    await page.waitForURL(/\/feed\/[^/]+$/);
    
    // 3. 플레이리스트가 있는지 확인
    const playlist = page.locator('text="독서 플레이리스트"');
    const playlistExists = await playlist.isVisible();
    
    if (playlistExists) {
      // 4. 첫 번째 트랙의 재생 버튼 클릭
      const firstTrackPlayButton = page.locator('button[aria-label*="Play"]').first();
      await firstTrackPlayButton.click();
      
      // 5. MusicPlayerBar가 나타나는지 확인
      const musicPlayerBar = page.locator('[data-testid="music-player-bar"]');
      await expect(musicPlayerBar).toBeVisible({ timeout: 5000 });
      
      // 6. 재생 상태 확인 (버튼이 Pause로 변경되었는지)
      const pauseButton = musicPlayerBar.locator('button[aria-label*="Pause"]');
      await expect(pauseButton).toBeVisible();
      
      // 7. 트랙 정보가 표시되는지 확인
      const trackTitle = musicPlayerBar.locator('[data-testid="track-title"]');
      await expect(trackTitle).toBeVisible();
      await expect(trackTitle).not.toBeEmpty();
      
      // 8. 닫기 버튼 클릭하여 플레이어 닫기
      const closeButton = musicPlayerBar.locator('button[aria-label*="Close"]');
      await closeButton.click();
      
      // 9. MusicPlayerBar가 사라졌는지 확인
      await expect(musicPlayerBar).not.toBeVisible();
      
      console.log('✅ 플레이리스트 재생 테스트 성공');
    } else {
      console.log('⚠️ 이 게시물에 플레이리스트가 없습니다. 다른 게시물로 테스트해보세요.');
    }
  });
  
  test('플레이리스트 트랙 전환이 정상 작동해야 함', async ({ page }) => {
    // 피드 상세 페이지로 직접 이동 (플레이리스트가 있는 게시물)
    await page.goto('http://localhost:3000/feed');
    
    // 게시물 로드 대기
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 10000 });
    
    // 첫 번째 게시물 클릭
    const firstPost = page.locator('[data-testid="post-card"]').first();
    await firstPost.click();
    
    // 상세 페이지 로드 대기
    await page.waitForURL(/\/feed\/[^/]+$/);
    
    const playlist = page.locator('text="독서 플레이리스트"');
    const playlistExists = await playlist.isVisible();
    
    if (playlistExists) {
      // 플레이리스트의 트랙 수 확인
      const tracks = page.locator('[data-testid="playlist-track"]');
      const trackCount = await tracks.count();
      
      if (trackCount >= 2) {
        // 첫 번째 트랙 재생
        await tracks.nth(0).locator('button').click();
        
        // MusicPlayerBar 확인
        const musicPlayerBar = page.locator('[data-testid="music-player-bar"]');
        await expect(musicPlayerBar).toBeVisible();
        
        // 첫 번째 트랙 제목 저장
        const firstTrackTitle = await musicPlayerBar.locator('[data-testid="track-title"]').textContent();
        
        // 두 번째 트랙으로 전환
        await tracks.nth(1).locator('button').click();
        
        // 트랙 제목이 변경되었는지 확인
        const secondTrackTitle = await musicPlayerBar.locator('[data-testid="track-title"]').textContent();
        expect(firstTrackTitle).not.toBe(secondTrackTitle);
        
        console.log('✅ 트랙 전환 테스트 성공');
      } else {
        console.log('⚠️ 플레이리스트에 트랙이 2개 미만입니다.');
      }
    } else {
      console.log('⚠️ 이 게시물에 플레이리스트가 없습니다.');
    }
  });
});