import type { Metadata } from "next";
import { Roboto, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WhatNow?",
  description: "Find your next favorite movie, show, or anime.",
};

import { ViewTransitions } from 'next-view-transitions';
import Script from "next/script";
import { auth, signOut } from "@/auth";
import { LogOut } from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { StoreInitializer } from "@/components/ui/StoreInitializer";
import { ThemeProvider } from "@/components/ThemeProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${roboto.variable} ${plusJakarta.variable} min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <body className="h-[100dvh] overflow-hidden flex flex-col font-sans">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {session && (
              <>
                <StoreInitializer />
                <AppHeader session={session}>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/auth/signin" });
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full flex items-center justify-start px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors rounded-lg group"
                      title="Sign Out"
                    >
                      <LogOut size={18} className="mr-3" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </AppHeader>
              </>
            )}
            <div id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth flex flex-col items-center">
              {children}
            </div>
          </ThemeProvider>
          <Script
            id="register-sw"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              `,
            }}
          />
        </body>
      </html>
    </ViewTransitions>
  );
}
