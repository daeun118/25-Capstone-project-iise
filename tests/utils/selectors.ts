/**
 * 셀렉터 유틸리티
 *
 * 공통 셀렉터를 생성하는 헬퍼 함수들입니다.
 */

/**
 * data-testid 셀렉터 생성
 */
export function testId(id: string): string {
  return `[data-testid="${id}"]`;
}

/**
 * 텍스트로 요소 찾기
 */
export function byText(text: string): string {
  return `text="${text}"`;
}

/**
 * 정규식으로 텍스트 찾기
 */
export function byTextRegex(pattern: string | RegExp): string {
  const regex = typeof pattern === 'string' ? pattern : pattern.source;
  return `text=/${regex}/`;
}

/**
 * role로 요소 찾기
 */
export function byRole(role: string, name?: string): string {
  if (name) {
    return `role=${role}[name="${name}"]`;
  }
  return `role=${role}`;
}

/**
 * placeholder로 input 찾기
 */
export function byPlaceholder(text: string): string {
  return `[placeholder="${text}"]`;
}

/**
 * aria-label로 요소 찾기
 */
export function byAriaLabel(label: string): string {
  return `[aria-label="${label}"]`;
}

/**
 * CSS 클래스로 요소 찾기
 */
export function byClass(className: string): string {
  return `.${className}`;
}

/**
 * 여러 셀렉터 조합 (AND)
 */
export function combine(...selectors: string[]): string {
  return selectors.join('');
}

/**
 * n번째 요소 선택
 */
export function nth(selector: string, index: number): string {
  return `${selector} >> nth=${index}`;
}

/**
 * 첫 번째 요소
 */
export function first(selector: string): string {
  return nth(selector, 0);
}

/**
 * 마지막 요소
 */
export function last(selector: string): string {
  return `${selector} >> nth=-1`;
}

/**
 * 자식 요소 선택
 */
export function child(parent: string, child: string): string {
  return `${parent} >> ${child}`;
}

/**
 * 부모 요소에서 텍스트로 자식 찾기
 */
export function hasText(parent: string, text: string): string {
  return `${parent}:has-text("${text}")`;
}

// 자주 사용하는 셀렉터 미리 정의
export const CommonSelectors = {
  // 버튼
  submitButton: () => byRole('button', '제출'),
  cancelButton: () => byRole('button', '취소'),
  saveButton: () => byRole('button', '저장'),
  deleteButton: () => byRole('button', '삭제'),

  // 입력
  emailInput: () => 'input[name="email"]',
  passwordInput: () => 'input[name="password"]',
  searchInput: () => 'input[type="search"]',

  // 공통 UI
  loadingSpinner: () => testId('loading-spinner'),
  errorAlert: () => '[role="alert"]',
  successToast: () => testId('toast-success'),
  errorToast: () => testId('toast-error'),

  // 내비게이션
  header: () => 'header',
  footer: () => 'footer',
  sidebar: () => testId('sidebar'),
  profileMenu: () => testId('profile-menu'),
};
