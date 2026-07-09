"use client";

import { useOptimistic, useTransition } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { MediaCard } from "@/components/ui/MediaCard";
import { removeWatchedMedia, rateMedia } from "@/app/actions/user";
import { WatchHistoryItem } from "@/lib/store/useAppStore";
import { useAppStore } from "@/lib/store/useAppStore";

export function HistoryGrid({ initialHistory }: { initialHistory: WatchHistoryItem[] }) {
  const router = useRouter();
  const { setSelectedMedia, removeFromHistory, rateMediaStore } = useAppStore();
  const [, startTransition] = useTransition();

  // Optimistic UI for instant feedback
  const [optimisticHistory, setOptimisticHistory] = useOptimistic(
    initialHistory,
    (state, action: { type: 'remove', id: number } | { type: 'rate', id: number, rating: 1 | -1 }) => {
      if (action.type === 'remove') {
        return state.filter((item) => item.id !== action.id);
      }
      if (action.type === 'rate') {
        return state.map((item) => 
          item.id === action.id ? { ...item, userRating: action.rating, watchedAt: Date.now() } : item
        );
      }
      return state;
    }
  );

  const handleRate = async (e: React.MouseEvent, item: WatchHistoryItem, rating: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (item.userRating === rating) {
      startTransition(() => setOptimisticHistory({ type: 'remove', id: item.id }));
      removeFromHistory(item.id);
      await removeWatchedMedia(item.id);
    } else {
      startTransition(() => setOptimisticHistory({ type: 'rate', id: item.id, rating }));
      const newItem = { ...item, watchedAt: Date.now(), userRating: rating };
      rateMediaStore(newItem);
      await rateMedia(item, rating);
    }
  };

  const handleCardClick = (item: any) => {
    setSelectedMedia(item);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    // 1. Optimistic UI update (Component Level)
    startTransition(() => {
      setOptimisticHistory({ type: 'remove', id });
    });
    
    // 2. Global Store update (so other pages know it's gone without re-fetching)
    removeFromHistory(id);

    // 3. Server action (DB + revalidatePath)
    await removeWatchedMedia(id);
  };

  return (
    <main className="flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/discover")}
            className="p-2 rounded-full hover:bg-[var(--color-m3-surface-variant)] transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-m3-on-surface)]" />
          </button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-[var(--color-m3-primary)]">
              Watch History
            </h1>
            <p className="text-[var(--color-m3-outline)] text-sm">
              Your previous ratings and viewed content
            </p>
          </div>
        </div>
      </div>

      {optimisticHistory.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-m3-outline)] space-y-4">
          <p className="text-lg">Your history is empty.</p>
          <button 
            onClick={() => router.push("/discover")}
            className="text-[var(--color-m3-primary)] font-bold hover:underline"
          >
            Go discover something new!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {optimisticHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <MediaCard 
                {...item} 
                shape="default" 
                href={`/media/${item.type}/${item.id}`}
                onClick={() => handleCardClick(item)} 
                actionButtons={
                  <div className="flex w-full items-center justify-center gap-3">
                    <button 
                      onClick={(e) => handleRate(e, item, item.userRating === -1 ? -1 : 1)}
                      className={`flex items-center justify-center gap-1.5 ${(item.userRating === 1 || item.userRating === -1) ? 'px-3.5 py-2' : 'p-3'} ${item.userRating === -1 ? 'bg-[var(--color-m3-error)] text-[var(--color-m3-on-error)]' : 'bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)]'} rounded-full hover:brightness-110 hover:scale-105 transition-all shadow-[var(--shadow-m3-elevation-2)]`}
                      title={item.userRating === -1 ? "Dislike" : "Like"}
                    >
                      {item.userRating === -1 ? (
                        <ThumbsDown className="w-4 h-4 fill-current" />
                      ) : (
                        <ThumbsUp className={`w-4 h-4 ${item.userRating === 1 ? 'fill-current' : ''}`} />
                      )}
                      {(item.userRating === 1 || item.userRating === -1) && (
                        <span className="text-xs font-semibold tracking-wider leading-none pt-[1px]">
                          {new Date(item.watchedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      )}
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
        </div>
      )}
    </main>
  );
}
