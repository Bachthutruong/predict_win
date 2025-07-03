'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Preload common pages for faster navigation
const PRELOAD_PAGES = [
  '/',
  '/predictions',
  '/check-in',
  '/profile',
  '/referrals',
  '/feedback',
];

export function NavigationPreloader() {
  const router = useRouter();

  useEffect(() => {
    // Preload pages after initial load
    const preloadTimer = setTimeout(() => {
      PRELOAD_PAGES.forEach(page => {
        router.prefetch(page);
      });
    }, 1000); // Wait 1 second after initial load

    return () => clearTimeout(preloadTimer);
  }, [router]);

  return null; // This component doesn't render anything
}

// Preload on hover for instant navigation
export function usePreloadOnHover() {
  const router = useRouter();

  const preloadPage = (href: string) => {
    router.prefetch(href);
  };

  return { preloadPage };
} 