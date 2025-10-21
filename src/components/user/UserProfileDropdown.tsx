'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from './UserAvatar';
import { BookOpen, Bookmark, User, Settings, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
}

interface UserProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

export function UserProfileDropdown({ user, onLogout }: UserProfileDropdownProps) {
  const [isDark, setIsDark] = useState(false);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    // TODO: 실제 테마 변경 로직 (ThemeToggle과 통합)
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
          <UserAvatar user={user} size="sm" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{user.nickname}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => window.location.href = '/my'}>
          <User className="mr-2 size-4" />
          마이페이지
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => window.location.href = '/library'}>
          <BookOpen className="mr-2 size-4" />
          내 책장
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => window.location.href = '/bookmarks'}>
          <Bookmark className="mr-2 size-4" />
          보관함
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
          <Settings className="mr-2 size-4" />
          설정
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleThemeToggle}>
          {isDark ? (
            <>
              <Sun className="mr-2 size-4" />
              라이트 모드
            </>
          ) : (
            <>
              <Moon className="mr-2 size-4" />
              다크 모드
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
