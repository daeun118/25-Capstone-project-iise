/**
 * Mureka Music API Mock 데이터
 *
 * 음악 생성 API를 Mock하여 테스트 속도를 높입니다.
 */

/**
 * Mock 음악 파일 URL
 */
export const mockMusicUrls = [
  'https://example.com/mock-music-v0.mp3',
  'https://example.com/mock-music-v1.mp3',
  'https://example.com/mock-music-v2.mp3',
  'https://example.com/mock-music-vFinal.mp3',
];

/**
 * Mock 음악 생성 응답
 */
export function generateMockMusicResponse(version: string) {
  return {
    success: true,
    data: {
      trackId: `mock-track-${version}-${Date.now()}`,
      version,
      musicUrl: mockMusicUrls[Math.floor(Math.random() * mockMusicUrls.length)],
      prompt: `Mock music for ${version}`,
      genre: 'cinematic',
      mood: 'contemplative',
      tempo: 90,
      duration: 180, // 3분
      status: 'completed',
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Mock 음악 생성 지연 (실제 API 동작 시뮬레이션)
 */
export async function simulateMusicGenerationDelay() {
  // 실제 API는 30초~2분 걸리지만, Mock에서는 2초만 대기
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

/**
 * Mock 음악 메타데이터
 */
export const mockMusicMetadata = {
  v0: {
    title: 'Journey Beginning',
    description: 'The start of your reading journey',
    genre: 'ambient',
    mood: 'hopeful',
    tempo: 80,
  },
  v1: {
    title: 'First Impressions',
    description: 'Your initial thoughts and feelings',
    genre: 'cinematic',
    mood: 'curious',
    tempo: 90,
  },
  vFinal: {
    title: 'Journey Complete',
    description: 'The culmination of your reading experience',
    genre: 'orchestral',
    mood: 'triumphant',
    tempo: 120,
  },
};
