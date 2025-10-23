import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'http',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
    ],
    // 이미지 최적화 설정
    formats: ['image/avif', 'image/webp'], // AVIF 우선, WebP fallback
    deviceSizes: [640, 750, 828, 1080, 1200], // 반응형 이미지 크기
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 작은 이미지 크기
  },
};

export default nextConfig;
