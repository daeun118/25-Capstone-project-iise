import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
}

interface UserAvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'size-6 text-xs',
  sm: 'size-8 text-sm',
  md: 'size-10 text-base',
  lg: 'size-12 text-lg',
  xl: 'size-16 text-xl',
};

const onlineIndicatorSize = {
  xs: 'size-1.5',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
  xl: 'size-4',
};

export function UserAvatar({
  user,
  size = 'md',
  showOnlineStatus = false,
  className,
}: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        <AvatarImage src={user.avatarUrl} alt={user.nickname} />
        <AvatarFallback>{getInitials(user.nickname)}</AvatarFallback>
      </Avatar>

      {showOnlineStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-background',
            onlineIndicatorSize[size]
          )}
        />
      )}
    </div>
  );
}
