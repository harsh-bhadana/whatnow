import type { Metadata } from "next";
import { Roboto, Outfit } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WhatNow?",
  description: "Find your next favorite movie, show, or anime.",
};

import { ViewTransitions } from 'next-view-transitions';
import { Link } from 'next-view-transitions';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${roboto.variable} ${outfit.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans">
          <header className="sticky top-0 z-50 w-full bg-[var(--color-m3-surface)]/80 backdrop-blur-md border-b border-[var(--color-m3-outline)]/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="font-heading font-bold text-xl text-[var(--color-m3-primary)]">
                WhatNow?
              </Link>
              <nav className="flex gap-4">
                <Link 
                  href="/history" 
                  className="text-sm font-medium text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-primary)] transition-colors px-4 py-2 rounded-m3-full hover:bg-[var(--color-m3-surface-variant)]"
                >
                  Watch History
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
