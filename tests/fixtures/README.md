# Fixtures

Playwright Fixtures는 테스트에 필요한 설정과 상태를 재사용 가능하게 만드는 기능입니다.

## 📚 Fixtures란?

Fixtures는 테스트 실행 전/후에 필요한 설정을 자동으로 처리해주는 기능입니다:
- 로그인 상태
- 테스트 데이터 생성
- 브라우저 설정
- Cleanup (정리 작업)

## 🎯 사용 가능한 Fixtures

### 1. 기본 Fixtures (`index.ts`)

```typescript
import { test, expect } from '../fixtures';

test('인증된 사용자 테스트', async ({ authenticatedPage, testUser }) => {
  // authenticatedPage: 이미 로그인된 페이지
  // testUser: 테스트 사용자 정보
  await authenticatedPage.goto('/library');
});
```

### 2. 인증 Fixtures (`auth.fixture.ts`)

```typescript
import { authTest as test, expect } from '../fixtures/auth.fixture';

test('두 사용자 간 상호작용', async ({ user1Page, user2Page }) => {
  // user1Page: 사용자 1로 로그인된 페이지
  // user2Page: 사용자 2로 로그인된 페이지

  // 사용자 1이 게시물 작성
  await user1Page.goto('/feed');
  await user1Page.click('[data-testid="create-post"]');

  // 사용자 2가 좋아요
  await user2Page.goto('/feed');
  await user2Page.click('[data-testid="like-button"]');
});
```

### 3. 여정 Fixtures (`journey.fixture.ts`)

```typescript
import { journeyTest as test, expect } from '../fixtures/journey.fixture';

test('기존 여정에 로그 추가', async ({ pageWithJourney }) => {
  // pageWithJourney: 여정이 이미 생성된 상태
  const journeyId = pageWithJourney.journeyId;

  await pageWithJourney.goto(`/journey/${journeyId}`);
  await pageWithJourney.click('[data-testid="add-log"]');
});
```

## ✍️ 커스텀 Fixture 작성

### 기본 구조

```typescript
import { test as base } from '@playwright/test';

type MyFixtures = {
  myFixture: string;
};

export const test = base.extend<MyFixtures>({
  myFixture: async ({}, use) => {
    // Setup: 테스트 실행 전
    const value = 'some value';

    // 테스트에 제공
    await use(value);

    // Teardown: 테스트 실행 후 (정리 작업)
    // cleanup logic...
  },
});
```

### 실제 예시: 테스트 데이터 Fixture

```typescript
import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

type DataFixtures = {
  testBook: {
    isbn: string;
    title: string;
    author: string;
  };
};

export const dataTest = base.extend<DataFixtures>({
  testBook: async ({}, use) => {
    // Setup: 테스트용 책 데이터 생성
    const book = {
      isbn: '9780684801223',
      title: '노인과 바다',
      author: '어니스트 헤밍웨이',
    };

    // 테스트에 제공
    await use(book);

    // Teardown: 필요시 데이터 정리
    // await deleteTestData(book.isbn);
  },
});
```

## 🔧 Fixture 조합

여러 Fixture를 조합하여 사용할 수 있습니다:

```typescript
import { test as base } from '@playwright/test';
import { authTest } from './auth.fixture';
import { journeyTest } from './journey.fixture';

// 두 Fixture를 조합
type CombinedFixtures = {
  loggedInPage: Page;
  pageWithJourney: Page & { journeyId: string };
};

export const test = base.extend<CombinedFixtures>({
  ...authTest,
  ...journeyTest,
});
```

## 💡 Best Practices

### 1. Setup과 Cleanup 분리
```typescript
myFixture: async ({}, use) => {
  // ✅ Setup
  const resource = await createResource();

  // 테스트 실행
  await use(resource);

  // ✅ Cleanup
  await cleanupResource(resource);
}
```

### 2. 환경 변수 활용
```typescript
testUser: async ({}, use) => {
  await use({
    email: process.env.TEST_USER_EMAIL || 'default@example.com',
    password: process.env.TEST_USER_PASSWORD || 'defaultPassword',
  });
}
```

### 3. 타임아웃 설정
```typescript
pageWithJourney: async ({ page }, use) => {
  // 긴 작업에는 타임아웃 증가
  await page.waitForResponse(
    (response) => response.url().includes('/api/music/generate'),
    { timeout: 60000 } // 60초
  );

  await use(page);
}
```

### 4. 에러 처리
```typescript
myFixture: async ({}, use) => {
  let resource;
  try {
    resource = await createResource();
    await use(resource);
  } finally {
    // 에러가 발생해도 cleanup은 실행
    if (resource) {
      await cleanupResource(resource);
    }
  }
}
```

## 🎨 Fixture vs Helper

### Fixture 사용 시기
- 모든 테스트에서 공통으로 필요한 설정
- Setup/Cleanup이 자동으로 필요한 경우
- 테스트 간 격리가 필요한 경우

### Helper 사용 시기
- 일부 테스트에서만 필요한 기능
- 명시적으로 호출하고 싶은 경우
- 유틸리티 함수

```typescript
// ✅ Fixture: 로그인 상태는 자동으로 필요
test('테스트', async ({ authenticatedPage }) => {
  // 이미 로그인됨
});

// ✅ Helper: 명시적으로 호출
test('테스트', async ({ page }) => {
  await loginHelper(page, 'user@example.com', 'password');
});
```

## 📚 참고 자료
- [Playwright Fixtures 공식 문서](https://playwright.dev/docs/test-fixtures)
- [Built-in Fixtures](https://playwright.dev/docs/api/class-fixtures)
