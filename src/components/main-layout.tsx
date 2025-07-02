'use client';

import React from 'react';
import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserProfileData, logoutAction } from '@/app/actions';
import { UserNav } from './user-nav';
import type { User } from '@/types';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

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

  // Only user navigation
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Predictions', href: '/predictions', icon: Trophy },
    { name: 'Check In', href: '/check-in', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  const isActive = (href: string) => {
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
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PredictWin
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <LinkWithPreload
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-white/60 ${
                      isActive(item.href)
                        ? 'bg-white shadow-sm text-primary border border-primary/20'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </LinkWithPreload>
                );
              })}
            </nav>

            {/* User Menu & Mobile Menu */}
            <div className="flex items-center gap-3">
              <UserNav />

              {/* Mobile menu trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="py-6">
                    {/* User Info */}
                    {user && (
                      <div className="border-b pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Coins className="h-3 w-3" />
                              <span>{user.points} points</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <LinkWithPreload
                            key={item.name}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive(item.href)
                                ? 'bg-primary text-primary-foreground'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </LinkWithPreload>
                        );
                      })}
                    </nav>

                    {/* Logout */}
                    {user && (
                      <div className="mt-6 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Logging out...
                            </>
                          ) : (
                            <>
                              <LogOut className="h-4 w-4 mr-2" />
                              Logout
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
