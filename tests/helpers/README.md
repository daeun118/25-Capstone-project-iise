# Helpers

테스트에서 재사용 가능한 헬퍼 함수들을 모아놓은 디렉토리입니다.

## 📁 파일 구조

- `auth.helper.ts` - 인증 관련 헬퍼 (로그인, 로그아웃, 회원가입)
- `db.helper.ts` - 데이터베이스 직접 조작 헬퍼
- `api.helper.ts` - API 호출 헬퍼
- `wait.helper.ts` - 대기 관련 유틸리티
- `cleanup.helper.ts` - 테스트 데이터 정리 헬퍼

## 🎯 사용 방법

### 1. auth.helper.ts

```typescript
import { login, logout, isLoggedIn } from '../helpers/auth.helper';

test('로그인 테스트', async ({ page }) => {
  await login(page, 'test@example.com', 'password');

  // 로그인 확인
  expect(await isLoggedIn(page)).toBe(true);

  await logout(page);
});
```

### 2. db.helper.ts

```typescript
import { createTestUser, deleteTestUser, createTestJourney } from '../helpers/db.helper';

test('데이터베이스 직접 조작', async ({ page }) => {
  // 테스트 사용자 생성
  const user = await createTestUser(
    'test@example.com',
    'password',
    '테스트유저'
  );

  // 독서 여정 생성
  const journey = await createTestJourney(user.id, {
    isbn: '9780684801223',
    title: '노인과 바다',
    author: '어니스트 헤밍웨이',
  });

  // 테스트 실행...

  // Cleanup
  await deleteTestUser(user.id);
});
```

### 3. api.helper.ts

```typescript
import { createJourney, addLog, waitForMusicGeneration } from '../helpers/api.helper';

test('API 직접 호출', async ({ page }) => {
  // 로그인 먼저
  await login(page, 'test@example.com', 'password');

  // API로 여정 생성
  const journey = await createJourney(page, {
    isbn: '9780684801223',
    title: '노인과 바다',
    author: '어니스트 헤밍웨이',
  });

  // 음악 생성 대기
  await waitForMusicGeneration(page);
});
```

### 4. wait.helper.ts

```typescript
import { waitForElement, waitForLoadingToComplete, waitForMusicGeneration } from '../helpers/wait.helper';

test('대기 유틸리티', async ({ page }) => {
  // 요소 대기
  await waitForElement(page, '[data-testid="book-card"]');

  // 로딩 완료 대기
  await waitForLoadingToComplete(page);

  // 음악 생성 대기
  await waitForMusicGeneration(page);
});
```

### 5. cleanup.helper.ts

```typescript
import { cleanupAfterTest, cleanupUserData } from '../helpers/cleanup.helper';

test('데이터 정리', async ({ page }) => {
  const userId = 'user-id';

  // 테스트 실행...

  // 테스트 후 정리
  await cleanupAfterTest(page, userId);
});
```

## 💡 Helpers vs Fixtures

### Helpers를 사용할 때
- 명시적으로 호출하고 싶을 때
- 일부 테스트에서만 필요한 기능
- 유연한 매개변수가 필요할 때

```typescript
// ✅ Helper: 명시적 호출
test('테스트', async ({ page }) => {
  await login(page, 'custom@example.com', 'custom-password');
});
```

### Fixtures를 사용할 때
- 모든 테스트에서 자동으로 필요한 설정
- Setup/Cleanup이 자동화되어야 할 때
- 테스트 간 격리가 중요할 때

```typescript
// ✅ Fixture: 자동 설정
test('테스트', async ({ authenticatedPage }) => {
  // 이미 로그인된 상태
});
```

## 🔧 Helper 작성 가이드라인

### 1. 단일 책임
각 Helper 함수는 하나의 명확한 목적을 가져야 합니다.

```typescript
// ✅ 좋은 예
export async function login(page: Page, email: string, password: string) {
  // 로그인만 수행
}

// ❌ 나쁜 예
export async function loginAndCreateJourney(page: Page, ...) {
  // 너무 많은 일을 함
}
```

### 2. 명확한 이름
함수 이름에서 동작이 명확히 드러나야 합니다.

```typescript
// ✅ 좋은 예
export async function waitForMusicGeneration(page: Page) {}

// ❌ 나쁜 예
export async function wait(page: Page) {}
```

### 3. 타입 안정성
TypeScript 타입을 명확히 지정합니다.

```typescript
// ✅ 좋은 예
export async function createTestUser(
  email: string,
  password: string,
  nickname: string
): Promise<User> {
  // ...
}

// ❌ 나쁜 예
export async function createTestUser(data: any): Promise<any> {
  // ...
}
```

### 4. 에러 처리
예외 상황을 적절히 처리합니다.

```typescript
export async function deleteTestUser(userId: string) {
  try {
    // ...
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error; // 상위로 전파
  }
}
```

### 5. 문서화
복잡한 Helper는 JSDoc으로 문서화합니다.

```typescript
/**
 * 음악 생성 완료를 대기합니다.
 *
 * @param page - Playwright Page 객체
 * @param timeout - 최대 대기 시간 (기본: 60초)
 * @returns 음악 생성 API 응답
 *
 * @example
 * await waitForMusicGeneration(page);
 * await waitForMusicGeneration(page, 120000); // 2분 대기
 */
export async function waitForMusicGeneration(page: Page, timeout = 60000) {
  // ...
}
```

## 📚 참고 자료
- Fixture와 Helper를 적절히 조합하여 사용하세요
- 반복되는 패턴은 Helper로 추출하세요
- 테스트 코드의 가독성을 최우선으로 고려하세요
