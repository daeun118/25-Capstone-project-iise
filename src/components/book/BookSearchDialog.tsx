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
import { Search, X, Sparkles, BookOpen } from 'lucide-react';
import { m } from 'framer-motion';

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
      // Google Books API 호출 (평균 4초 소요)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15초 타임아웃

      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`검색 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        throw new Error(data.error || '검색에 실패했습니다.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);

      // 타임아웃이나 네트워크 에러 시 사용자에게 알림
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.warn('검색 시간이 초과되었습니다. 다시 시도해주세요.');
        }
      }
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-2 shadow-2xl">
        {/* Gradient Top Border */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: 'linear-gradient(90deg, #a855f7, #ec4899, #f472b6)',
          }}
        />

        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <m.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              }}
            >
              <Search className="w-6 h-6 text-white" />
            </m.div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                도서 검색
              </DialogTitle>
              <DialogDescription className="text-base">
                독서를 시작할 책을 검색하세요
              </DialogDescription>
            </div>
            <m.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-pink-500" />
            </m.div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <m.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="size-5 text-purple-500" />
              </m.div>
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="책 제목, 저자, ISBN으로 검색"
              className="pl-11 pr-10 h-12 text-base border-2 border-purple-200/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 bg-gradient-to-br from-purple-50/30 to-pink-50/30 transition-all"
            />
            {query && (
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="size-8 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="size-4" />
                </Button>
              </m.div>
            )}
          </div>
          <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="h-12 px-6 font-bold border-0 shadow-lg hover:shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              }}
            >
              <Search className="mr-2 size-5" />
              검색
            </Button>
          </m.div>
        </form>

        <div className="flex-1 overflow-y-auto mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {/* Skeleton Cards */}
              {[1, 2, 3].map((i) => (
                <m.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl border-2 border-purple-200/30 bg-gradient-to-br from-purple-50/30 to-pink-50/30"
                >
                  {/* Book Cover Skeleton */}
                  <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-purple-200 to-pink-200 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    {/* Title Skeleton */}
                    <div className="h-5 w-3/4 rounded bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse" />
                    {/* Author Skeleton */}
                    <div className="h-4 w-1/2 rounded bg-gradient-to-r from-purple-100 to-pink-100 animate-pulse" />
                    {/* Details Skeleton */}
                    <div className="h-3 w-2/3 rounded bg-gradient-to-r from-purple-100 to-pink-100 animate-pulse" />
                  </div>
                </m.div>
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-16 space-y-4"
            >
              <m.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100"
              >
                <Search className="w-10 h-10 text-purple-500" />
              </m.div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">검색 결과가 없습니다</h3>
                <p className="text-sm text-muted-foreground">다른 키워드로 검색해보세요</p>
              </div>
            </m.div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((book, index) => (
                <m.div
                  key={book.isbn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="transition-shadow"
                >
                  <BookCard
                    book={book}
                    variant="search"
                    onAction={handleSelectBook}
                    actionLabel="선택"
                  />
                </m.div>
              ))}
            </div>
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-4"
            >
              <m.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100"
              >
                <BookOpen className="w-12 h-12 text-purple-500" />
              </m.div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">책을 찾아보세요</h3>
                <p className="text-sm text-muted-foreground">책 제목, 저자, ISBN으로 검색해보세요</p>
              </div>
            </m.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
