import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * Playwright 테스트 설정
 *
 * 이 프로젝트의 E2E 테스트를 위한 Playwright 설정입니다.
 * - 음악 생성과 같은 비동기 작업을 위한 긴 타임아웃 설정
 * - 모바일 반응형 테스트 지원
 * - 실패 시 스크린샷 및 비디오 자동 캡처
 */
export default defineConfig({
  // 테스트 디렉토리
  testDir: './tests/e2e',

  // 테스트 결과 출력 디렉토리
  outputDir: './playwright-results',

  // 각 테스트 파일은 완전히 병렬로 실행
  fullyParallel: true,

  // CI 환경에서는 테스트 실패 시 재시도하지 않음
  forbidOnly: !!process.env.CI,

  // CI 환경에서는 재시도 안함, 로컬에서는 1회 재시도
  retries: process.env.CI ? 0 : 1,

  // 병렬 실행할 워커 수 (CI에서는 1개, 로컬에서는 CPU 코어 수만큼)
  workers: process.env.CI ? 1 : undefined,

  // 테스트 리포터 설정
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'], // 콘솔 출력
  ],

  // 모든 테스트에 적용되는 공통 설정
  use: {
    // 기본 URL (환경 변수에서 가져오거나 기본값 사용)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // 브라우저 컨텍스트 옵션
    trace: 'on-first-retry', // 첫 재시도 시 trace 기록
    screenshot: 'only-on-failure', // 실패 시에만 스크린샷
    video: 'retain-on-failure', // 실패 시 비디오 보존

    // 네트워크 요청 타임아웃 (음악 생성 API를 위해 길게 설정)
    actionTimeout: 30000, // 30초
    navigationTimeout: 30000, // 30초
  },

  // 테스트 프로젝트 설정 (Chrome 브라우저만)
  projects: [
    // 데스크톱 Chrome
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // 웹 서버 설정 (테스트 실행 전 개발 서버 자동 시작)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // CI에서는 새 서버 시작
    timeout: 120000, // 2분 타임아웃
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // 전역 설정 및 정리
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  // 타임아웃 설정
  timeout: 60000, // 각 테스트는 최대 60초 (음악 생성 대기 시간 고려)
  expect: {
    timeout: 10000, // expect 타임아웃은 10초
  },
});
