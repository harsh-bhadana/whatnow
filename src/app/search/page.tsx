"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, ThumbsUp, ThumbsDown, BookmarkPlus } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { rateMedia, removeWatchedMedia, addToWatchlist, removeFromWatchlist } from "@/app/actions/user";
import { searchMedia } from "@/lib/api/tmdb";
import { MediaCard, MediaCardProps } from "@/components/media/MediaCard";
import { MediaCardSkeleton } from "@/components/media/MediaCardSkeleton";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams);
  const query = resolvedParams.q || "";
  const router = useRouter();
  const { setSelectedMedia, watchHistory, rateMediaStore, removeFromHistory, watchlist, addToWatchlistStore, removeFromWatchlistStore } = useAppStore();

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
  const [results, setResults] = useState<MediaCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(query);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  useEffect(() => {
    if (!query) {
      startTransition(() => {
        setLoading(false);
        setResults([]);
      });
      return;
    }

    let isSubscribed = true;
    startTransition(() => {
      setLoading(true);
    });
    searchMedia(query, false).then((data) => {
      if (isSubscribed) {
        startTransition(() => {
          setResults(data);
          setLoading(false);
        });
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [query]);

  const handleCardClick = (item: MediaCardProps) => {
    setSelectedMedia(item);
  };

  return (
    <main className="flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-6 mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[var(--color-m3-surface-variant)] transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-m3-on-surface)]" />
          </button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-[var(--color-m3-primary)]">
              Search Results
            </h1>
            <p className="text-[var(--color-m3-outline)] text-sm">
              {query ? `Showing results for "${query}"` : "Search for a movie or TV show"}
            </p>
          </div>
        </div>

        {/* Mobile Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative sm:hidden w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-m3-on-surface-variant)]" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search movies, tv..."
            className="w-full bg-[var(--color-m3-surface-container-highest)] border border-transparent focus:border-[var(--color-m3-primary)] focus:bg-[var(--color-m3-surface)] rounded-2xl py-4 pl-12 pr-4 text-base text-[var(--color-m3-on-surface)] placeholder-[var(--color-m3-on-surface-variant)] outline-none transition-all shadow-sm"
          />
        </form>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full"
          >
            {results.map((item, index) => {
              const historyItem = watchHistory.find(h => h.id === item.id);
              const userRating = historyItem?.userRating || 0;
              const isWatchlisted = watchlist.some(w => w.id === item.id);
              
              return (
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
            )})}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && query && results.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-m3-outline)] space-y-4">
          <p className="text-lg">No matches found for &quot;{query}&quot;.</p>
        </div>
      )}
    </main>
  );
}
