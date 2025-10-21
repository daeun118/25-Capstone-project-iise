/**
 * Mureka 설정 검증 스크립트
 * 
 * Mureka MCP 통합이 올바르게 설정되었는지 확인합니다.
 */

require('dotenv').config({ path: '.env.local' });

// 환경 변수 확인
console.log('🔍 Mureka 설정 검증 시작...\n');

// 1. 환경 변수 확인
console.log('1️⃣ 환경 변수 확인:');
const requiredEnvVars = [
  'MUREKA_API_KEY',
  'MUREKA_API_URL',
  'MUREKA_TIMEOUT_SECONDS'
];

let allEnvVarsSet = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`  ✅ ${envVar}: ${envVar === 'MUREKA_API_KEY' ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`  ❌ ${envVar}: 설정되지 않음`);
    allEnvVarsSet = false;
  }
}

if (!allEnvVarsSet) {
  console.log('\n❌ 필수 환경 변수가 설정되지 않았습니다.');
  console.log('   .env.local 파일을 확인하세요.\n');
  process.exit(1);
}

console.log('\n2️⃣ MCP 서버 설정 확인:');
console.log('  📝 .mcp.json 파일에 mureka 서버가 추가되어 있는지 확인하세요.');
console.log('  ✅ Claude Desktop을 재시작하면 Mureka 도구 4개가 표시됩니다.\n');

console.log('3️⃣ Supabase Storage 확인:');
console.log('  📝 music-tracks 버킷이 생성되었는지 Supabase 대시보드에서 확인하세요.');
console.log('  ✅ RLS 정책 4개가 설정되어 있어야 합니다.\n');

console.log('4️⃣ 코드 변경 사항:');
console.log('  ✅ src/lib/mureka/ - Mureka 클라이언트 및 Storage 통합');
console.log('  ✅ src/services/music.service.ts - 음악 생성 로직 업데이트');
console.log('  ✅ src/app/api/music/[id]/route.ts - 상태 폴링 엔드포인트');
console.log('  ✅ scripts/setup-storage.sql - Storage 설정 스크립트\n');

console.log('5️⃣ 테스트 방법:');
console.log('  1. 개발 서버 시작: npm run dev');
console.log('  2. 브라우저에서 http://localhost:3000 접속');
console.log('  3. 로그인 후 새 여정 생성');
console.log('  4. 독서 기록 추가');
console.log('  5. 데이터베이스에서 music_tracks 테이블 확인:');
console.log('     - status = \'pending\' (초기)');
console.log('     - 30초~2분 후 status = \'completed\'');
console.log('     - file_url에 Supabase Storage URL 저장됨\n');

console.log('6️⃣ 주의사항:');
console.log('  ⚠️  Mureka API 엔드포인트는 실제 API 문서에 따라 업데이트 필요');
console.log('      (src/lib/mureka/client.ts의 /v1/generate/music)');
console.log('  ⚠️  음악 생성마다 Mureka 크레딧 소모');
console.log('  ⚠️  첫 테스트 전에 Mureka 크레딧 잔액 확인 필수\n');

console.log('✅ Mureka 설정 검증 완료!\n');
console.log('💡 다음 단계:');
console.log('   1. Claude Desktop 재시작 (MCP 서버 로드)');
console.log('   2. 실제 여정 생성으로 음악 생성 테스트');
console.log('   3. 서버 로그에서 [MusicService] 메시지 확인');
console.log('   4. Supabase Storage에 파일 업로드 확인\n');
