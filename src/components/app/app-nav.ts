import type { LucideIcon } from 'lucide-react';
import { Home, Utensils, Activity, LayoutDashboard } from 'lucide-react';

export interface AppNavItem {
  href: string;
  /** Sidebar / sheet (long) */
  label: string;
  /** Bottom nav */
  shortLabel: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: '/home', label: 'Wellness Dashboard', shortLabel: 'Home', icon: Home },
  { href: '/fuel', label: 'Intake', shortLabel: 'Intake', icon: Utensils },
  { href: '/vitality', label: 'Vitality', shortLabel: 'Vitality', icon: Activity },
  { href: '/blueprint', label: 'Blueprint', shortLabel: 'Blueprint', icon: LayoutDashboard },
];
