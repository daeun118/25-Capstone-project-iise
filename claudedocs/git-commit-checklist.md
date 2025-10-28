# Git 커밋 체크리스트 (실수 방지)

## 문제점 분석

과거 실수 사례:
1. **회원탈퇴 기능 (2025-10-28)**
   - 1차 커밋: DeleteAccountDialog.tsx만 → 빌드 오류 (alert.tsx 누락)
   - 2차 커밋: alert.tsx 추가 → 기능 없음 (API/서비스/리포지토리 누락)
   - 3차 커밋: API/서비스/리포지토리 추가 → 최종 완성

**근본 원인**: 의존성 파일과 관련 파일을 체계적으로 확인하지 않음

---

## 커밋 전 필수 체크리스트

### 1단계: 변경 파일 전체 확인

```bash
git status
```

**체크 포인트**:
- [ ] 모든 변경된 파일 목록 확인
- [ ] Untracked files 목록 확인
- [ ] Modified 파일 목록 확인

### 2단계: 기능별 파일 그룹핑

#### 새 기능 추가 시 필수 확인 사항

**프론트엔드 컴포넌트**:
- [ ] 컴포넌트 파일 (`*.tsx`)
- [ ] 의존하는 UI 컴포넌트 (`src/components/ui/*`)
- [ ] 사용하는 커스텀 훅 (`src/hooks/*`)
- [ ] 타입 정의 (`src/types/*`)

**API 엔드포인트**:
- [ ] API 라우트 파일 (`src/app/api/**/route.ts`)
- [ ] 서비스 레이어 (`src/services/*`)
- [ ] 리포지토리 레이어 (`src/repositories/*`)
- [ ] 타입 정의 (`src/types/*`)

**페이지 통합**:
- [ ] 페이지 파일 (`src/app/(*)/**/page.tsx`)
- [ ] 레이아웃 파일 (필요 시)

### 3단계: 의존성 추적

```bash
# 변경된 파일에서 import 구문 확인
grep -r "import.*from '@/components" [변경된 파일]
grep -r "import.*from '@/lib" [변경된 파일]
grep -r "import.*from '@/services" [변경된 파일]
```

**체크 포인트**:
- [ ] 모든 import된 파일이 커밋 목록에 포함되어 있는가?
- [ ] 새로 생성한 파일이 Untracked files에 있는가?
- [ ] 수정한 파일이 Modified에 있는가?

### 4단계: 빌드 테스트 (로컬)

```bash
npm run build
```

**체크 포인트**:
- [ ] 빌드 성공 확인
- [ ] TypeScript 타입 에러 없음
- [ ] Import 에러 없음

### 5단계: 기능 완성도 확인

**체크 포인트**:
- [ ] UI 컴포넌트만 있는가? → API도 함께 커밋해야 함
- [ ] API만 있는가? → UI도 함께 커밋해야 함
- [ ] 전체 플로우가 작동하는가?

---

## 커밋 실행 가이드

### 파일 스테이징 패턴

#### ❌ 잘못된 방법 (부분 커밋)
```bash
# 컴포넌트만 추가
git add src/components/my/DeleteAccountDialog.tsx
git commit -m "feat: 회원탈퇴 다이얼로그 추가"
# → 빌드 오류 또는 기능 미작동
```

#### ✅ 올바른 방법 (완전한 기능 커밋)
```bash
# 1. 전체 상태 확인
git status

# 2. 관련 파일 전체 추가
git add src/components/my/DeleteAccountDialog.tsx \
        src/components/ui/alert.tsx \
        src/app/api/user/delete/ \
        src/services/user.service.ts \
        src/repositories/user.repository.ts \
        src/app/\(main\)/my/page.tsx

# 3. 로컬 빌드 확인
npm run build

# 4. 커밋
git commit -m "feat: 회원탈퇴 기능 완전 구현"

# 5. 푸시
git push origin main
```

---

## 기능별 파일 체크리스트

### 회원 관리 기능
- [ ] API: `src/app/api/user/**`
- [ ] 서비스: `src/services/user.service.ts`
- [ ] 리포지토리: `src/repositories/user.repository.ts`
- [ ] UI: `src/components/auth/**` 또는 `src/components/my/**`
- [ ] 페이지: `src/app/(auth)/**` 또는 `src/app/(main)/my/**`

### 독서 여정 기능
- [ ] API: `src/app/api/journeys/**`
- [ ] 서비스: `src/services/journey.service.ts`
- [ ] 리포지토리: `src/repositories/journey.repository.ts`
- [ ] UI: `src/components/journey/**`
- [ ] 페이지: `src/app/(main)/journey/**`

### 음악 생성 기능
- [ ] API: `src/app/api/music/**`
- [ ] OpenAI: `src/lib/openai/**`
- [ ] Mureka: `src/lib/mureka/**`
- [ ] UI: `src/components/music/**`
- [ ] 훅: `src/hooks/useMusicPlayer.ts`

### 커뮤니티 기능
- [ ] API: `src/app/api/posts/**`
- [ ] 서비스: `src/services/post.service.ts`
- [ ] 리포지토리: `src/repositories/post.repository.ts`
- [ ] UI: `src/components/post/**`
- [ ] 페이지: `src/app/(main)/feed/**`

---

## 커밋 메시지 템플릿

### 새 기능 추가
```
feat: [기능명] 완전 구현

- API 엔드포인트: [경로]
- 서비스 레이어: [파일명]
- 리포지토리 레이어: [파일명]
- UI: [컴포넌트명]
- 페이지 통합: [페이지명]

기능:
- [주요 기능 1]
- [주요 기능 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 버그 수정
```
fix: [문제 설명]

- [수정 내용 1]
- [수정 내용 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 긴급 상황 대응

### 빌드 오류 발생 시

1. **즉시 확인**
```bash
npm run build
```

2. **누락 파일 확인**
```bash
git status
git diff HEAD
```

3. **추가 커밋**
```bash
git add [누락된 파일]
git commit -m "fix: [누락 파일] 추가로 빌드 오류 수정"
git push origin main
```

### 기능 미작동 시

1. **API 파일 확인**
```bash
ls -la src/app/api/[기능명]/
```

2. **서비스/리포지토리 확인**
```bash
ls -la src/services/
ls -la src/repositories/
```

3. **누락 파일 추가 커밋**
```bash
git add [누락 파일들]
git commit -m "feat: [기능명] 백엔드 로직 추가"
git push origin main
```

---

## 자동화 스크립트 (추후 고려)

### 커밋 전 체크 스크립트
```bash
#!/bin/bash
# scripts/pre-commit-check.sh

echo "🔍 커밋 전 체크 시작..."

# 1. 빌드 테스트
echo "📦 빌드 테스트..."
npm run build || exit 1

# 2. 타입 체크
echo "📝 타입 체크..."
npx tsc --noEmit || exit 1

# 3. Lint 체크
echo "🔧 Lint 체크..."
npm run lint || exit 1

echo "✅ 모든 체크 통과!"
```

---

## 핵심 원칙

1. **완전성**: 하나의 기능은 하나의 커밋에 완전하게 포함
2. **테스트**: 커밋 전 반드시 로컬 빌드 실행
3. **의존성**: import하는 모든 파일 확인
4. **검증**: 배포 후 기능 작동 확인

**기억하기**: "빌드가 성공한다 = 배포 가능하다" ✅
