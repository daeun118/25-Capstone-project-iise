#!/usr/bin/env node

/**
 * 개발 서버 관리 스크립트
 * - 포트 3000이 사용 중이면 자동으로 종료
 * - 새로운 개발 서버 시작
 * - 서버 상태 확인
 */

const { execSync, spawn } = require('child_process');
const net = require('net');

const PORT = 3000;
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

async function killPort(port) {
  log(`\n🔍 포트 ${port} 확인 중...`, YELLOW);
  
  const inUse = await isPortInUse(port);
  
  if (!inUse) {
    log(`✅ 포트 ${port}는 사용 가능합니다.`, GREEN);
    return true;
  }
  
  log(`⚠️  포트 ${port}가 이미 사용 중입니다. 종료합니다...`, YELLOW);
  
  try {
    // Windows와 Unix 계열 모두 지원
    if (process.platform === 'win32') {
      execSync(`npx kill-port ${port}`, { stdio: 'inherit' });
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'inherit' });
    }
    
    // 포트가 완전히 해제될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    log(`✅ 포트 ${port}를 성공적으로 해제했습니다.`, GREEN);
    return true;
  } catch (error) {
    log(`❌ 포트 ${port} 해제 실패: ${error.message}`, RED);
    return false;
  }
}

async function startDevServer() {
  log('\n🚀 개발 서버를 시작합니다...', GREEN);
  
  const devServer = spawn('npm', ['run', 'dev:raw'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });
  
  devServer.on('error', (error) => {
    log(`❌ 서버 시작 실패: ${error.message}`, RED);
    process.exit(1);
  });
  
  devServer.on('close', (code) => {
    if (code !== 0) {
      log(`\n⚠️  서버가 코드 ${code}로 종료되었습니다.`, YELLOW);
    }
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    log('\n\n🛑 서버를 종료합니다...', YELLOW);
    devServer.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    devServer.kill('SIGTERM');
    process.exit(0);
  });
}

async function main() {
  log('\n📦 BookBeats 개발 서버 관리 도구', GREEN);
  log('='.repeat(50), GREEN);
  
  const portCleared = await killPort(PORT);
  
  if (!portCleared) {
    log('\n❌ 포트를 해제할 수 없습니다. 수동으로 확인해주세요.', RED);
    process.exit(1);
  }
  
  await startDevServer();
}

main().catch((error) => {
  log(`\n❌ 오류 발생: ${error.message}`, RED);
  process.exit(1);
});
