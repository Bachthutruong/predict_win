
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Trophy,
  Users,
  Lightbulb,
  ShieldCheck,
  Gift,
  HelpCircle,
  Coins
} from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Icons } from '@/components/icons';
import { Button } from './ui/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/predictions', label: 'Predictions', icon: Trophy },
    { href: '/check-in', label: 'Daily Check-in', icon: CheckSquare },
    { href: '/referrals', label: 'Referrals', icon: Gift },
    { href: '/feedback', label: 'Feedback', icon: Lightbulb },
  ];

  const adminNavItems = [
    { href: '/admin/predictions', label: 'Manage Predictions', icon: Trophy },
    { href: '/admin/questions', label: 'Manage Questions', icon: HelpCircle },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/feedback', label: 'Review Feedback', icon: ShieldCheck },
    { href: '/admin/grant-points', label: 'Grant Points', icon: Coins },
  ];

  return (
    <div className="min-h-screen w-full flex">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="">PredictWin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start gap-1 px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === item.href && 'bg-accent text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="my-4 px-4">
            <div className="h-px w-full bg-border" />
          </div>
          <nav className="grid items-start gap-1 px-4 text-sm font-medium">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80">Admin</p>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname.startsWith(item.href) && 'bg-accent text-primary'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
