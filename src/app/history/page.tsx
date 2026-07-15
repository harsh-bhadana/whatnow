"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { MediaCard } from "@/components/ui/MediaCard";
import { removeWatchedMedia } from "@/app/actions/profiles";

export default function History() {
  const router = useRouter();
  const { watchHistory, removeFromHistory, activeProfileId, setSelectedMedia } = useAppStore();

  const handleCardClick = (item: any) => {
    setSelectedMedia(item);
  };

  const [isMounted, setIsMounted] = useState(false);

  // Hydration fix for Zustand persist
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !activeProfileId) {
      router.push("/");
    }
  }, [isMounted, activeProfileId, router]);

  return (
    <main className="flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/")}
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

      {watchHistory.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-m3-outline)] space-y-4">
          <p className="text-lg">Your history is empty.</p>
          <button 
            onClick={() => router.push("/")}
            className="text-[var(--color-m3-primary)] font-bold hover:underline"
          >
            Go discover something new!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {watchHistory.map((item, index) => (
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
                onClick={async (e) => {
                  e.stopPropagation();
                  removeFromHistory(item.id);
                  if (activeProfileId) {
                    await removeWatchedMedia(activeProfileId, item.id);
                  }
                }}
                className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                Watched {new Date(item.watchedAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
