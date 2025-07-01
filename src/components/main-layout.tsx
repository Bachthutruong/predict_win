'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  Coins,
  Menu,
  X
} from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import { Icons } from '@/components/icons';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { getUserProfileData } from '@/app/actions';
import type { User } from '@/types';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user: userData } = await getUserProfileData();
        setUser(userData as User);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const navItems = [
    { href: '/', label: 'Trang chủ', icon: LayoutDashboard },
    { href: '/predictions', label: 'Dự đoán', icon: Trophy },
    { href: '/check-in', label: 'Điểm danh', icon: CheckSquare },
    { href: '/referrals', label: 'Giới thiệu', icon: Gift },
    { href: '/feedback', label: 'Góp ý', icon: Lightbulb },
  ];

  const adminNavItems = [
    { href: '/admin-predictions', label: 'Quản lý dự đoán', icon: Trophy },
    { href: '/questions', label: 'Quản lý câu hỏi', icon: HelpCircle },
    { href: '/staff', label: 'Quản lý nhân viên', icon: Users },
    { href: '/users', label: 'Quản lý người dùng', icon: Users },
    { href: '/grant-points', label: 'Tặng điểm', icon: Coins },
    { href: '/admin-feedback', label: 'Xem góp ý', icon: ShieldCheck },
  ];

  const isAdmin = user?.role === 'admin';

  const NavContent = () => (
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
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      
      {isAdmin && (
        <>
          <div className="my-4 px-4">
            <div className="h-px w-full bg-border" />
          </div>
          <nav className="grid items-start gap-1 px-4 text-sm font-medium">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/80">
              Quản trị viên
            </p>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname.startsWith(item.href) && 'bg-accent text-primary'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="text-lg">PredictWin</span>
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Icons.logo className="h-6 w-6 text-primary" />
              <span className="text-lg">PredictWin</span>
            </Link>
          </div>
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Desktop Logo (hidden on mobile) */}
          <div className="hidden md:block" />
          
          <UserNav />
        </header>
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
