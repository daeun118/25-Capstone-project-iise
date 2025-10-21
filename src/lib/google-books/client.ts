interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
  };
}

interface GoogleBooksResponse {
  items?: GoogleBooksVolume[];
  totalItems: number;
}

export interface Book {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  coverUrl?: string;
  category?: string;
  description?: string;
}

/**
 * Google Books API로 도서 검색
 * @param query - 검색어 (제목, 저자, ISBN 등)
 * @param maxResults - 최대 결과 수 (기본값: 10)
 */
export async function searchBooks(
  query: string,
  maxResults: number = 10
): Promise<Book[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&langRestrict=ko${apiKey ? `&key=${apiKey}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Google Books API 응답을 우리 Book 형식으로 변환
    return data.items.map(transformGoogleBookToBook).filter(Boolean) as Book[];
  } catch (error) {
    console.error('Failed to search books:', error);
    throw error;
  }
}

/**
 * Google Books Volume을 우리 Book 인터페이스로 변환
 */
function transformGoogleBookToBook(volume: GoogleBooksVolume): Book | null {
  const { volumeInfo } = volume;

  // 필수 필드가 없으면 null 반환
  if (!volumeInfo.title) {
    return null;
  }

  // ISBN 추출 (ISBN_13 우선, 없으면 ISBN_10)
  const isbn13 = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_13'
  )?.identifier;
  const isbn10 = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_10'
  )?.identifier;
  const isbn = isbn13 || isbn10 || volume.id; // ISBN이 없으면 Google Books ID 사용

  // 저자 (배열을 쉼표로 구분된 문자열로 변환)
  const author = volumeInfo.authors?.join(', ') || '저자 미상';

  // 표지 이미지 (thumbnail 우선, 없으면 smallThumbnail)
  const coverUrl =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  // 카테고리 (첫 번째 카테고리만 사용)
  const category = volumeInfo.categories?.[0];

  return {
    isbn,
    title: volumeInfo.title,
    author,
    publisher: volumeInfo.publisher,
    coverUrl,
    category,
    description: volumeInfo.description,
  };
}
