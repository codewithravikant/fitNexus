'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Leaf, LogOut, User, Settings, Shield, PanelLeftClose, PanelLeft, Menu } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { APP_NAV_ITEMS } from '@/components/app/app-nav';

const STORAGE_KEY = 'fitnexus-sidebar-collapsed';

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  const fallbackName = email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'User';
  const displayName = session?.user?.name?.trim() || fallbackName || 'User';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'U';

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const applyWidth = useCallback((isCollapsed: boolean) => {
    const w = isCollapsed ? '4.5rem' : '15rem';
    document.documentElement.style.setProperty('--sidebar-width', w);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted sidebar preference after hydration
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    applyWidth(collapsed);
  }, [collapsed, applyWidth]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const navLinkClass = (isActive: boolean, collapsedRail: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200',
      collapsedRail ? 'justify-center px-2' : 'px-3',
      isActive
        ? 'border border-primary/20 bg-gradient-to-r from-primary/20 to-cyan-400/10 text-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.12)] animate-[borderGlow_4s_ease-in-out_infinite]'
        : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
    );

  const userTriggerButton = (collapsedRail: boolean) => (
    <button
      type="button"
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        collapsedRail ? 'justify-center px-2' : 'gap-3'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={session?.user?.image || ''} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      {!collapsedRail && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="text-[10px] text-muted-foreground">Manage account</p>
        </div>
      )}
      {collapsedRail && <span className="sr-only">{displayName}. Manage account</span>}
    </button>
  );

  const dropdownMenu = (collapsedRail: boolean) => (
    <DropdownMenu>
      {collapsedRail ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{userTriggerButton(true)}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{displayName}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger asChild>{userTriggerButton(false)}</DropdownMenuTrigger>
      )}
      <DropdownMenuContent align="end" side="top" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{displayName}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/blueprint/profile" className="flex cursor-pointer items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/blueprint/privacy" className="flex cursor-pointer items-center gap-2">
            <Shield className="h-4 w-4" /> Privacy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/blueprint" className="flex cursor-pointer items-center gap-2">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex cursor-pointer items-center gap-2 text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const sheetNav = (
    <nav className="flex flex-col gap-1 pt-2">
      {APP_NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={navLinkClass(isActive, false)}
          >
            <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-primary/20 bg-[rgba(10,12,30,0.82)] px-4 backdrop-blur-[40px] backdrop-saturate-[1.6] md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="font-heading text-base font-bold gradient-text">FitNexus</span>
            <p className="text-[10px] leading-none text-muted-foreground">Wellness Platform</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[min(100%,20rem)] flex-col sm:max-w-[20rem]">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-400 text-white">
                <Leaf className="h-5 w-5" />
              </span>
              FitNexus
            </SheetTitle>
          </SheetHeader>
          {sheetNav}
          <div className="mt-auto border-t border-primary/20 pt-4">
            <p className="mb-2 text-xs text-muted-foreground">Account</p>
            <div className="space-y-1">
              <Link
                href="/blueprint/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link
                href="/blueprint/privacy"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <Shield className="h-4 w-4" /> Privacy
              </Link>
              <Link
                href="/blueprint"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-primary/20 bg-[rgba(10,12,30,0.72)] backdrop-blur-[40px] backdrop-saturate-[1.6] transition-[width] duration-200 ease-out md:flex',
          collapsed ? 'w-[4.5rem]' : 'w-60'
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-primary/20',
            collapsed ? 'flex-col justify-center gap-2 px-2 py-3' : 'flex-row justify-between px-3'
          )}
        >
          <div className={cn('flex min-w-0 items-center gap-3', collapsed && 'flex-col gap-2')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]">
              <Leaf className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block truncate font-bold gradient-text">FitNexus</span>
                <p className="text-[10px] leading-none text-muted-foreground">Wellness Platform</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              'shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              collapsed && 'p-1.5'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-1 flex-col space-y-1 overflow-y-auto px-3 py-4">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const linkInner = (
              <Link href={item.href} className={navLinkClass(isActive, collapsed)}>
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]')} />
                <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
              </Link>
            );
            if (!collapsed) return <div key={item.href}>{linkInner}</div>;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkInner}</TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="border-t border-primary/20 p-3">{dropdownMenu(collapsed)}</div>
      </aside>
    </TooltipProvider>
  );
}
