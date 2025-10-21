/**
 * Google Books API Mock 데이터
 *
 * 실제 API 호출 없이 테스트할 수 있는 목 데이터입니다.
 */

export const mockBooks = [
  {
    isbn: '9780684801223',
    title: '노인과 바다',
    author: '어니스트 헤밍웨이',
    publisher: '문학동네',
    publishedDate: '2012-01-15',
    description: '쿠바의 한 노어부가 84일 동안 고기를 잡지 못하다가...',
    coverUrl: 'https://via.placeholder.com/150x200?text=노인과바다',
    category: '외국소설',
    pageCount: 128,
  },
  {
    isbn: '9788932917245',
    title: '어린 왕자',
    author: '생텍쥐페리',
    publisher: '열린책들',
    publishedDate: '2015-03-20',
    description: '사하라 사막에 불시착한 비행사와 어린 왕자의 이야기...',
    coverUrl: 'https://via.placeholder.com/150x200?text=어린왕자',
    category: '외국소설',
    pageCount: 120,
  },
  {
    isbn: '9788936434267',
    title: '1984',
    author: '조지 오웰',
    publisher: '민음사',
    publishedDate: '2013-07-10',
    description: '전체주의 디스토피아 사회를 그린 소설...',
    coverUrl: 'https://via.placeholder.com/150x200?text=1984',
    category: '외국소설',
    pageCount: 396,
  },
];

/**
 * Google Books API 응답 형식으로 변환
 */
export function formatAsGoogleBooksResponse(books: typeof mockBooks) {
  return {
    kind: 'books#volumes',
    totalItems: books.length,
    items: books.map((book) => ({
      kind: 'books#volume',
      id: book.isbn,
      volumeInfo: {
        title: book.title,
        authors: [book.author],
        publisher: book.publisher,
        publishedDate: book.publishedDate,
        description: book.description,
        pageCount: book.pageCount,
        categories: [book.category],
        imageLinks: {
          thumbnail: book.coverUrl,
          smallThumbnail: book.coverUrl,
        },
        industryIdentifiers: [
          {
            type: 'ISBN_13',
            identifier: book.isbn,
          },
        ],
      },
    })),
  };
}

/**
 * 검색어로 Mock 데이터 필터링
 */
export function searchMockBooks(query: string) {
  const lowerQuery = query.toLowerCase();
  const filtered = mockBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery)
  );
  return formatAsGoogleBooksResponse(filtered);
}
