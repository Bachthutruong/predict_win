import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import ClientLayoutWrapper from '@/components/client-layout-wrapper';
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PredictWin - Prediction Gaming Platform",
  description: "Make predictions, earn points, and compete with friends on PredictWin!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PredictWin</title>
        <meta name="description" content="An app for making predictions and earning rewards." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
