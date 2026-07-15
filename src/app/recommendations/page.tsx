"use client";

import { useEffect, useState } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { fetchRecommendations } from "@/lib/api/tmdb";
import { fetchAnimeRecommendations } from "@/lib/api/anilist";
import { MediaCard, MediaCardProps } from "@/components/ui/MediaCard";

export default function Recommendations() {
  const router = useRouter();
  const { availableTime, selectedMoods, watchHistory, activeProfileId, cachedRecommendations, setCachedRecommendations, setSelectedMedia } = useAppStore();
  const [results, setResults] = useState<MediaCardProps[]>(cachedRecommendations);
  const [loading, setLoading] = useState(cachedRecommendations.length === 0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !activeProfileId) {
      router.push("/");
      return;
    }
    
    if (!isMounted) return;
    
    if (selectedMoods.length === 0) {
      router.push("/discover");
      return;
    }

    async function loadData() {
      if (cachedRecommendations.length > 0) {
        setResults(cachedRecommendations);
        setLoading(false);
        return;
      }

      setLoading(true);
      const watchedIds = watchHistory.map(item => item.id);

      // Fetch concurrently
      const [moviesAndTv, anime] = await Promise.all([
        fetchRecommendations(availableTime, selectedMoods, watchedIds),
        fetchAnimeRecommendations(availableTime, selectedMoods, watchedIds)
      ]);

      // Combine and shuffle
      const combined = [...moviesAndTv, ...anime].sort(() => Math.random() - 0.5);
      setResults(combined);
      setCachedRecommendations(combined);
      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableTime, selectedMoods, router, watchHistory, activeProfileId, isMounted]);

  const handleCardClick = (item: MediaCardProps) => {
    setSelectedMedia(item);
  };

  return (
    <main className="flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push("/")}
          className="p-2 rounded-full hover:bg-[var(--color-m3-surface-variant)] transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[var(--color-m3-on-surface)]" />
        </button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-[var(--color-m3-primary)]">
            Your Recommendations
          </h1>
          <p className="text-[var(--color-m3-outline)] text-sm">
            Based on {availableTime}m and {selectedMoods.join(", ")}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[var(--color-m3-primary)]" />
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            {results.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <MediaCard 
                  {...item}
                  href={`/media/${item.type}/${item.id}`} 
                  onClick={() => handleCardClick(item)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && results.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-m3-outline)] space-y-4">
          <p className="text-lg">No matches found for your exact criteria.</p>
          <button 
            onClick={() => router.push("/")}
            className="text-[var(--color-m3-primary)] font-bold hover:underline"
          >
            Try different moods or more time
          </button>
        </div>
      )}
    </main>
  );
}
