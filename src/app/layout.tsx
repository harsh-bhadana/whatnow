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
        className={`${roboto.variable} ${plusJakarta.variable} min-h-screen antialiased`}
      >
        <body className="min-h-screen flex flex-col font-sans">
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
                  className="w-full flex items-center justify-start px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors rounded-lg group"
                  title="Sign Out"
                >
                  <LogOut size={18} className="mr-3" />
                  <span>Sign Out</span>
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
