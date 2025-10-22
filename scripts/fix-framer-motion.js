#!/usr/bin/env node

/**
 * Framer Motion tree shaking 에러 수정 스크립트
 * LazyMotion 사용 시 motion -> m 으로 변경
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/app/page.tsx',
  'src/app/(main)/library/page.tsx',
  'src/app/(main)/my/page.tsx',
  'src/app/(main)/journey/[id]/page.tsx',
];

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}🔧 Framer Motion tree shaking 에러 수정 중...${RESET}\n`);

files.forEach((filePath) => {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  건너뛰기: ${filePath} (파일 없음)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let changed = false;

  // 1. import 변경: motion -> m
  if (content.includes("import { motion } from 'framer-motion'")) {
    content = content.replace(
      "import { motion } from 'framer-motion'",
      "import { m } from 'framer-motion'"
    );
    changed = true;
  }

  // 2. 모든 motion. -> m. 변경
  const motionCount = (content.match(/motion\./g) || []).length;
  if (motionCount > 0) {
    content = content.replace(/motion\./g, 'm.');
    changed = true;
    console.log(`${GREEN}✅ ${filePath}${RESET}`);
    console.log(`   - motion. → m. (${motionCount}개 변경)`);
  } else {
    console.log(`✓ ${filePath} (이미 수정됨)`);
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf-8');
  }
});

console.log(`\n${GREEN}✨ 완료!${RESET}`);
