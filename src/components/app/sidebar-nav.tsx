'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, Utensils, Activity, LayoutDashboard, Leaf, LogOut, User, Settings, Shield } from 'lucide-react';
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

const navItems = [
  { href: '/home', label: 'Wellness Dashboard', icon: Home },
  { href: '/fuel', label: 'Intake', icon: Utensils },
  { href: '/vitality', label: 'Vitality', icon: Activity },
  { href: '/blueprint', label: 'Blueprint', icon: LayoutDashboard },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const email = session?.user?.email || '';
  const fallbackName = email ? email.split('@')[0].replace(/[._-]+/g, ' ') : 'User';
  const displayName = session?.user?.name?.trim() || fallbackName || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-primary/20 bg-[rgba(10,12,30,0.72)] backdrop-blur-[40px] backdrop-saturate-[1.6]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-primary/20 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-cyan-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-lg gradient-text">FitNexus</span>
          <p className="text-[10px] text-muted-foreground leading-none">Wellness Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-cyan-400/10 text-primary shadow-[inset_0_0_20px_rgba(139,92,246,0.12)] border border-primary/20 animate-[borderGlow_4s_ease-in-out_infinite]'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-primary/20 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground">Manage account</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium truncate">{displayName}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/blueprint/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/blueprint/privacy" className="flex items-center gap-2 cursor-pointer">
                <Shield className="h-4 w-4" /> Privacy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/blueprint" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-2 cursor-pointer text-destructive">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
