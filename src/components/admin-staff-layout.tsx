'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { LinkWithPreload } from '@/components/ui/link-with-preload';
import { 
  Trophy, 
  Users, 
  HelpCircle, 
  User as UserIcon, 
  MessageSquare,
  Menu,
  Coins,
  LogOut,
  Calendar,
  Loader2,
  Settings,
  Shield,
  CreditCard,
  Eye,
  Home
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserProfileData, logoutAction } from '@/app/actions';
import { UserNav } from './user-nav';
import type { User } from '@/types';

export default function AdminStaffLayout({ children }: { children: React.ReactNode }) {
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

  // Navigation based on user role - ONLY admin/staff specific menus
  const getAdminStaffNavigation = () => {
    if (user?.role === 'admin') {
      return [
        { name: 'Admin Predictions', href: '/admin-predictions', icon: Trophy },
        { name: 'Questions Management', href: '/questions', icon: HelpCircle },
        { name: 'Staff Management', href: '/staff', icon: Users },
        { name: 'User Management', href: '/users', icon: UserIcon },
        { name: 'Grant Points', href: '/grant-points', icon: CreditCard },
        { name: 'Admin Feedback', href: '/admin-feedback', icon: Shield },
      ];
    }

    if (user?.role === 'staff') {
      return [
        { name: 'Staff Dashboard', href: '/dashboard', icon: Shield },
        { name: 'Staff Predictions', href: '/staff-predictions', icon: Trophy },
        { name: 'Staff Questions', href: '/staff-questions', icon: HelpCircle },
        { name: 'Staff Users', href: '/staff-users', icon: Eye },
      ];
    }

    return [];
  };

  // Header navigation - basic user menus
  const headerNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Predictions', href: '/predictions', icon: Trophy },
    { name: 'Check In', href: '/check-in', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  const sidebarNavigation = getAdminStaffNavigation();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col h-full ${!isMobile ? 'bg-white border-r border-gray-200' : ''}`}>
      {/* Logo */}
      <div className={`flex items-center flex-shrink-0 ${isMobile ? 'px-6 py-5 border-b' : 'px-6 pt-5 pb-4'}`}>
        <Trophy className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PredictWin
        </span>
      </div>
      
      {/* User info */}
      {user && (
        <div className={`px-6 ${isMobile ? 'py-4 border-b' : 'mt-6'}`}>
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="text-xs">
                  {user.role.toUpperCase()}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <Coins className="h-3 w-3 mr-1" />
                  {user.points}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Management Navigation */}
      {sidebarNavigation.length > 0 && (
        <>
          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {user?.role === 'admin' ? 'Admin Management' : 'Staff Management'}
            </h3>
          </div>
          <nav className={`flex-1 px-3 space-y-1 ${isMobile ? '' : ''} overflow-y-auto`}>
            {sidebarNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <LinkWithPreload
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <span className="truncate">{item.name}</span>
                </LinkWithPreload>
              );
            })}
          </nav>
        </>
      )}

      {/* Logout button */}
      <div className="flex-shrink-0 px-3 pb-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              <span className="truncate">Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-3 h-5 w-5" />
              <span className="truncate">Logout</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary">PredictWin</span>
            </div>
            
            <UserNav />
          </div>
        </header>

        {/* Desktop header with navigation */}
        <header className="hidden lg:block bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-6 py-4">
            {/* Title section */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {user?.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.role === 'admin' 
                    ? 'Manage all aspects of PredictWin'
                    : 'Manage questions, predictions and users'
                  }
                </p>
              </div>
              <UserNav />
            </div>
            
            {/* Header navigation */}
            <nav className="flex items-center space-x-1">
              {headerNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <LinkWithPreload
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-gray-50 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </LinkWithPreload>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 