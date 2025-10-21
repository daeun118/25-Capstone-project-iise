import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/google-books/client';

/**
 * 도서 검색 API
 * GET /api/books/search?q={query}&maxResults={number}
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const maxResultsParam = searchParams.get('maxResults');

    // 검색어 검증
    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요.' },
        { status: 400 }
      );
    }

    // maxResults 파라미터 (기본값: 10, 최대: 40)
    const maxResults = Math.min(
      parseInt(maxResultsParam || '10', 10),
      40
    );

    // Google Books API로 검색
    const books = await searchBooks(query, maxResults);

    return NextResponse.json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    console.error('Book search API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '도서 검색 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
