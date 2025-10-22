'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span className="text-sm font-medium text-slate-900">
            {user.nickname}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-slate-900">{user.nickname}</p>
            <p className="text-xs text-slate-500 font-normal">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={() => window.location.href = '/my'}
          className="cursor-pointer"
        >
          <UserIcon className="mr-2 size-4" />
          <span>프로필</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={onLogout} 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 size-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
