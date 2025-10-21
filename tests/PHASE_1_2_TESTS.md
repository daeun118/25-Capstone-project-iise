# Phase 1, 2 핵심 기능 E2E 테스트

Phase 1, 2에서 구현한 핵심 기능(로그인, 회원가입, 도서 검색)에 대한 Playwright E2E 테스트 가이드입니다.

## 🎯 테스트 범위

### Phase 1 - 인증 시스템
- ✅ 이메일/비밀번호 로그인
- ✅ 회원가입
- ✅ 로그아웃

### Phase 2 - 도서 검색
- ✅ Google Books API 연동 검색
- ✅ 검색 결과 표시
- ✅ 도서 상세 정보 조회

## 📁 구성된 파일들

### Page Objects (tests/pages/)
```
pages/
├── base.page.ts                # 모든 페이지의 기본 클래스
├── auth/
│   ├── login.page.ts           # 로그인 페이지 객체
│   └── signup.page.ts          # 회원가입 페이지 객체
└── search/
    └── book-search.page.ts     # 도서 검색 페이지 객체
```

### 테스트 작성 위치 (tests/e2e/)
```
e2e/
├── auth/
│   ├── login.spec.ts           # 로그인 테스트 (작성 필요)
│   └── signup.spec.ts          # 회원가입 테스트 (작성 필요)
└── search/
    └── book-search.spec.ts     # 도서 검색 테스트 (작성 필요)
```

## 🚀 테스트 실행 방법

### 1. 환경 설정

`.env.test` 파일을 설정하세요:
```bash
# .env.test 파일 복사
cp .env.test.example .env.test

# 실제 값으로 수정
nano .env.test  # 또는 원하는 에디터 사용
```

### 2. 개발 서버 실행 확인

```bash
npm run dev
```
→ http://localhost:3000 에서 앱이 실행 중이어야 합니다.

### 3. 테스트 실행

```bash
# 모든 테스트 실행 (headless)
npm test

# UI 모드 (추천!)
npm run test:ui

# 브라우저를 보면서 실행
npm run test:headed

# 디버그 모드
npm run test:debug

# 테스트 리포트 보기
npm run test:report
```

## ✍️ 테스트 작성 예시

### 1. 로그인 테스트 (tests/e2e/auth/login.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/login.page';

test.describe('로그인', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('유효한 이메일과 비밀번호로 로그인 성공', async () => {
    await loginPage.login('test@example.com', 'TestPassword123!');
    await loginPage.expectLoginSuccess();
  });

  test('잘못된 비밀번호로 로그인 실패', async () => {
    await loginPage.login('test@example.com', 'wrong-password');
    await loginPage.expectLoginError();
  });

  test('존재하지 않는 이메일로 로그인 실패', async () => {
    await loginPage.login('nonexistent@example.com', 'password');
    await loginPage.expectLoginError();
  });
});
```

### 2. 회원가입 테스트 (tests/e2e/auth/signup.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { SignupPage } from '../../pages/auth/signup.page';
import { generateTestUser } from '../../utils/test-data';

test.describe('회원가입', () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.goto();
  });

  test('유효한 정보로 회원가입 성공', async () => {
    const user = generateTestUser();
    await signupPage.signup(user.email, user.password, user.nickname);
    await signupPage.expectSignupSuccess();
  });

  test('비밀번호 불일치로 회원가입 실패', async () => {
    const user = generateTestUser();
    await signupPage.signupWithMismatchedPassword(
      user.email,
      user.password,
      'different-password',
      user.nickname
    );
    await signupPage.expectPasswordMismatchError();
  });

  test('유효하지 않은 이메일로 회원가입 실패', async () => {
    await signupPage.signup('invalid-email', 'Password123!', 'Tester');
    await signupPage.expectInvalidEmailError();
  });
});
```

### 3. 도서 검색 테스트 (tests/e2e/search/book-search.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { BookSearchPage } from '../../pages/search/book-search.page';
import { TEST_BOOKS } from '../../utils/constants';

