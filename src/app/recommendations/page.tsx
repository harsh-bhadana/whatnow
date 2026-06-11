"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, ThumbsUp, ThumbsDown, BookmarkPlus } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { rateMedia, removeWatchedMedia, addToWatchlist, removeFromWatchlist } from "@/app/actions/user";
import { fetchRecommendations } from "@/lib/api/tmdb";
import { generateInsights } from "@/lib/api/ai";
import { MediaCard, MediaCardProps } from "@/components/media/MediaCard";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";
import { TouchGrassCard } from "@/components/media/TouchGrassCard";
import { MasonryGrid } from "@/components/common/MasonryGrid";


const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : useEffect;

export default function Recommendations() {
  const router = useRouter();
  const { 
    availableTime, selectedMoods, watchHistory, 
    cachedRecommendations, setCachedRecommendations, setSelectedMedia,
    mediaType, selectedLikedMediaIds, userDataLoaded,
    rateMediaStore, removeFromHistory, watchlist, addToWatchlistStore, removeFromWatchlistStore
  } = useAppStore();

  const handleRate = async (e: React.MouseEvent, item: MediaCardProps, rating: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    
    const historyItem = watchHistory.find(h => h.id === item.id);
    if (historyItem?.userRating === rating) {
      removeFromHistory(item.id);
      await removeWatchedMedia(item.id);
    } else {
      const newItem = {
        ...item,
        // eslint-disable-next-line react-hooks/purity
        watchedAt: Date.now(),
        userRating: rating,
      };
      rateMediaStore(newItem);
      await rateMedia(item, rating);
    }
  };

  const handleWatchlist = async (e: React.MouseEvent, item: MediaCardProps) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (watchlist.some(w => w.id === item.id)) {
      removeFromWatchlistStore(item.id);
      await removeFromWatchlist(item.id);
    } else {
      addToWatchlistStore(item);
      await addToWatchlist(item);
    }
  };

  const [results, setResults] = useState<MediaCardProps[]>(cachedRecommendations);
  const [loading, setLoading] = useState(cachedRecommendations.length === 0);
  
  const hasRestoredCache = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFetchingRef = useRef(false);
  const currentPage = useRef(1);

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
    const savedScroll = sessionStorage.getItem('whatnow_scroll_y');
    if (savedScroll) {
      const container = document.getElementById('main-scroll-container');
      if (container) {
        container.scrollTo(0, parseInt(savedScroll, 10));
      }
    }
  }, []);

  const handleResuggest = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    const watchedIds = watchHistory.map(item => item.id);
    const likedMediaData = watchHistory
      .filter(item => selectedLikedMediaIds.includes(item.id))
      .map(item => ({ id: item.id, type: item.type as "movie" | "tv" }));

    currentPage.current += 1;

    // Step 1: TMDB Discovery
    let newResults = await fetchRecommendations(
      availableTime, selectedMoods, watchedIds, mediaType, likedMediaData, false, currentPage.current
    );

    // Fallback if we exceeded TMDB pages or got fully filtered by watch history
    if (newResults.length === 0 && currentPage.current > 1) {
      currentPage.current = 1;
      newResults = await fetchRecommendations(
        availableTime, selectedMoods, watchedIds, mediaType, likedMediaData, false, 1
      );
    }

    // Step 2: AI Insights
    if (newResults.length > 0) {
      try {
        const likedTitles = watchHistory.filter(item => selectedLikedMediaIds.includes(item.id)).map(item => item.title);
        newResults = await generateInsights(newResults, selectedMoods, likedTitles);
      } catch (error) {
        console.error("AI Insight generation failed:", error);
      }
    }

    setResults(newResults);
    setCachedRecommendations(newResults);
    
    setLoading(false);
    setIsRefreshing(false);
    isFetchingRef.current = false;

    const container = document.getElementById('main-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
    
    const handleScroll = () => {
      const container = document.getElementById('main-scroll-container');
      if (!container) return;
      
      sessionStorage.setItem('whatnow_scroll_y', container.scrollTop.toString());

      if (isRefreshing || loading || isFetchingRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      // Update progress bar as user scrolls into the bottom 300px
      if (scrollHeight > clientHeight && scrollTop > 0) {
        if (distanceToBottom <= 300) {
          const progress = Math.max(0, Math.min(1 - (distanceToBottom / 300), 1));
          
          const progressBar = document.getElementById('pull-progress-bar');
          if (progressBar) progressBar.style.width = `${progress * 100}%`;
          
          const progressText = document.getElementById('pull-progress-text');
          if (progressText) progressText.innerText = progress >= 0.95 ? "Refreshing..." : "Pull down to refetch";

          if (progress >= 0.95) {
            setIsRefreshing(true);
            handleResuggest();
          }
        } else {
          // Reset when scrolled back up
          const progressBar = document.getElementById('pull-progress-bar');
          if (progressBar) progressBar.style.width = '0%';
          
          const progressText = document.getElementById('pull-progress-text');
          if (progressText) progressText.innerText = "Pull down to refetch";
        }
      }
    };
    
    const container = document.getElementById('main-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshing, loading]);

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
      setLoading(true);

      const watchedIds = watchHistory.map(item => item.id);
      const likedMediaData = watchHistory
        .filter(item => selectedLikedMediaIds.includes(item.id))
        .map(item => ({ id: item.id, type: item.type as "movie" | "tv" }));

      // Step 1: TMDB Discovery
      let newResults = await fetchRecommendations(availableTime, selectedMoods, watchedIds, mediaType, likedMediaData, false, 1);

      // Step 2: AI Insights
      if (newResults.length > 0) {
        try {
          const likedTitles = watchHistory.filter(item => selectedLikedMediaIds.includes(item.id)).map(item => item.title);
          newResults = await generateInsights(newResults, selectedMoods, likedTitles);
        } catch (error) {
          console.error("AI Insight generation failed:", error);
        }
      }

      setResults(newResults);
      setCachedRecommendations(newResults);
      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTime, selectedMoods, router, userDataLoaded, isMounted, mediaType, selectedLikedMediaIds]);

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
              const historyItem = watchHistory.find(h => h.id === item.id);
              const userRating = historyItem?.userRating || 0;
              const isWatchlisted = watchlist.some(w => w.id === item.id);

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
                    actionButtons={
                      <div className="flex w-full items-center justify-center gap-3">
                        <button 
                          onClick={(e) => handleRate(e, item, 1)}
                          className={`flex items-center justify-center p-3 rounded-full hover:brightness-110 hover:scale-110 transition-all shadow-[var(--shadow-m3-elevation-2)] ${userRating === 1 ? 'bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)]' : 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'}`}
                          title="Like"
                        >
                          <ThumbsUp className={`w-4 h-4 ${userRating === 1 ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleRate(e, item, -1)}
                          className={`flex items-center justify-center p-3 rounded-full hover:brightness-110 hover:scale-110 transition-all shadow-[var(--shadow-m3-elevation-2)] ${userRating === -1 ? 'bg-[var(--color-m3-error)] text-[var(--color-m3-on-error)]' : 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'}`}
                          title="Dislike"
                        >
                          <ThumbsDown className={`w-4 h-4 ${userRating === -1 ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleWatchlist(e, item)}
                          className={`flex items-center justify-center p-3 rounded-full hover:brightness-110 hover:scale-110 transition-all shadow-[var(--shadow-m3-elevation-2)] ${isWatchlisted ? 'bg-[var(--color-m3-tertiary)] text-[var(--color-m3-on-tertiary)]' : 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)]'}`}
                          title="Watch Later"
                        >
                          <BookmarkPlus className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    }
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

      {/* Scroll tracker removed in favor of native scroll detection */}
      
      {/* Pull to Refresh Space */}
      {!loading && results.length > 0 && (
        <div className="h-[300px] w-full flex flex-col items-center justify-center border-t border-[var(--color-m3-outline-variant)]/30 mt-8">
          <div className="flex flex-col items-center gap-3">
            {isRefreshing ? (
              <div className="flex items-center gap-3 bg-[var(--color-m3-surface-container-high)] text-[var(--color-m3-primary)] font-bold uppercase text-sm tracking-wider px-6 py-4 rounded-full shadow-lg border border-[var(--color-m3-outline-variant)]">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Refetching...</span>
              </div>
            ) : (
              <>
                <span id="pull-progress-text" className="text-sm font-bold uppercase tracking-wider text-[var(--color-m3-outline)]">
                  Pull down to refetch
                </span>
                <div className="w-48 h-2 bg-[var(--color-m3-surface-variant)] rounded-full overflow-hidden shadow-inner">
                  <div 
                    id="pull-progress-bar"
                    className="h-full bg-[var(--color-m3-primary)] transition-all duration-150 ease-out" 
                    style={{ width: '0%' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-m3-outline)] space-y-4">
          <p className="text-lg font-medium">No matches found for your current moods.</p>
          <button 
            onClick={() => router.push("/discover")}
            className="px-6 py-2 rounded-full bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-primary)] hover:text-[var(--color-m3-on-primary)] transition-colors font-bold text-sm"
          >
            Change Mood
          </button>
        </div>
      )}
    </main>
  );
}
