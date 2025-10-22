import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { m } from 'framer-motion';

interface StatsCardSkeletonProps {
  delay?: number;
}

export function StatsCardSkeleton({ delay = 0 }: StatsCardSkeletonProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="card-elevated">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    </m.div>
  );
}
