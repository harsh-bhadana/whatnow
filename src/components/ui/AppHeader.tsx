"use client";

import { Link } from 'next-view-transitions';
import { useAppStore } from "@/lib/store/useAppStore";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search, X, Bookmark, History } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { motion, AnimatePresence } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AppHeader({ session, children }: { session: any, children: React.ReactNode }) {
  const { activeProfile } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

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

  // Lock body scroll & blur page content when mobile menu is open
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    let bgResetTimer: ReturnType<typeof setTimeout>;
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.backgroundColor = "black";
      document.body.style.backgroundColor = "black";
    } else {
      document.body.style.overflow = "";
      // Delay background reset so it stays black while blur/scale animates out
      bgResetTimer = setTimeout(() => {
        document.documentElement.style.backgroundColor = "";
        document.body.style.backgroundColor = "";
      }, 400);
    }

    // Blur all sibling elements after the header (i.e. the page content)
    if (headerRef.current) {
      let sibling = headerRef.current.nextElementSibling as HTMLElement | null;
      while (sibling) {
        sibling.style.transition = "filter 0.35s ease, transform 0.35s ease";
        if (isMenuOpen && isMobile) {
          sibling.style.filter = "blur(8px)";
          sibling.style.transform = "scale(0.98)";
        } else {
          sibling.style.filter = "";
          sibling.style.transform = "";
        }
        sibling = sibling.nextElementSibling as HTMLElement | null;
      }
    }

    return () => {
      clearTimeout(bgResetTimer);
      document.body.style.overflow = "";
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
      if (headerRef.current) {
        let sibling = headerRef.current.nextElementSibling as HTMLElement | null;
        while (sibling) {
          sibling.style.filter = "";
          sibling.style.transform = "";
          sibling.style.transition = "";
          sibling = sibling.nextElementSibling as HTMLElement | null;
        }
      }
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-[var(--color-m3-surface)]/80 backdrop-blur-md border-b border-[var(--color-m3-outline)]/20 shadow-sm shrink-0"
    >
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
                  <motion.img layoutId="profile-avatar" src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full border border-[var(--color-m3-outline)]/20 object-cover" />
                ) : (
                  <motion.div layoutId="profile-avatar" className="w-8 h-8 rounded-full bg-[var(--color-m3-primary)] flex items-center justify-center text-[var(--color-m3-on-primary)] text-xs font-bold uppercase">
                    {session.user.name?.charAt(0) || "U"}
                  </motion.div>
                )}
                {/* Desktop Name */}
                <span className="text-sm font-medium text-[var(--color-m3-on-surface)] hidden md:block max-w-[120px] truncate">
                  {session.user.name}
                </span>
              </button>

              {/* Animated Dropdown / Full-screen Mobile Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    {/* Mobile: Full-screen overlay that expands from the header */}
                    <motion.div
                      className="fixed inset-0 sm:hidden z-[100]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Dim overlay (page blur is applied to actual content) */}
                      <motion.div 
                        className="absolute inset-0 bg-black/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={closeMenu}
                      />
                      
                      {/* Expanding panel from header — half sheet */}
                      <motion.div
                        className="absolute inset-x-0 top-0 bg-[var(--color-m3-surface-container)] flex flex-col overflow-hidden rounded-b-3xl shadow-2xl"
                        style={{ originY: 0 }}
                        initial={{ 
                          height: "4rem",
                          opacity: 0.6,
                        }}
                        animate={{ 
                          height: "50dvh",
                          opacity: 1,
                        }}
                        exit={{ 
                          height: "4rem",
                          opacity: 0,
                        }}
                        transition={{ 
                          type: "spring",
                          damping: 28,
                          stiffness: 300,
                          mass: 0.8,
                        }}
                      >
                        {/* Mobile Header — WhatNow? branding + close */}
                        <motion.div 
                          className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-m3-outline)]/10 bg-[var(--color-m3-surface)] shrink-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.2 }}
                        >
                          <span className="font-heading font-bold text-xl text-[var(--color-m3-primary)]">WhatNow?</span>
                          <button onClick={closeMenu} className="p-2 -mr-2 text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)] rounded-full transition-colors">
                            <X className="w-6 h-6" />
                          </button>
                        </motion.div>

                        {/* Content that fades/slides in after panel expands */}
                        <motion.div
                          className="flex-1 flex flex-col overflow-y-auto"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: 0.12, duration: 0.25 }}
                        >
                          {/* User info with shared-element profile image */}
                          <div className="px-5 py-5 border-b border-[var(--color-m3-outline)]/10 bg-[var(--color-m3-surface-container-high)] shrink-0 flex items-center gap-4">
                            {session.user.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <motion.img layoutId="profile-avatar" src={session.user.image} alt={session.user.name || "User"} className="w-14 h-14 rounded-full border-2 border-[var(--color-m3-outline)]/20 object-cover shrink-0 shadow-md" />
                            ) : (
                              <motion.div layoutId="profile-avatar" className="w-14 h-14 rounded-full bg-[var(--color-m3-primary)] flex items-center justify-center text-[var(--color-m3-on-primary)] text-xl font-bold uppercase shrink-0 shadow-md">
                                {session.user.name?.charAt(0) || "U"}
                              </motion.div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <p className="text-base font-bold text-[var(--color-m3-on-surface)] truncate">{session.user.name}</p>
                              <p className="text-sm text-[var(--color-m3-on-surface-variant)] truncate mt-0.5">{session.user.email}</p>
                            </div>
                          </div>
                          
                          {/* Active profile */}
                          {mounted && activeProfile && (
                            <div className="px-5 py-5 border-b border-[var(--color-m3-outline)]/10 flex items-center gap-4 bg-[var(--color-m3-surface)] shrink-0">
                              <div className={`w-12 h-12 rounded-full ${activeProfile.color} flex items-center justify-center text-white text-lg font-bold uppercase shrink-0 shadow-sm`}>
                                {activeProfile.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider font-semibold">Watching As</span>
                                <span className="text-base font-bold text-[var(--color-m3-on-surface)] truncate mt-0.5">{activeProfile.name}</span>
                              </div>
                            </div>
                          )}

                          {/* Nav links with icons */}
                          <div className="flex-1 flex flex-col py-1 border-b border-[var(--color-m3-outline)]/10">
                            <Link 
                              href="/watchlist" 
                              onClick={closeMenu} 
                              className="px-5 py-3.5 hover:bg-[var(--color-m3-surface-variant)] transition-colors active:bg-[var(--color-m3-surface-variant)] flex items-start gap-4"
                            >
                              <Bookmark className="w-5 h-5 text-[var(--color-m3-on-surface-variant)] mt-0.5 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-base font-medium text-[var(--color-m3-on-surface)]">Watch Later</span>
                                <span className="text-xs text-[var(--color-m3-on-surface-variant)] mt-0.5">Saved for your next binge</span>
                              </div>
                            </Link>
                            <Link 
                              href="/history" 
                              onClick={closeMenu} 
                              className="px-5 py-3.5 hover:bg-[var(--color-m3-surface-variant)] transition-colors active:bg-[var(--color-m3-surface-variant)] flex items-start gap-4"
                            >
                              <History className="w-5 h-5 text-[var(--color-m3-on-surface-variant)] mt-0.5 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-base font-medium text-[var(--color-m3-on-surface)]">Watch History</span>
                                <span className="text-xs text-[var(--color-m3-on-surface-variant)] mt-0.5">Everything you&apos;ve watched so far</span>
                              </div>
                            </Link>
                          </div>
                          
                          {/* Sign out / children */}
                          <div className="p-4 shrink-0">
                            {children}
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Desktop: Small dropdown (unchanged behavior) */}
                    <motion.div
                      className="hidden sm:flex absolute right-0 top-full mt-3 w-72 bg-[var(--color-m3-surface-container)] border border-[var(--color-m3-outline)]/20 rounded-2xl shadow-xl overflow-hidden z-50 flex-col"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ type: "spring", damping: 24, stiffness: 400 }}
                    >
                      <div className="px-5 py-4 border-b border-[var(--color-m3-outline)]/10 bg-[var(--color-m3-surface-container-high)] shrink-0">
                        <p className="text-sm font-bold text-[var(--color-m3-on-surface)] truncate">{session.user.name}</p>
                        <p className="text-xs text-[var(--color-m3-on-surface-variant)] truncate mt-1">{session.user.email}</p>
                      </div>
                      
                      {mounted && activeProfile && (
                        <div className="px-5 py-4 border-b border-[var(--color-m3-outline)]/10 flex items-center gap-4 bg-[var(--color-m3-surface)] shrink-0">
                          <div className={`w-10 h-10 rounded-full ${activeProfile.color} flex items-center justify-center text-white text-base font-bold uppercase shrink-0 shadow-sm`}>
                            {activeProfile.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider font-semibold">Watching As</span>
                            <span className="text-sm font-bold text-[var(--color-m3-on-surface)] truncate mt-0.5">{activeProfile.name}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-2 shrink-0">
                        {children}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
