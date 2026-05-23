"use client";

import { Link } from 'next-view-transitions';
import { useAppStore } from "@/lib/store/useAppStore";
import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { SearchBar } from "./SearchBar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AppHeader({ session, children }: { session: any, children: React.ReactNode }) {
  const { activeProfile } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
    
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--color-m3-surface)]/80 backdrop-blur-md border-b border-[var(--color-m3-outline)]/20 shadow-sm shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-xl text-[var(--color-m3-primary)] shrink-0">
          WhatNow?
        </Link>
        <SearchBar />
        <nav className="flex gap-2 sm:gap-4 items-center shrink-0">
          <Link href="/search" className="sm:hidden p-2 text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-primary)] transition-colors rounded-full hover:bg-[var(--color-m3-surface-variant)]">
            <Search className="w-5 h-5" />
          </Link>
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
          {/* Active Profile Info (Desktop Only) */}
          {mounted && activeProfile && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--color-m3-surface-variant)] rounded-full">
              <div className={`w-6 h-6 rounded-full ${activeProfile.color} flex items-center justify-center text-white text-xs font-bold uppercase`}>
                {activeProfile.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-[var(--color-m3-on-surface)] truncate max-w-[120px]">
                {activeProfile.name}
              </span>
            </div>
          )}

          {/* User Profile Dropdown */}
          {session?.user && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 border-l border-[var(--color-m3-outline)]/20 pl-2 sm:pl-4 ml-1 sm:ml-2 focus:outline-none rounded-full transition-transform hover:scale-105"
              >
                {session.user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full border border-[var(--color-m3-outline)]/20 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-m3-primary)] flex items-center justify-center text-[var(--color-m3-on-primary)] text-xs font-bold uppercase">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
                {/* Desktop Name */}
                <span className="text-sm font-medium text-[var(--color-m3-on-surface)] hidden md:block max-w-[120px] truncate">
                  {session.user.name}
                </span>
              </button>

              {/* Dropdown Menu / Full-screen Mobile Menu */}
              {isMenuOpen && (
                <div className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-full sm:w-72 h-[100dvh] sm:h-auto bg-[var(--color-m3-surface-container)] sm:border sm:border-[var(--color-m3-outline)]/20 sm:rounded-2xl sm:shadow-xl overflow-hidden z-[100] sm:z-50 flex flex-col animate-in fade-in slide-in-from-top-8 sm:slide-in-from-top-2 duration-300">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-m3-outline)]/10 sm:hidden bg-[var(--color-m3-surface)] shrink-0">
                    <span className="font-heading font-bold text-lg text-[var(--color-m3-on-surface)]">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)] rounded-full transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="px-5 py-6 sm:py-4 border-b border-[var(--color-m3-outline)]/10 bg-[var(--color-m3-surface-container-high)] shrink-0">
                    <p className="text-base sm:text-sm font-bold text-[var(--color-m3-on-surface)] truncate">{session.user.name}</p>
                    <p className="text-sm sm:text-xs text-[var(--color-m3-on-surface-variant)] truncate mt-1">{session.user.email}</p>
                  </div>
                  
                  {mounted && activeProfile && (
                    <div className="px-5 py-5 sm:py-4 border-b border-[var(--color-m3-outline)]/10 flex items-center gap-4 bg-[var(--color-m3-surface)] shrink-0">
                      <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full ${activeProfile.color} flex items-center justify-center text-white text-lg sm:text-base font-bold uppercase shrink-0 shadow-sm`}>
                        {activeProfile.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider font-semibold">Watching As</span>
                        <span className="text-base sm:text-sm font-bold text-[var(--color-m3-on-surface)] truncate mt-0.5">{activeProfile.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto flex flex-col py-2 border-b border-[var(--color-m3-outline)]/10 sm:hidden">
                    <Link 
                      href="/watchlist" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="px-5 py-4 text-base font-medium text-[var(--color-m3-on-surface)] hover:bg-[var(--color-m3-surface-variant)] transition-colors active:bg-[var(--color-m3-surface-variant)]"
                    >
                      Watch Later
                    </Link>
                    <Link 
                      href="/history" 
                      onClick={() => setIsMenuOpen(false)} 
                      className="px-5 py-4 text-base font-medium text-[var(--color-m3-on-surface)] hover:bg-[var(--color-m3-surface-variant)] transition-colors active:bg-[var(--color-m3-surface-variant)]"
                    >
                      Watch History
                    </Link>
                  </div>
                  
                  <div className="p-4 sm:p-2 shrink-0">
                    {children}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
