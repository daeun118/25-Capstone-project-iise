'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, Home, Compass, Library, User, Bookmark } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  readingCount?: number;
  completedCount?: number;
  className?: string;
}

export function Sidebar({ readingCount = 0, completedCount = 0, className }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: '홈',
      href: '/',
      icon: Home,
    },
    {
      title: '피드',
      href: '/feed',
      icon: Compass,
    },
    {
      title: '내 책장',
      href: '/library',
      icon: Library,
    },
    {
      title: '보관함',
      href: '/bookmarks',
      icon: Bookmark,
    },
    {
      title: '마이페이지',
      href: '/my',
      icon: User,
    },
  ];

  return (
    <aside className={cn('w-64 h-full border-r bg-background/95', className)}>
      <div className="space-y-4 py-4">
        {/* Logo */}
        <div className="px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="size-6 text-primary" />
            <span>ReadTune</span>
          </Link>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Reading Stats */}
        <div className="px-4 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">독서 현황</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>읽는 중</span>
              <Badge variant="secondary">{readingCount}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>완독</span>
              <Badge variant="default">{completedCount}</Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
