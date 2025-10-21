import { FullConfig } from '@playwright/test';

/**
 * Global Teardown
 *
 * 모든 테스트 실행 완료 후에 한 번만 실행됩니다.
 * - 테스트 데이터 정리
 * - 리소스 해제
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Global Teardown: 테스트 환경 정리 중...');

  // 1. 테스트 데이터 정리 (선택사항)
  // Note: 개별 테스트에서 cleanup하는 것을 권장
  // await cleanupAllTestData();

  // 2. 로그 파일 정리 (선택사항)
  // await cleanupLogs();

  console.log('✅ Global Teardown 완료!');
}

export default globalTeardown;
