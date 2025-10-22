import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { m } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient?: string;
  delay?: number;
  className?: string;
}

export const StatsCard = memo(function StatsCard({
  label,
  value,
  description,
  icon: Icon,
  iconColor,
  trend,
  trendValue,
  gradient = 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  delay = 0,
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="size-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="size-4 text-red-500" />;
      case 'neutral':
        return <Minus className="size-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'neutral':
        return 'text-muted-foreground';
      default:
        return '';
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card className={cn('card-elevated group cursor-pointer', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            {Icon && (
              <m.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: gradient }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Icon className={cn('w-6 h-6', iconColor || 'text-white')} />
              </m.div>
            )}
          </div>
          <m.div
            className="text-4xl font-bold mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
          >
            {value}
          </m.div>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {trendValue && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </m.div>
  );
});
