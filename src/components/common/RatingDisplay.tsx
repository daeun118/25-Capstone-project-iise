'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function RatingDisplay({
  rating,
  readonly = false,
  onChange,
  className,
}: RatingDisplayProps) {
  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const isFilled = value <= rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            disabled={readonly}
            className={cn(
              'focus:outline-none',
              !readonly && 'hover:scale-110 transition-transform cursor-pointer',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                'size-6',
                isFilled
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
