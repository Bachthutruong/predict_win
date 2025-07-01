
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import MainLayout from '@/components/main-layout';
import { usePathname } from 'next/navigation';

// metadata cannot be exported from a client component.
// export const metadata: Metadata = {
//   title: 'PredictWin',
//   description: 'An app for making predictions and earning rewards.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PredictWin</title>
        <meta name="description" content="An app for making predictions and earning rewards." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {isAuthRoute ? (
          children
        ) : (
          <MainLayout>{children}</MainLayout>
        )}
        <Toaster />
      </body>
    </html>
  );
}
