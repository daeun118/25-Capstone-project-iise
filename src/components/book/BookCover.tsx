import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';

interface BookCoverProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-24',
  md: 'w-24 h-36',
  lg: 'w-32 h-48',
  xl: 'w-40 h-60',
};

export function BookCover({ src, alt, size = 'md', className }: BookCoverProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg shadow-md bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <BookOpen className="size-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