test.describe('도서 검색', () => {
  let bookSearchPage: BookSearchPage;

  test.beforeEach(async ({ page }) => {
    bookSearchPage = new BookSearchPage(page);
    // 로그인 필요 시 여기서 수행
  });

  test('검색어로 도서 검색 성공', async ({ page }) => {
    await page.goto('/');
    await bookSearchPage.searchBook('노인과 바다');
    await bookSearchPage.expectSearchResults();
  });

  test('검색 결과에서 첫 번째 도서 선택', async ({ page }) => {
    await page.goto('/');
    await bookSearchPage.searchBook('어린 왕자');
    await bookSearchPage.selectFirstBook();

    // 도서 상세 페이지 또는 다음 단계로 이동 확인
    await page.waitForURL(/journey/);
  });

  test('검색 결과가 없는 쿼리', async ({ page }) => {
    await page.goto('/');
    await bookSearchPage.searchBook('xyzabc123nonexistent');
    await bookSearchPage.expectNoResults();
  });

  test('특정 도서가 검색 결과에 포함되는지 확인', async ({ page }) => {
    await page.goto('/');
    await bookSearchPage.searchBook('헤밍웨이');
    await bookSearchPage.expectBookInResults('노인과 바다');
  });
});
```

## 📝 Page Object 사용법

### LoginPage

```typescript
import { LoginPage } from '../pages/auth/login.page';

const loginPage = new LoginPage(page);

// 로그인 페이지로 이동
await loginPage.goto();

// 로그인 수행
await loginPage.login('email@example.com', 'password');

// 검증
await loginPage.expectLoginSuccess();
await loginPage.expectLoginError('에러 메시지');
```

### SignupPage

```typescript
import { SignupPage } from '../pages/auth/signup.page';

const signupPage = new SignupPage(page);

// 회원가입 페이지로 이동
await signupPage.goto();

// 회원가입 수행
await signupPage.signup('email@example.com', 'password', 'nickname');

// 검증
await signupPage.expectSignupSuccess();
await signupPage.expectPasswordMismatchError();
```

### BookSearchPage

```typescript
import { BookSearchPage } from '../pages/search/book-search.page';

const bookSearchPage = new BookSearchPage(page);

// 도서 검색
await bookSearchPage.searchBook('검색어');

// 검색 결과 확인
await bookSearchPage.expectSearchResults();
const count = await bookSearchPage.getSearchResultsCount();

// 도서 선택
await bookSearchPage.selectFirstBook();
await bookSearchPage.selectBookByTitle('특정 제목');
```

## 🔧 Helper 함수 활용

### 테스트 데이터 생성

```typescript
import { generateTestUser, generateEmail } from '../utils/test-data';

// 무작위 사용자 생성
const user = generateTestUser();
console.log(user); // { email, password, nickname }

// 무작위 이메일 생성
const email = generateEmail('test'); // test-1234567890-abc@example.com
```

### 상수 사용

```typescript
import { TEST_BOOKS, TIMEOUTS } from '../utils/constants';

// 테스트용 도서 데이터
const book = TEST_BOOKS.OLD_MAN_SEA;

// 타임아웃
await page.waitForTimeout(TIMEOUTS.SHORT); // 5초
```

## 🎨 테스트 작성 Best Practices

### 1. test.describe로 그룹화

```typescript
test.describe('로그인 기능', () => {
  // 관련된 테스트들을 그룹화
});
```

### 2. beforeEach로 공통 설정

```typescript
test.beforeEach(async ({ page }) => {
  // 각 테스트 전에 실행
  await page.goto('/login');
});
```

### 3. 명확한 테스트 이름

```typescript
// ✅ 좋음
test('유효한 이메일과 비밀번호로 로그인 성공', async () => {});

// ❌ 나쁨
test('test1', async () => {});
```

### 4. 하나의 테스트는 하나의 시나리오

```typescript
// ✅ 좋음
test('로그인 성공', async () => {
  await loginPage.login('test@example.com', 'password');
  await loginPage.expectLoginSuccess();
});

// ❌ 나쁨: 여러 시나리오를 한 테스트에
test('로그인 테스트', async () => {
  // 로그인 성공
  // 로그인 실패
  // 로그아웃
  // ...
});
```

## 🐛 디버깅 팁

### 1. --headed로 브라우저 보기

```bash
npm run test:headed
```

### 2. --debug로 단계별 실행

```bash
npm run test:debug
```

### 3. 스크린샷 캡처

```typescript
await page.screenshot({ path: 'debug.png' });
```

### 4. 콘솔 메시지 확인

```typescript
page.on('console', msg => console.log('BROWSER:', msg.text()));
```

## 📚 다음 단계

1. **테스트 작성**: 위 예시를 참고하여 실제 테스트 파일 작성
2. **테스트 실행**: `npm run test:ui`로 실행하며 확인
3. **CI/CD 통합**: GitHub Actions 등에 통합
4. **커버리지 확장**: Phase 3 이후 기능 추가 시 테스트도 확장

## 🔗 참고 자료

- [Playwright 공식 문서](https://playwright.dev)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- 프로젝트 전체 테스트 가이드: [tests/README.md](./README.md)
