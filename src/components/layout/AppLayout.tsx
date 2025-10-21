import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
