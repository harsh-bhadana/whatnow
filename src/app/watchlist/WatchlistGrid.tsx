"use client";

import { useOptimistic, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Inbox, Trash2, ThumbsUp } from "lucide-react";
import { MediaCard } from "@/components/ui/MediaCard";
import { removeFromWatchlist } from "@/app/actions/user";
import { MediaCardProps } from "@/components/ui/MediaCard";
import { useAppStore } from "@/lib/store/useAppStore";

export function WatchlistGrid({ initialWatchlist }: { initialWatchlist: MediaCardProps[] }) {
  const { setSelectedMedia, removeFromWatchlistStore } = useAppStore();
  const [, startTransition] = useTransition();

  const [optimisticWatchlist, setOptimisticWatchlist] = useOptimistic(
    initialWatchlist,
    (state, idToRemove: number) => state.filter((item) => item.id !== idToRemove)
  );

  const handleCardClick = (item: any) => {
    setSelectedMedia(item);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    // 1. Optimistic UI update
    startTransition(() => {
      setOptimisticWatchlist(id);
    });
    
    // 2. Global Store update
    removeFromWatchlistStore(id);

    // 3. Server action
    await removeFromWatchlist(id);
  };

  return (
    <main className="flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <div className="p-3 bg-[var(--color-m3-primary)]/10 rounded-2xl">
          <Bookmark className="w-8 h-8 text-[var(--color-m3-primary)]" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-[var(--color-m3-primary)]">
            Watch Later
          </h1>
          <p className="text-[var(--color-m3-outline)] text-sm mt-1">
            Movies and shows you want to watch.
          </p>
        </div>
      </div>

      {optimisticWatchlist.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--color-m3-surface-container)]/30 rounded-3xl border border-[var(--color-m3-outline)]/10">
          <div className="w-16 h-16 bg-[var(--color-m3-surface-variant)] rounded-full flex items-center justify-center mb-4 text-[var(--color-m3-on-surface-variant)]">
            <Inbox size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-m3-on-surface)] mb-2">
            Your Watchlist is Empty
          </h2>
          <p className="text-[var(--color-m3-on-surface-variant)] max-w-md">
            Save movies and TV shows you want to watch later by clicking the &quot;Watch Later&quot; button on any media page.
          </p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 w-full"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          <AnimatePresence>
            {optimisticWatchlist.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1 },
                }}
                layout
                className="relative group"
              >
                <MediaCard 
                  {...item} 
                  href={`/media/${item.type}/${item.id}`}
                  onClick={() => handleCardClick(item)}
                  actionButtons={
                    <div className="flex w-full items-center justify-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Liked functionality can be wired here
                        }}
                        className="flex items-center justify-center p-3 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] rounded-full hover:brightness-110 hover:scale-110 transition-all shadow-[var(--shadow-m3-elevation-2)]"
                        title="Like"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(e, item.id);
                        }}
                        className="flex items-center justify-center p-3 bg-[var(--color-m3-error)] text-[var(--color-m3-on-error)] rounded-full hover:brightness-110 hover:scale-110 transition-all shadow-[var(--shadow-m3-elevation-2)]"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </main>
  );
}
