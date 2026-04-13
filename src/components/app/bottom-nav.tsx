'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAV_ITEMS } from '@/components/app/app-nav';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/20 bg-[rgba(10,12,30,0.82)] backdrop-blur-[40px] backdrop-saturate-[1.6] md:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {APP_NAV_ITEMS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-3 py-2 text-xs transition-all duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-primary/10 drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]')} />
              <span className={cn(isActive && 'font-medium')}>{tab.shortLabel}</span>
              {isActive && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
