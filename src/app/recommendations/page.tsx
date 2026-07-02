"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { fetchRecommendations } from "@/lib/api/tmdb";
import { MediaCard, MediaCardProps } from "@/components/ui/MediaCard";
import { MediaCardSkeleton } from "@/components/ui/MediaCardSkeleton";
import { TouchGrassCard } from "@/components/ui/TouchGrassCard";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { Loader2 } from "lucide-react";

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : useEffect;

export default function Recommendations() {
  const router = useRouter();
  const { 
    availableTime, selectedMoods, watchHistory, 
    cachedRecommendations, setCachedRecommendations, setSelectedMedia,
    mediaType, selectedLikedMediaIds, userDataLoaded
  } = useAppStore();
  const [results, setResults] = useState<MediaCardProps[]>(cachedRecommendations);
  const [loading, setLoading] = useState(cachedRecommendations.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Calculate initial page based on how many items we already fetched (assuming 12 items per page)
  const initialPage = Math.max(1, Math.ceil(cachedRecommendations.length / 12));
  const [page, setPage] = useState(initialPage);
  
  const hasRestoredCache = useRef(false);

  const [isMounted, setIsMounted] = useState(false);

  // Synchronously restore scroll position before paint so View Transition API captures the right DOM offset
  useIsomorphicLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem('whatnow_scroll_y');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
    
    // Save scroll position for back navigation
    const handleScroll = () => {
      sessionStorage.setItem('whatnow_scroll_y', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMounted || !userDataLoaded) return;
    
    if (selectedMoods.length === 0 && selectedLikedMediaIds.length === 0) {
      router.push("/discover");
      return;
    }

    async function loadData() {
      // If we already have the cache for this page, just use it on initial mount
      if (!hasRestoredCache.current && cachedRecommendations.length > 0) {
        hasRestoredCache.current = true;
        setResults(cachedRecommendations);
        setLoading(false);
        return;
      }
      
      hasRestoredCache.current = true;

      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const watchedIds = watchHistory.map(item => item.id);
      const likedMediaData = watchHistory
        .filter(item => selectedLikedMediaIds.includes(item.id))
        .map(item => ({ id: item.id, type: item.type as "movie" | "tv" }));

      const newResults = await fetchRecommendations(availableTime, selectedMoods, watchedIds, mediaType, likedMediaData, false, page);

      if (page === 1) {
        setResults(newResults);
        setCachedRecommendations(newResults);
      } else {
        // Append and deduplicate
        setResults(prev => {
          const combined = [...prev, ...newResults];
          const uniqueMap = new Map();
          combined.forEach(item => {
            if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
          });
          const newArray = Array.from(uniqueMap.values());
          // Cache the accumulated results so they are available when returning from detail page
          setCachedRecommendations(newArray);
          return newArray;
        });
      }
      
      setLoading(false);
      setLoadingMore(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTime, selectedMoods, router, watchHistory, userDataLoaded, isMounted, mediaType, selectedLikedMediaIds, page]);

  const handleCardClick = (item: MediaCardProps) => {
    setSelectedMedia(item);
  };

  return (
    <main className="flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      {/* Title outside the columns so it spans full width */}
      <div className="mb-6 sm:mb-8 flex flex-row items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--color-m3-primary)] leading-tight">
          Your Recommendation
        </h1>
        {/* Desktop Header Button */}
        <button 
          onClick={() => router.push("/discover")}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-primary)] hover:text-[var(--color-m3-on-primary)] transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Mood change
        </button>
      </div>

      <MasonryGrid
        breakpoints={{
          640: 3,
          768: 4,
          1024: 5,
          1280: 6,
        }}
        defaultCols={2}
      >
        {/* Mobile button inside the columns to cause shift, kept outside conditional so it doesn't unmount */}
        <div className="sm:hidden break-inside-avoid">
          <button 
            onClick={() => router.push("/discover")}
            style={{ viewTransitionName: 'mood-container' }}
            className="w-full h-full min-h-[140px] flex flex-col items-start justify-between p-5 text-left text-[var(--color-m3-on-surface)] transition-all hover:scale-[0.98] active:scale-95 bg-gradient-to-br from-[var(--color-m3-surface-container-high)] to-[var(--color-m3-surface-container)] rounded-3xl border border-[var(--color-m3-outline-variant)]/30 overflow-hidden relative group shadow-sm"
          >
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[var(--color-m3-primary)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-m3-primary)]/20 transition-colors" />
            
            <div className="p-2.5 bg-[var(--color-m3-surface)] rounded-full shadow-sm z-10">
              <ArrowLeft className="w-5 h-5 text-[var(--color-m3-primary)]" />
            </div>
            
            <div className="mt-6 relative z-10">
              <span className="block text-base font-bold mb-1">Mood change</span>
              <span className="block text-xs text-[var(--color-m3-outline)] font-medium leading-tight">
                Not feeling these? Refine your vibes and time.
              </span>
            </div>
          </button>
        </div>

        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <MediaCardSkeleton />
            </div>
          ))
        ) : (
          <>
            {results.flatMap((item, index) => {
              const nodes = [];
              nodes.push(
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="break-inside-avoid block w-full h-full"
                >
                  <MediaCard 
                    {...item}
                    href={`/media/${item.type}/${item.id}`} 
                    onClick={() => handleCardClick(item)}
                  />
                </motion.div>
              );
              
              // Touch Grass Element every 15 items
              if ((index + 1) % 15 === 0) {
                nodes.push(
                  <div key={`grass-${index}`} className="break-inside-avoid block w-full h-full">
                    <TouchGrassCard />
                  </div>
                );
              }
              
              return nodes;
            })}
          </>
        )}
      </MasonryGrid>
            <div 
              className="w-full flex items-center justify-center p-8 break-inside-avoid"
              ref={(el) => {
                if (!el) return;
                const observer = new IntersectionObserver(
                  (entries) => {
                    if (entries[0].isIntersecting && !loadingMore && !loading) {
                      setPage(p => p + 1);
                    }
                  },
                  { threshold: 0.1 }
                );
                observer.observe(el);
                return () => observer.disconnect();
              }}
            >
              {loadingMore && <Loader2 className="w-8 h-8 animate-spin text-[var(--color-m3-primary)]" />}
            </div>

      {!loading && results.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-m3-outline)] space-y-4">
          <p className="text-lg">No matches found for your exact criteria.</p>
          <button 
            onClick={() => router.push("/discover")}
            className="text-[var(--color-m3-primary)] font-bold hover:underline"
          >
            Try different moods or more time
          </button>
        </div>
      )}
    </main>
  );
}
