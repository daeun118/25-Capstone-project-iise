# BookBeats E2E 테스트

이 디렉토리는 BookBeats 플랫폼의 E2E(End-to-End) 테스트를 포함합니다.
Playwright를 사용하여 실제 사용자 시나리오를 테스트합니다.

## 📁 폴더 구조

```
tests/
├── e2e/                    # 실제 테스트 파일들
│   ├── auth/               # 인증 테스트 (로그인, 회원가입)
│   ├── journey/            # 독서 여정 테스트
│   ├── library/            # 내 책장 테스트
│   ├── feed/               # 커뮤니티 피드 테스트
│   ├── interaction/        # 상호작용 테스트 (좋아요, 댓글, 스크랩)
│   ├── music/              # 음악 플레이어 테스트
│   ├── search/             # 도서 검색 테스트
│   ├── profile/            # 마이페이지 테스트
│   └── accessibility/      # 접근성 테스트
│
├── pages/                  # Page Object Model
│   ├── auth/               # 인증 페이지 객체
│   ├── journey/            # 독서 여정 페이지 객체
│   ├── library/            # 책장 페이지 객체
│   ├── feed/               # 피드 페이지 객체
│   ├── profile/            # 프로필 페이지 객체
│   ├── components/         # 공통 컴포넌트 페이지 객체
│   └── base.page.ts        # 기본 페이지 클래스
│
├── fixtures/               # Playwright Fixtures
│   ├── auth.fixture.ts     # 인증 fixture
│   ├── journey.fixture.ts  # 독서 여정 fixture
│   ├── test-data.fixture.ts # 테스트 데이터 fixture
│   └── index.ts            # Fixtures export
│
├── helpers/                # 헬퍼 함수들
│   ├── auth.helper.ts      # 로그인/로그아웃 헬퍼
│   ├── db.helper.ts        # 데이터베이스 직접 조작
│   ├── api.helper.ts       # API 호출 헬퍼
│   ├── wait.helper.ts      # 대기 유틸리티
│   └── cleanup.helper.ts   # 테스트 데이터 정리
│
├── mocks/                  # Mock 데이터 및 서버
│   ├── books.mock.ts       # Google Books API 목 데이터
│   ├── music.mock.ts       # Mureka API 목 데이터
│   └── supabase.mock.ts    # Supabase 목 응답
│
├── utils/                  # 유틸리티 함수들
│   ├── test-data.ts        # 테스트 데이터 생성기
│   ├── selectors.ts        # 공통 셀렉터
│   ├── assertions.ts       # 커스텀 assertion
│   └── constants.ts        # 테스트 상수
│
├── setup/                  # 테스트 설정
│   ├── global-setup.ts     # 전역 설정
│   ├── global-teardown.ts  # 전역 정리
│   └── test-hooks.ts       # beforeAll, afterAll 등
│
└── screenshots/            # 스크린샷 (gitignore)
    ├── baseline/           # 기준 스크린샷
    └── diff/               # 차이점 비교
```

## 🚀 테스트 실행

### 모든 테스트 실행
```bash
npx playwright test
```

### 특정 브라우저에서 실행
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### 특정 테스트 파일 실행
```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

### UI 모드로 실행 (디버깅에 유용)
```bash
npx playwright test --ui
```

### 헤드풀 모드로 실행 (브라우저 보기)
```bash
npx playwright test --headed
```

### 디버그 모드로 실행
```bash
npx playwright test --debug
```

## 📊 테스트 리포트

테스트 실행 후 HTML 리포트를 볼 수 있습니다:

```bash
npx playwright show-report
```

## 🔧 환경 설정

테스트 실행 전에 `.env.test` 파일을 설정해야 합니다:

```bash
cp .env.test.example .env.test
# .env.test 파일을 열어 실제 값으로 수정
```

## 📝 테스트 작성 가이드

### Page Object Model 사용
```typescript
import { LoginPage } from '../pages/auth/login.page';

test('로그인 테스트', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password');
  await loginPage.expectLoginSuccess();
});
```

### Fixture 사용
```typescript
import { test } from '../fixtures';

test('인증된 사용자로 테스트', async ({ authenticatedPage }) => {
  // authenticatedPage는 이미 로그인된 상태
  await authenticatedPage.goto('/library');
});
```

## 🎯 테스트 우선순위

1. **Critical Path** (P0)
   - 회원가입 및 로그인
   - 독서 여정 생성 (v0 음악 생성)
   - 독서 기록 추가 (vN 음악 생성)
   - 완독 처리 (vFinal 음악 생성)

2. **Core Features** (P1)
   - 내 책장 조회
   - 커뮤니티 피드 조회
   - 게시물 작성 및 공유
   - 음악 플레이어

3. **Interactions** (P2)
   - 좋아요, 댓글, 스크랩
   - 프로필 수정
   - 검색 기능

4. **Accessibility** (P3)
   - 키보드 네비게이션
   - 스크린 리더 지원

## 🐛 디버깅 팁

### 1. 브라우저 콘솔 확인
```typescript
page.on('console', msg => console.log('BROWSER:', msg.text()));
```

### 2. 스크린샷 캡처
```typescript
await page.screenshot({ path: 'debug.png' });
```

### 3. 네트워크 요청 확인
```typescript
page.on('request', request => console.log('REQUEST:', request.url()));
page.on('response', response => console.log('RESPONSE:', response.url()));
```

### 4. 슬로우 모션 실행
```bash
npx playwright test --headed --slow-mo=1000
```

## 📚 참고 문서

- [Playwright 공식 문서](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
