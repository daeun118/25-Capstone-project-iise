'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookCover } from './BookCover';
import { BookOpen, Plus, Sparkles } from 'lucide-react';
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

interface BookCardProps {
  book: Book;
  variant?: 'search' | 'library' | 'compact';
  showActions?: boolean;
  onAction?: (book: Book) => void;
  actionLabel?: string;
}

export function BookCard({
  book,
  variant = 'search',
  showActions = true,
  onAction,
  actionLabel,
}: BookCardProps) {
  const handleAction = () => {
    onAction?.(book);
  };

  if (variant === 'compact') {
    return (
      <m.div
        className="flex gap-3 p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
        onClick={handleAction}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <BookCover src={book.coverUrl} alt={book.title} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm line-clamp-2">{book.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
          {book.category && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {book.category}
            </Badge>
          )}
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-200 group">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            <m.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <BookCover src={book.coverUrl} alt={book.title} size="md" />
            </m.div>
            <div className="flex-1 min-w-0">
              <CardTitle className="line-clamp-2 text-lg group-hover:text-indigo-600 transition-colors">{book.title}</CardTitle>
              <CardDescription className="mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500 opacity-70" />
                {book.author}
              </CardDescription>
              {book.publisher && (
                <p className="text-xs text-muted-foreground mt-1">{book.publisher}</p>
              )}
              {book.category && (
                <Badge variant="secondary" className="mt-2 shadow-sm">
                  {book.category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {book.description && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{book.description}</p>
          </CardContent>
        )}

        {showActions && (
          <CardFooter>
            <m.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAction}
                className={`w-full h-11 font-semibold shadow-md hover:shadow-lg transition-all border-0 text-white ${
                  variant === 'search' ? 'bg-gradient-accent' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}
              >
                {variant === 'search' ? (
                  <>
                    <Plus className="mr-2 size-4" />
                    {actionLabel || '독서 시작'}
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 size-4" />
                    {actionLabel || '계속 읽기'}
                  </>
                )}
              </Button>
            </m.div>
          </CardFooter>
        )}
      </Card>
    </m.div>
  );
}
