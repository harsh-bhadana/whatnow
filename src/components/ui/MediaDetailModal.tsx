"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, Info } from "lucide-react";
import { MediaCardProps } from "./MediaCard";
import { useEffect, useState } from "react";
import { fetchMediaDetails } from "@/lib/api/tmdb";

interface MediaDetailModalProps {
  media: MediaCardProps | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsWatched: (media: MediaCardProps) => void;
}

export function MediaDetailModal({ media, isOpen, onClose, onMarkAsWatched }: MediaDetailModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setDetails(null); // Reset on close
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    async function load() {
      if (media && isOpen && media.type !== "anime") { // Only TMDB for now
        setLoading(true);
        const data = await fetchMediaDetails(media.id, media.type as any);
        setDetails(data);
        setLoading(false);
      }
    }
    load();
  }, [media, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && media && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[var(--color-m3-surface-container-high)] rounded-m3-xl shadow-[var(--shadow-m3-elevation-3)] overflow-hidden pointer-events-auto flex flex-col md:flex-row"
            >
              {/* Image Section */}
              <div className="relative w-full md:w-2/5 aspect-[2/3] md:aspect-auto">
                <div className="absolute inset-0 bg-[var(--color-m3-surface-variant)]" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.imageUrl}
                  alt={media.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              
              {/* Info Section */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-2xl font-heading font-bold text-[var(--color-m3-on-surface)] leading-tight">
                    {media.title}
                  </h2>
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mt-4 text-sm font-medium text-[var(--color-m3-on-surface-variant)]">
                  <span className="uppercase tracking-wider px-2 py-1 bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] rounded-m3-sm">
                    {media.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{media.rating.toFixed(1)}</span>
                  </div>
                  {media.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{media.runtime}m</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex-1 text-[var(--color-m3-on-surface-variant)] text-sm leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="animate-pulse flex flex-col gap-2">
                      <div className="h-4 bg-[var(--color-m3-surface-variant)] rounded w-full"></div>
                      <div className="h-4 bg-[var(--color-m3-surface-variant)] rounded w-5/6"></div>
                      <div className="h-4 bg-[var(--color-m3-surface-variant)] rounded w-4/6"></div>
                    </div>
                  ) : details?.overview ? (
                    <p>{details.overview}</p>
                  ) : media.type === "anime" ? (
                    <p>Details for anime are not fetched yet, but it&apos;s a great choice!</p>
                  ) : (
                    <p>No description available.</p>
                  )}
                  
                  {details?.credits?.cast && (
                    <div className="mt-4">
                      <strong className="text-[var(--color-m3-on-surface)]">Cast: </strong>
                      {details.credits.cast.slice(0, 5).map((c: any) => c.name).join(", ")}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--color-m3-outline)]/20 flex gap-4">
                  <button 
                    onClick={() => onMarkAsWatched(media)}
                    className="flex-1 bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] py-3 rounded-m3-full font-medium hover:opacity-90 transition-opacity shadow-[var(--shadow-m3-elevation-1)]"
                  >
                    Mark as Watched
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
