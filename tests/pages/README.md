# Page Object Model

이 디렉토리는 Page Object Model (POM) 패턴을 사용한 페이지 객체들을 포함합니다.

## 📚 Page Object Model이란?

Page Object Model은 UI 테스트의 유지보수성을 높이기 위한 디자인 패턴입니다.
각 페이지나 컴포넌트를 클래스로 캡슐화하여 UI 변경에 유연하게 대응할 수 있습니다.

## 🏗️ 구조

```
pages/
├── base.page.ts          # 모든 페이지의 기본 클래스
├── auth/                 # 인증 관련 페이지
├── journey/              # 독서 여정 페이지
├── library/              # 책장 페이지
├── feed/                 # 피드 페이지
├── profile/              # 프로필 페이지
└── components/           # 공통 컴포넌트 (Header, Player 등)
```

## 🎯 BasePage

모든 페이지 객체는 `BasePage`를 상속받아 공통 메서드를 사용합니다.

### 주요 메서드
- `goto(path)` - 페이지 이동
- `click(selector)` - 요소 클릭
- `fill(selector, text)` - 텍스트 입력
- `expectVisible(selector)` - 요소 표시 확인
- `expectText(selector, text)` - 텍스트 확인
- `waitForSelector(selector)` - 요소 대기
- `screenshot(name)` - 스크린샷 캡처

## ✍️ 페이지 객체 작성 예시

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  // Locators (셀렉터 정의)
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    // 셀렉터 초기화
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  // Actions (사용자 행동)
  async goto() {
    await super.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Assertions (검증)
  async expectLoginSuccess() {
    await this.expectURL(/\/(feed|library)/);
  }

  async expectLoginError(message: string) {
    await this.expectVisible(this.errorMessage);
    await this.expectText(this.errorMessage, message);
  }
}
```

## 📋 작성 가이드라인

### 1. 명확한 이름 사용
- 클래스명: `{페이지명}Page` (예: LoginPage, LibraryPage)
- 메서드명: 동사 + 명사 (예: clickLoginButton, fillEmail)

### 2. Locator는 생성자에서 정의
```typescript
// ✅ 좋은 예
constructor(page: Page) {
  super(page);
  this.emailInput = page.locator('input[name="email"]');
}

// ❌ 나쁜 예
async fillEmail(email: string) {
  await this.page.locator('input[name="email"]').fill(email);
}
```

### 3. 비즈니스 로직과 테스트 분리
```typescript
// ✅ 좋은 예 (페이지 객체에는 액션만)
async login(email: string, password: string) {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.loginButton.click();
}

// ❌ 나쁜 예 (페이지 객체에 테스트 로직 포함)
async testValidLogin() {
  await this.login('test@example.com', 'password');
  expect(await this.page.url()).toContain('/feed');
}
```

### 4. 재사용 가능한 메서드 작성
```typescript
// 복잡한 플로우를 메서드로 추상화
async createNewJourney(bookTitle: string) {
  await this.searchBook(bookTitle);
  await this.selectFirstBook();
  await this.waitForMusicGeneration();
}
```

### 5. 대기는 명시적으로
```typescript
// ✅ 좋은 예
async waitForMusicGeneration() {
  await this.page.waitForResponse(
    (response) => response.url().includes('/api/music/generate'),
    { timeout: 60000 }
  );
}

// ❌ 나쁜 예
async waitForMusicGeneration() {
  await this.page.waitForTimeout(5000); // 고정된 대기 시간
}
```

## 🎨 컴포넌트 페이지 객체

Header, MusicPlayer 같은 공통 컴포넌트도 페이지 객체로 만들 수 있습니다.

```typescript
// components/header.page.ts
export class HeaderComponent extends BasePage {
  readonly searchInput: Locator;
  readonly profileMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('header input[type="search"]');
    this.profileMenu = page.locator('header [data-testid="profile-menu"]');
    this.logoutButton = page.locator('button:has-text("로그아웃")');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async logout() {
    await this.profileMenu.click();
    await this.logoutButton.click();
  }
}
```

## 🔗 테스트에서 사용하기

```typescript
import { test } from '@playwright/test';
import { LoginPage } from '../pages/auth/login.page';
import { LibraryPage } from '../pages/library/library.page';

test('로그인 후 책장 접근', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const libraryPage = new LibraryPage(page);

  // 로그인
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password');
  await loginPage.expectLoginSuccess();

  // 책장 이동
  await libraryPage.goto();
  await libraryPage.expectJourneysVisible();
});
```

## 📚 참고 자료
- [Playwright Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices for Page Objects](https://playwright.dev/docs/best-practices#use-locators)
