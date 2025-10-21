/**
 * 테스트 데이터 생성기
 *
 * 무작위 테스트 데이터를 생성하는 유틸리티 함수들입니다.
 */

/**
 * 무작위 이메일 생성
 */
export function generateEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * 무작위 비밀번호 생성
 */
export function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * 무작위 닉네임 생성
 */
export function generateNickname(): string {
  const adjectives = ['행복한', '즐거운', '멋진', '훌륭한', '재미있는'];
  const nouns = ['독서가', '책벌레', '리더', '모험가', '탐험가'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
}

/**
 * 테스트 사용자 데이터 생성
 */
export function generateTestUser() {
  return {
    email: generateEmail(),
    password: generatePassword(),
    nickname: generateNickname(),
  };
}

/**
 * 무작위 ISBN 생성 (테스트용)
 */
export function generateISBN(): string {
  const prefix = '978';
  const group = Math.floor(Math.random() * 10);
  const publisher = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const title = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const check = Math.floor(Math.random() * 10);
  return `${prefix}${group}${publisher}${title}${check}`;
}

/**
 * 무작위 도서 데이터 생성
 */
export function generateBook() {
  const titles = ['테스트 도서', '샘플 책', '예제 북', '더미 서적'];
  const authors = ['홍길동', '김철수', '이영희', '박민수'];
  const categories = ['소설', '에세이', '자기계발', '과학'];

  return {
    isbn: generateISBN(),
    title: titles[Math.floor(Math.random() * titles.length)],
    author: authors[Math.floor(Math.random() * authors.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    coverUrl: `https://via.placeholder.com/150x200?text=${encodeURIComponent('도서 표지')}`,
  };
}

/**
 * 무작위 독서 기록 데이터 생성
 */
export function generateLog() {
  const quotes = [
    '인상 깊은 구절입니다.',
    '마음에 와닿는 문장이었습니다.',
    '기억하고 싶은 내용입니다.',
  ];
  const memos = [
    '오늘 읽은 부분은 정말 재미있었다.',
    '주인공의 선택이 인상적이었다.',
    '예상치 못한 전개가 흥미로웠다.',
  ];
  const emotionSets = [
    ['기쁨', '감동'],
    ['슬픔', '고독'],
    ['분노', '좌절'],
    ['평화', '만족'],
  ];

  return {
    quote: quotes[Math.floor(Math.random() * quotes.length)],
    memo: memos[Math.floor(Math.random() * memos.length)],
    emotions: emotionSets[Math.floor(Math.random() * emotionSets.length)],
  };
}

/**
 * 무작위 게시물 내용 생성
 */
export function generatePostContent(): string {
  const contents = [
    '이 책을 읽고 많은 것을 느꼈습니다.',
    '정말 추천하고 싶은 책입니다.',
    '오랜만에 완독한 책이네요.',
    '여러분도 꼭 읽어보세요!',
  ];
  return contents[Math.floor(Math.random() * contents.length)];
}

/**
 * 무작위 댓글 생성
 */
export function generateComment(): string {
  const comments = [
    '좋은 리뷰 감사합니다!',
    '저도 읽어보고 싶네요.',
    '공감합니다.',
    '재미있었나요?',
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * 무작위 날짜 생성 (최근 30일 이내)
 */
export function generateRecentDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

/**
 * 무작위 별점 생성 (1-5)
 */
export function generateRating(): number {
  return Math.floor(Math.random() * 5) + 1;
}
