"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, EyeOff, Sparkles, X, CheckCircle2, ChevronRight } from "lucide-react";
import { MediaCardProps } from "@/components/media/MediaCard";
import { fetchTrendingMedia, fetchMediaDetailsBulk } from "@/lib/api/tmdb";
import { getActiveBenchmarks } from "@/app/actions/discovery";
import { useAppStore } from "@/lib/store/useAppStore";
import { rateMedia } from "@/app/actions/user";
import { TMDB_GENRE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PreferenceTunerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished?: () => void;
}

export function PreferenceTunerModal({
  isOpen,
  onClose,
  onFinished,
}: PreferenceTunerModalProps) {
  const { watchHistory, rateMediaStore, mediaType } = useAppStore();
  
  const [deck, setDeck] = useState<MediaCardProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ratedCount, setRatedCount] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;

    async function loadDeck() {
      setLoading(true);
      const watchedIds = new Set(watchHistory.map(h => h.id));

      // Fetch from multiple sources for a richer onboarding pool
      let items: MediaCardProps[] = [];
      
      try {
        // 1. Fetch AI Benchmark Set (from Cron/DB)
        const benchmarkIds = await getActiveBenchmarks();
        if (benchmarkIds.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const benchmarkDetails = await fetchMediaDetailsBulk(benchmarkIds as any);
          items = [...benchmarkDetails];
        }

        // 2. Fetch some trending items to mix in (in case they want something new)
        let trending: MediaCardProps[] = [];
        if (mediaType === "all") {
          const [movies, tvShows] = await Promise.all([
            fetchTrendingMedia("movie", 1),
            fetchTrendingMedia("tv", 1),
          ]);
          trending = [...movies, ...tvShows];
        } else {
          trending = await fetchTrendingMedia(mediaType, 1);
        }
        
        // Take 5 random trending items and mix them with the benchmarks
        trending = trending.sort(() => 0.5 - Math.random()).slice(0, 5);
        items = [...items, ...trending].sort(() => 0.5 - Math.random());
      } catch (error) {
        console.error("Failed to load tuner deck:", error);
      }

      // Deduplicate by id
      const uniqueMap = new Map<number, MediaCardProps>();
      items.forEach(item => { if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item); });
      items = Array.from(uniqueMap.values());
      
      // Filter out items already rated in history
      const freshItems = items.filter(item => !watchedIds.has(item.id));
      
      startTransition(() => {
        setDeck(freshItems.length > 0 ? freshItems : items);
        setCurrentIndex(0);
        setRatedCount(0);
        setLoading(false);
      });
    }

    loadDeck();
  }, [isOpen, mediaType, watchHistory]);

  if (!isOpen) return null;

  const currentItem = deck[currentIndex];
  const isFinished = currentIndex >= deck.length;

  const handleRate = async (rating: 1 | -1) => {
    if (!currentItem) return;

    const newItem = {
      ...currentItem,
      watchedAt: Date.now(),
      userRating: rating,
    };
    
    rateMediaStore(newItem);
    setRatedCount(prev => prev + 1);
    
    // Async save to server
    rateMedia(currentItem, rating);

    // Advance deck
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleFinish = () => {
    onClose();
    if (onFinished) onFinished();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie": return "bg-blue-500/90 text-blue-50 border border-blue-400/40";
      case "tv": return "bg-emerald-500/90 text-emerald-50 border border-emerald-400/40";
      case "anime": return "bg-purple-500/90 text-purple-50 border border-purple-400/40";
      default: return "bg-gray-500/90 text-gray-50 border border-gray-400/40";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-lg bg-[var(--color-m3-surface-container)] border border-[var(--color-m3-outline-variant)]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[var(--color-m3-outline-variant)]/30 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-bold text-[var(--color-m3-on-background)] leading-tight">
                  Tune Your Suggestions
                </h2>
                <p className="text-xs text-[var(--color-m3-outline)] font-medium">
                  Rate popular titles to immediately refine recommendations
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center min-h-[380px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-zinc-700 border-t-[var(--color-m3-primary)] animate-spin" />
                <p className="text-sm font-medium text-[var(--color-m3-outline)]">Loading trending titles...</p>
              </div>
            ) : isFinished || !currentItem ? (
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/40 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--color-m3-on-background)]">
                  All Set!
                </h3>
                <p className="text-sm text-[var(--color-m3-outline)] max-w-xs leading-relaxed">
                  You&apos;ve rated <strong className="text-[var(--color-m3-primary)]">{ratedCount} title{ratedCount !== 1 ? 's' : ''}</strong>. We&apos;ve updated your recommendations!
                </p>
                <button
                  onClick={handleFinish}
                  className="mt-2 px-6 py-3 rounded-full bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <span>Start Discovering</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Progress Bar */}
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-m3-outline)] px-1">
                  <span>{currentIndex + 1} of {deck.length}</span>
                  {ratedCount > 0 && (
                    <span className="text-pink-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-current" />
                      {ratedCount} rated
                    </span>
                  )}
                </div>

                <div className="w-full h-1.5 bg-[var(--color-m3-surface-variant)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--color-m3-primary)] transition-all duration-300 ease-out" 
                    style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
                  />
                </div>

                {/* Card Display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                    onDragEnd={(e, info) => {
                      const threshold = 80;
                      if (info.offset.x > threshold) {
                        handleRate(1);
                      } else if (info.offset.x < -threshold) {
                        handleRate(-1);
                      }
                    }}
                    className="relative flex flex-col sm:flex-row gap-4 bg-[var(--color-m3-surface)] border border-[var(--color-m3-outline-variant)]/30 rounded-2xl p-3 sm:p-4 shadow-md overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
                  >
                    {/* Poster */}
                    <div className="relative w-full sm:w-32 h-48 sm:h-44 shrink-0 rounded-xl overflow-hidden bg-black/40">
                      {currentItem.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={currentItem.imageUrl}
                          alt={currentItem.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs font-bold text-[var(--color-m3-outline)]">
                          {currentItem.title}
                        </div>
                      )}
                      
                      <span className={cn("absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md", getTypeColor(currentItem.type))}>
                        {currentItem.type}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-heading font-bold text-base text-[var(--color-m3-on-background)] leading-tight line-clamp-2">
                          {currentItem.title}
                        </h4>
                        
                        {/* Rating & Genres */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                            ★ {currentItem.rating.toFixed(1)}
                          </span>
                          {currentItem.genreIds && currentItem.genreIds.length > 0 && currentItem.genreIds.slice(0, 2).map((gId) => (
                            TMDB_GENRE_MAP[gId] ? (
                              <span key={gId} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10">
                                {TMDB_GENRE_MAP[gId]}
                              </span>
                            ) : null
                          ))}
                        </div>

                        {currentItem.overview && (
                          <p className="text-xs text-[var(--color-m3-outline)] mt-2 line-clamp-3 leading-relaxed">
                            {currentItem.overview}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Action Buttons: 3 Options */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => handleRate(1)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30 transition-all font-bold text-xs sm:text-sm active:scale-95 shadow-md"
                  >
                    <ThumbsUp className="w-4 h-4 fill-current text-green-400" />
                    <span>Like</span>
                  </button>

                  <button
                    onClick={() => handleRate(-1)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all font-bold text-xs sm:text-sm active:scale-95 shadow-md"
                  >
                    <ThumbsDown className="w-4 h-4 fill-current text-red-400" />
                    <span>Dislike</span>
                  </button>

                  <button
                    onClick={handleSkip}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] border border-[var(--color-m3-outline-variant)]/50 hover:bg-[var(--color-m3-surface-container-highest)] transition-all font-bold text-xs sm:text-sm active:scale-95"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Not Watched</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && !isFinished && currentItem && (
            <div className="px-4 py-3 border-t border-[var(--color-m3-outline-variant)]/30 flex items-center justify-between bg-black/10">
              <span className="text-xs text-[var(--color-m3-outline)] font-medium">
                {ratedCount > 0 ? `${ratedCount} titles rated` : "Rate a few titles to begin"}
              </span>
              <button
                onClick={handleFinish}
                className="text-xs font-bold text-[var(--color-m3-primary)] hover:underline"
              >
                Finish & Discover
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
