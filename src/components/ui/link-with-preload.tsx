'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, startTransition } from 'react';

interface LinkWithPreloadProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function LinkWithPreload({ 
  href, 
  children, 
  className, 
  prefetch = true,
  replace = false,
  scroll = true,
  onClick,
  ...props 
}: LinkWithPreloadProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Call the provided onClick handler first
    onClick?.(e);
    
    // Don't prevent default for external links or when modifier keys are pressed
    if (href.startsWith('http') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    
    // Use transition for smoother navigation
    startTransition(() => {
      if (replace) {
        router.replace(href, { scroll });
      } else {
        router.push(href, { scroll });
      }
    });
  };

  return (
    <Link 
      href={href} 
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
} 