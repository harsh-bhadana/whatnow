"use client";

import { useOptimistic, useTransition } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { MediaCard } from "@/components/ui/MediaCard";
import { removeWatchedMedia } from "@/app/actions/user";
import { WatchHistoryItem } from "@/lib/store/useAppStore";
import { useAppStore } from "@/lib/store/useAppStore";

export function HistoryGrid({ initialHistory }: { initialHistory: WatchHistoryItem[] }) {
  const router = useRouter();
  const { setSelectedMedia, removeFromHistory } = useAppStore();
  const [, startTransition] = useTransition();

  // Optimistic UI for instant deletion feeling
  const [optimisticHistory, setOptimisticHistory] = useOptimistic(
    initialHistory,
    (state, idToRemove: number) => state.filter((item) => item.id !== idToRemove)
  );

  const handleCardClick = (item: any) => {
    setSelectedMedia(item);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    
    // 1. Optimistic UI update (Component Level)
    startTransition(() => {
      setOptimisticHistory(id);
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
              />
              <button 
                onClick={(e) => handleDelete(e, item.id)}
                className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                {item.userRating === 1 ? (
                  <ThumbsUp className="w-3 h-3 text-green-400 fill-current" />
                ) : item.userRating === -1 ? (
                  <ThumbsDown className="w-3 h-3 text-red-400 fill-current" />
                ) : null}
                <span>{new Date(item.watchedAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
