"use client";

import { useEffect, useState } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { fetchRecommendations } from "@/lib/api/tmdb";
import { MediaCard, MediaCardProps } from "@/components/ui/MediaCard";
import { MediaCardSkeleton } from "@/components/ui/MediaCardSkeleton";
import { TouchGrassCard } from "@/components/ui/TouchGrassCard";
import { Loader2 } from "lucide-react";

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
  const [isInitialLoad] = useState(cachedRecommendations.length === 0);
  const [page, setPage] = useState(1);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !userDataLoaded) return;
    
    if (selectedMoods.length === 0 && selectedLikedMediaIds.length === 0) {
      router.push("/discover");
      return;
    }

    async function loadData() {
      if (page === 1 && cachedRecommendations.length > 0) {
        setResults(cachedRecommendations);
        setLoading(false);
        return;
      }

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
          return Array.from(uniqueMap.values());
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

      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 sm:gap-6 w-full">
        {/* Mobile button inside the columns to cause shift, kept outside conditional so it doesn't unmount */}
        <div className="sm:hidden break-inside-avoid mb-4 sm:mb-6">
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
            <div key={i} className="break-inside-avoid mb-4 sm:mb-6">
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
                  className="break-inside-avoid mb-4 sm:mb-6 block"
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
                  <div key={`grass-${index}`} className="break-inside-avoid mb-4 sm:mb-6 block">
                    <TouchGrassCard />
                  </div>
                );
              }
              
              return nodes;
            })}

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
          </>
        )}
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
