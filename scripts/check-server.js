#!/usr/bin/env node

/**
 * 개발 서버 상태 확인 스크립트
 */

const net = require('net');
const { execSync } = require('child_process');

const PORT = 3000;
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true); // 포트 사용 중
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // 포트 사용 가능
    });
    
    server.listen(port);
  });
}

function getProcessInfo(port) {
  try {
    if (process.platform === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      return result.trim();
    } else {
      const result = execSync(`lsof -i :${port}`, { encoding: 'utf-8' });
      return result.trim();
    }
  } catch (error) {
    return null;
  }
}

async function main() {
  log('\n📊 ReadTune 개발 서버 상태 확인', YELLOW);
  log('='.repeat(50), YELLOW);
  
  const isInUse = await checkPort(PORT);
  
  if (isInUse) {
    log(`\n✅ 포트 ${PORT}가 사용 중입니다.`, GREEN);
    log(`🌐 서버 주소: http://localhost:${PORT}`, GREEN);
    
    const processInfo = getProcessInfo(PORT);
    if (processInfo) {
      log(`\n📋 프로세스 정보:`, YELLOW);
      log(processInfo, RESET);
    }
  } else {
    log(`\n❌ 포트 ${PORT}가 사용되지 않습니다.`, RED);
    log(`💡 서버를 시작하려면: npm run dev`, YELLOW);
  }
  
  log('');
}

main().catch((error) => {
  log(`\n❌ 오류 발생: ${error.message}`, RED);
  process.exit(1);
});
