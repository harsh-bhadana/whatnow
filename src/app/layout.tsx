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
import { Link } from 'next-view-transitions';
import { auth, signOut } from "@/auth";
import { LogOut } from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";

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
        className={`${roboto.variable} ${plusJakarta.variable} h-full antialiased`}
      >
        <body className="h-full flex flex-col font-sans">
          {session && (
            <AppHeader session={session}>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/auth/signin" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-sm font-medium rounded-full bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-container-highest)] transition-colors group"
                  title="Sign Out"
                >
                  <LogOut size={18} className="sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </AppHeader>
          )}
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
