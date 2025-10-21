/**
 * 테스트 상수
 *
 * 테스트에서 사용되는 공통 상수들을 정의합니다.
 */

// 타임아웃 (ms)
export const TIMEOUTS = {
  SHORT: 5000, // 5초
  MEDIUM: 15000, // 15초
  LONG: 30000, // 30초
  MUSIC_GENERATION: 60000, // 60초 (음악 생성)
  VERY_LONG: 120000, // 2분
} as const;

// 테스트 데이터
export const TEST_USERS = {
  DEFAULT: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    nickname: '테스트유저',
  },
  USER1: {
    email: 'user1@example.com',
    password: 'User1Password123!',
    nickname: '사용자1',
  },
  USER2: {
    email: 'user2@example.com',
    password: 'User2Password123!',
    nickname: '사용자2',
  },
} as const;

// 테스트용 도서 데이터
export const TEST_BOOKS = {
  OLD_MAN_SEA: {
    isbn: '9780684801223',
    title: '노인과 바다',
    author: '어니스트 헤밍웨이',
    category: '외국소설',
  },
  LITTLE_PRINCE: {
    isbn: '9788932917245',
    title: '어린 왕자',
    author: '생텍쥐페리',
    category: '외국소설',
  },
} as const;

// 셀렉터
export const SELECTORS = {
  // 공통
  LOADING_SPINNER: '[data-testid="loading-spinner"]',
  ERROR_MESSAGE: '[role="alert"]',
  TOAST: '[data-testid="toast"]',

  // 헤더
  HEADER: 'header',
  SEARCH_INPUT: 'header input[type="search"]',
  PROFILE_MENU: '[data-testid="profile-menu"]',
  LOGOUT_BUTTON: 'button:has-text("로그아웃")',

  // 인증
  EMAIL_INPUT: 'input[name="email"]',
  PASSWORD_INPUT: 'input[name="password"]',
  LOGIN_BUTTON: 'button[type="submit"]',
  SIGNUP_BUTTON: 'button[type="submit"]',

  // 독서 여정
  BOOK_CARD: '[data-testid="book-card"]',
  JOURNEY_CARD: '[data-testid="journey-card"]',
  ADD_LOG_BUTTON: '[data-testid="add-log"]',
  COMPLETE_BUTTON: '[data-testid="complete-journey"]',

  // 음악 플레이어
  MUSIC_PLAYER: '[data-testid="music-player"]',
  PLAY_BUTTON: '[data-testid="play-button"]',
  PAUSE_BUTTON: '[data-testid="pause-button"]',
  WAVEFORM: '[data-testid="waveform"]',

  // 게시물
  POST_CARD: '[data-testid="post-card"]',
  LIKE_BUTTON: '[data-testid="like-button"]',
  COMMENT_BUTTON: '[data-testid="comment-button"]',
  BOOKMARK_BUTTON: '[data-testid="bookmark-button"]',
  CREATE_POST_BUTTON: '[data-testid="create-post"]',

  // 폼
  FORM_INPUT: 'input, textarea',
  SUBMIT_BUTTON: 'button[type="submit"]',
  CANCEL_BUTTON: 'button:has-text("취소")',
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',

  // 도서
  BOOKS_SEARCH: '/api/books/search',

  // 독서 여정
  JOURNEYS: '/api/journeys',
  JOURNEY_CREATE: '/api/journeys/create',
  JOURNEY_DETAIL: (id: string) => `/api/journeys/${id}`,
  JOURNEY_LOGS: (id: string) => `/api/journeys/${id}/logs`,
  JOURNEY_COMPLETE: (id: string) => `/api/journeys/${id}/complete`,

  // 음악
  MUSIC_GENERATE: '/api/music/generate',

  // 게시물
  POSTS: '/api/posts',
  POST_DETAIL: (id: string) => `/api/posts/${id}`,
  POST_LIKE: (id: string) => `/api/posts/${id}/like`,
  POST_COMMENTS: (id: string) => `/api/posts/${id}/comments`,
  POST_BOOKMARK: (id: string) => `/api/posts/${id}/bookmark`,
} as const;

// 라우트
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FEED: '/feed',
  LIBRARY: '/library',
  JOURNEY_NEW: '/journey/new',
  JOURNEY_DETAIL: (id: string) => `/journey/${id}`,
  MY: '/my',
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  INVALID_EMAIL: '올바른 이메일 주소를 입력하세요',
  INVALID_PASSWORD: '비밀번호는 8자 이상이어야 합니다',
  LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다',
} as const;

// 브라우저 뷰포트
export const VIEWPORTS = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1920, height: 1080 },
} as const;
