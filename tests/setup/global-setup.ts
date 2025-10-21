import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup
 *
 * 모든 테스트 실행 전에 한 번만 실행됩니다.
 * - 테스트 데이터베이스 초기화
 * - 테스트 사용자 생성
 * - 환경 설정 검증
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Global Setup: 테스트 환경 준비 중...');

  // 1. 환경 변수 검증
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.test file.'
    );
  }

  // 2. 서버 실행 대기 (webServer 설정이 있는 경우)
  if (config.webServer) {
    console.log('⏳ 개발 서버 시작 대기 중...');
    // webServer가 자동으로 처리
  }

  // 3. 브라우저로 서버 연결 테스트
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

    console.log(`🔍 서버 연결 테스트: ${baseURL}`);
    await page.goto(baseURL, { timeout: 30000 });

    const title = await page.title();
    console.log(`✅ 서버 연결 성공: ${title}`);

    await browser.close();
  } catch (error) {
    console.error('❌ 서버 연결 실패:', error);
    throw new Error(
      '개발 서버에 연결할 수 없습니다. npm run dev가 실행 중인지 확인하세요.'
    );
  }

  // 4. 테스트 사용자 준비 (선택사항)
  // Note: Fixture에서 처리하는 것을 권장하지만, 여기서 미리 생성할 수도 있음
  // await createTestUser(...);

  console.log('✨ Global Setup 완료!');
}

export default globalSetup;
