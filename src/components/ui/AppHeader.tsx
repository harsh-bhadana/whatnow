"use client";

import { Link } from 'next-view-transitions';
import { useAppStore } from "@/lib/store/useAppStore";
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AppHeader({ session, children }: { session: any, children: React.ReactNode }) {
  const { activeProfile } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-m3-surface)]/80 backdrop-blur-md border-b border-[var(--color-m3-outline)]/20 shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-xl text-[var(--color-m3-primary)] shrink-0">
          WhatNow?
        </Link>
        <SearchBar />
        <nav className="flex gap-2 sm:gap-4 items-center shrink-0">
          <Link 
            href="/watchlist" 
            className="hidden sm:block text-sm font-medium text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-primary)] transition-colors px-4 py-2 rounded-full hover:bg-[var(--color-m3-surface-variant)]"
          >
            Watchlist
          </Link>
          <Link 
            href="/history" 
            className="hidden sm:block text-sm font-medium text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-primary)] transition-colors px-4 py-2 rounded-full hover:bg-[var(--color-m3-surface-variant)]"
          >
            Watch History
          </Link>
          
          {/* Active Profile Info */}
          {mounted && activeProfile && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-m3-surface-variant)] rounded-full">
              <div className={`w-6 h-6 rounded-full ${activeProfile.color} flex items-center justify-center text-white text-xs font-bold uppercase`}>
                {activeProfile.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-[var(--color-m3-on-surface)] truncate max-w-[80px] sm:max-w-[120px]">
                {activeProfile.name}
              </span>
            </div>
          )}

          {/* Google Session Info */}
          {session?.user && (
            <div className="flex items-center gap-2 border-l border-[var(--color-m3-outline)]/20 pl-2 sm:pl-4 ml-1 sm:ml-2">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full border border-[var(--color-m3-outline)]/20" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                  {session.user.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-medium text-[var(--color-m3-on-surface)] hidden md:block max-w-[150px] truncate">
                {session.user.name}
              </span>
            </div>
          )}

          {/* Sign Out Action (Server Form passed as children) */}
          <div className="ml-1 sm:ml-2">
            {children}
          </div>
        </nav>
      </div>
    </header>
  );
}
