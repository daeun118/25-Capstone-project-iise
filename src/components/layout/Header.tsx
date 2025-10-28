'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { UserProfileDropdown } from '@/components/user/UserProfileDropdown';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { SignupDialog } from '@/components/auth/SignupDialog';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Menu, X, Home, Compass, Library, Bookmark, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-lg text-slate-900 hidden sm:inline">
            ReadTune
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-600 hover:text-slate-900"
                    onClick={() => setLoginOpen(true)}
                  >
                    로그인
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSignupOpen(true)}
                  >
                    회원가입
                  </Button>
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 p-4 bg-white space-y-4">
          <nav className="flex flex-col space-y-1">
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
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setLoginOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                로그인
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSignupOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                회원가입
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Auth Dialogs */}
      <LoginDialog 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupDialog 
        open={signupOpen} 
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </header>
  );
}
