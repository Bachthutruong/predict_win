import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ClientLayoutWrapper from "@/components/client-layout-wrapper";

export const metadata: Metadata = {
  title: "PredictWin - Win Points by Making Predictions",
  description: "Join PredictWin and earn points by making accurate predictions. Check in daily, refer friends, and climb the leaderboard!",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className="font-sans antialiased min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        suppressHydrationWarning
      >
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
