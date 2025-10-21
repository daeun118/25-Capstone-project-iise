import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookCover } from './BookCover';
import { BookOpen, Plus } from 'lucide-react';

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
      <div className="flex gap-3 p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer" onClick={handleAction}>
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
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          <BookCover src={book.coverUrl} alt={book.title} size="md" />
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
            <CardDescription className="mt-1">{book.author}</CardDescription>
            {book.publisher && (
              <p className="text-xs text-muted-foreground mt-1">{book.publisher}</p>
            )}
            {book.category && (
              <Badge variant="secondary" className="mt-2">
                {book.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {book.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
        </CardContent>
      )}

      {showActions && (
        <CardFooter>
          <Button onClick={handleAction} className="w-full">
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
        </CardFooter>
      )}
    </Card>
  );
}
