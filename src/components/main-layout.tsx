'use client';

import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { LinkWithPreload } from '@/components/ui/link-with-preload';
import { 
  Trophy, 
  Users, 
  User as UserIcon, 
  Home,
  MessageSquare,
  Menu,
  Coins,
  LogOut,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserProfileData, logoutAction } from '@/app/actions';
import { UserNav } from './user-nav';
import type { User } from '@/types';
import Link from 'next/link';

// Navigation items
const navigationItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/predictions', label: 'Predictions', icon: Trophy },
  { href: '/check-in', label: 'Check In', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: UserIcon },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
];

// Optimized Link component with prefetching
function OptimizedNavLink({ 
  href, 
  children, 
  className, 
  isActive 
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={className}
      prefetch={true} // Enable prefetching
      onMouseEnter={() => {
        // Prefetch on hover for even faster navigation
        const router = require('next/router');
        if (router.prefetch) {
          router.prefetch(href);
        }
      }}
    >
      {children}
    </Link>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadUser();
    
    // Set up global refresh function for user data
    (window as any).refreshUserData = loadUser;
    
    return () => {
      delete (window as any).refreshUserData;
    };
  }, []);

  const loadUser = async () => {
    try {
      const { user: userData } = await getUserProfileData();
      setUser(userData as User);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Global refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh user data in UserNav
      if ((window as any).refreshUserData) {
        await (window as any).refreshUserData();
      }
      
      // Use startTransition for smooth refresh
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [router]);

  // Preload likely navigation destinations
  useEffect(() => {
    const preloadRoutes = ['/predictions', '/check-in', '/profile'];
    preloadRoutes.forEach(route => {
      if (route !== pathname) {
        router.prefetch(route);
      }
    });
  }, [pathname, router]);

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Logo */}
          <div className="mr-6 flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">PredictWin</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <OptimizedNavLink
                  key={item.href}
                  href={item.href}
                  isActive={isActive}
                  className={`flex items-center gap-2 transition-colors hover:text-foreground/80 ${
                    isActive ? 'text-foreground font-semibold' : 'text-foreground/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </OptimizedNavLink>
              );
            })}
          </nav>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mr-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* User Navigation */}
          <UserNav />

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                  <span className="font-bold">PredictWin</span>
                </div>
                
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.href);
                  
                  return (
                    <OptimizedNavLink
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent ${
                        isActive ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </OptimizedNavLink>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-semibold text-gray-900">PredictWin</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 PredictWin. Make predictions, earn points, have fun!
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <LinkWithPreload href="/feedback" className="hover:text-primary transition-colors">
                Feedback
              </LinkWithPreload>
              <LinkWithPreload href="/predictions" className="hover:text-primary transition-colors">
                Predictions
              </LinkWithPreload>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
