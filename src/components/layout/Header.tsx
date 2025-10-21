'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { AccessibilitySettings } from '@/components/settings/AccessibilitySettings';
import { UserProfileDropdown } from '@/components/user/UserProfileDropdown';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Music, Search, Bell, Menu, X, Home, Compass, Library, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  const isLoggedIn = !!user;

  const navItems = [
    { href: '/', label: '홈', icon: Home },
    { href: '/feed', label: '피드', icon: Compass },
    { href: '/library', label: '내 책장', icon: Library },
    { href: '/my/bookmarks', label: '보관함', icon: Bookmark },
    { href: '/my', label: '마이', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl" style={{
      borderBottom: '1px solid transparent',
      borderImage: 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2)) 1'
    }}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <BookOpen className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
            <Music className="w-3 h-3 text-secondary-500 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent hidden sm:inline">
            BookBeats
          </span>
        </Link>

        {/* Desktop Tab Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="책 검색..."
              className="w-[200px] lg:w-[300px] pl-9 bg-background/50 border-primary-200 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          {isLoggedIn && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          )}

          {/* Accessibility Settings */}
          <AccessibilitySettings />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu or Login */}
          {!loading && (
            <>
              {isLoggedIn && user ? (
                <UserProfileDropdown 
                  user={{
                    id: user.id,
                    nickname: user.user_metadata?.nickname || user.email?.split('@')[0] || '사용자',
                    email: user.email || '',
                    avatarUrl: user.user_metadata?.avatar_url || null,
                  }}
                  onLogout={signOut}
                />
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg">
                      회원가입
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="책 검색..."
              className="w-full pl-9"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background space-y-4">
          <nav className="flex flex-col space-y-2">
          {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
          <Link
          key={item.href}
          href={item.href}
          className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
            isActive 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
            onClick={() => setIsMenuOpen(false)}
            >
                <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {!loading && !isLoggedIn && (
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  로그인
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg">
                  회원가입
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
