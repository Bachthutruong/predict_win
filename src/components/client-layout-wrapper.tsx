'use client';

import { usePathname } from 'next/navigation';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/verify-email';

  // For auth routes, render children directly without layout
  // For other routes, let the specific layout files handle the MainLayout
  return <>{children}</>;
} 