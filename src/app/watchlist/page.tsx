"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { MediaCard } from "@/components/ui/MediaCard";
import { Bookmark, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransitionRouter as useRouter } from "next-view-transitions";

export default function WatchlistPage() {
  const { watchlist, setSelectedMedia } = useAppStore();
  const router = useRouter();

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

      {watchlist.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--color-m3-surface-container)]/30 rounded-3xl border border-[var(--color-m3-outline)]/10">
          <div className="w-16 h-16 bg-[var(--color-m3-surface-variant)] rounded-full flex items-center justify-center mb-4 text-[var(--color-m3-on-surface-variant)]">
            <Inbox size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-m3-on-surface)] mb-2">
            Your Watchlist is Empty
          </h2>
          <p className="text-[var(--color-m3-on-surface-variant)] max-w-md">
            Save movies and TV shows you want to watch later by clicking the "Watch Later" button on any media page.
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
            {watchlist.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  show: { opacity: 1, scale: 1 },
                }}
                layout
              >
                <MediaCard 
                  {...item} 
                  href={`/media/${item.type}/${item.id}`}
                  onClick={() => setSelectedMedia(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </main>
  );
}
