"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { searchMedia } from "@/lib/api/tmdb";
import { MediaCard, MediaCardProps } from "@/components/ui/MediaCard";
import { MediaCardSkeleton } from "@/components/ui/MediaCardSkeleton";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams);
  const query = resolvedParams.q || "";
  const router = useRouter();
  const { activeProfile, setSelectedMedia } = useAppStore();
  
  const [results, setResults] = useState<MediaCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

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
    
    searchMedia(query, activeProfile?.includeAdult || false).then((data) => {
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
  }, [query, activeProfile]);

  const handleCardClick = (item: MediaCardProps) => {
    setSelectedMedia(item);
  };

  return (
    <main className="flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8 shrink-0">
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

      {!loading && query && results.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-m3-outline)] space-y-4">
          <p className="text-lg">No matches found for &quot;{query}&quot;.</p>
        </div>
      )}
    </main>
  );
}
