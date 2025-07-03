import type { Metadata } from "next";
import "./globals.css";
import ClientLayoutWrapper from "@/components/client-layout-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { NavigationPreloader } from "@/components/ui/preloader";

export const metadata: Metadata = {
  title: "PredictWin - Win Big with Smart Predictions",
  description: "Join PredictWin to make predictions, earn points, and win exciting prizes!",
  keywords: ["predictions", "points", "rewards", "games", "trivia"],
  authors: [{ name: "PredictWin Team" }],
  openGraph: {
    title: "PredictWin - Win Points by Making Predictions",
    description: "Join PredictWin and earn points by making accurate predictions. Check in daily, refer friends, and climb the leaderboard!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href={process.env.MONGODB_URI?.split('@')[1]?.split('/')[0]} />
      </head>
      <body
        className="font-sans antialiased min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        style={{ fontFamily: "'Inter', sans-serif" }}
        suppressHydrationWarning
      >
        <NavigationPreloader />
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
