'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookCard } from './BookCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, X } from 'lucide-react';

interface Book {
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  coverUrl?: string;
  category?: string;
  description?: string;
}

interface BookSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBook: (book: Book) => void;
}

export function BookSearchDialog({
  open,
  onOpenChange,
  onSelectBook,
}: BookSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Google Books API 호출
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        throw new Error(data.error || '검색에 실패했습니다.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBook = (book: Book) => {
    onSelectBook(book);
    onOpenChange(false);
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>도서 검색</DialogTitle>
          <DialogDescription>
            독서를 시작할 책을 검색하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="책 제목, 저자, ISBN으로 검색"
              className="pl-10 pr-10"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()}>
            검색
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" message="도서 검색 중..." />
            </div>
          ) : hasSearched && results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="검색 결과가 없습니다"
              description="다른 키워드로 검색해보세요"
            />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((book) => (
                <BookCard
                  key={book.isbn}
                  book={book}
                  variant="search"
                  onAction={handleSelectBook}
                  actionLabel="선택"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="size-12 mx-auto mb-4 opacity-50" />
              <p>책 제목이나 저자로 검색해보세요</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
