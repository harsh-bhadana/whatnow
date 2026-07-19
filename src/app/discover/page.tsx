"use client";

import { useEffect, useState } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { MoodSelector } from "@/components/filters/MoodSelector";
import { TimeSlider } from "@/components/filters/TimeSlider";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";

const MOODS = [
  "Cozy", "Adrenaline", "Laughs", "Tears", "Thought-provoking",
  "Spooky", "Heartwarming", "Epic", "Mind-bending", "Nostalgic"
];

export default function Discover() {
  const router = useRouter();
  const { 
    availableTime, setAvailableTime, 
    selectedMoods, toggleMood, 
    userDataLoaded, 
    watchHistory,
    mediaType, setMediaType,
    resetSession
  } = useAppStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  if (!isMounted || !userDataLoaded) return (
    <div className="flex-1 bg-[var(--color-m3-background)] flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-[var(--color-m3-primary)] animate-spin" />
    </div>
  );

  const handleDiscover = () => {
    // Navigate to recommendations page with query params or rely on store
    router.push("/recommendations");
  };

  return (
    <main className="relative flex-1 flex flex-col items-center px-4 py-8 sm:px-6 sm:py-12 w-full overflow-x-hidden">
      {/* Organic Background Blobs (Pixel UI Aesthetic) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            x: [0, 50, -20, 0], 
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-64 md:w-96 h-64 md:h-96 bg-[var(--color-m3-primary-container)] rounded-full mix-blend-multiply opacity-60 blur-[80px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 30, 0], 
            y: [0, 50, -20, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[10%] w-72 md:w-[28rem] h-72 md:h-[28rem] bg-[var(--color-m3-secondary-container)] rounded-full mix-blend-multiply opacity-60 blur-[80px]"
        />
        <motion.div 
          animate={{ 
            x: [0, 30, -50, 0], 
            y: [0, -40, 20, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[40%] w-56 md:w-80 h-56 md:h-80 bg-[var(--color-m3-tertiary-container)] rounded-full mix-blend-multiply opacity-50 blur-[80px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        className="relative z-10 w-full max-w-2xl flex flex-col"
      >
        <div className="text-center mb-4 sm:mb-6 shrink-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-[var(--color-m3-on-background)] leading-tight">
            What are you in the mood for?
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-m3-on-surface-variant)] max-w-xl mx-auto font-medium mt-1">
            Tell us how much time you have and what you want to feel. We&apos;ll find the perfect match.
          </p>
        </div>

        <div 
          className="bg-[var(--color-m3-surface-container)] p-4 sm:p-6 rounded-[28px] sm:rounded-[40px] shadow-sm border border-[var(--color-m3-outline)]/5 flex flex-col gap-4 sm:gap-6 shrink"
          style={{ viewTransitionName: 'mood-container' }}
        >
          <TimeSlider 
            value={availableTime} 
            onChange={setAvailableTime} 
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-m3-outline)] px-2">
              Media Type
            </span>
            <div className="flex flex-wrap gap-2">
              {["all", "movie", "tv", "anime"].map((type) => (
                <button
                  key={type}
                  onClick={() => setMediaType(type as "all" | "movie" | "tv" | "anime")}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold transition-all border",
                    mediaType === type
                      ? "bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] border-transparent"
                      : "bg-transparent text-[var(--color-m3-on-surface-variant)] border-[var(--color-m3-outline)] hover:bg-[var(--color-m3-surface-variant)]"
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-m3-outline)] px-2">
              I want something...
            </span>
            <MoodSelector 
              moods={MOODS} 
              selectedMoods={selectedMoods} 
              onSelect={toggleMood} 
            />
          </div>


          <div className="flex gap-2 sm:gap-3 w-full mt-1 sm:mt-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscover}
              className={cn(
                "flex-1 py-3 sm:py-4 rounded-[24px] sm:rounded-[32px] text-base sm:text-lg font-bold transition-all shadow-[var(--shadow-m3-elevation-1)] shrink-0",
                "bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)]",
                (selectedMoods.length === 0) && "opacity-90 grayscale-[20%]"
              )}
            >
              {selectedMoods.length === 0 ? "Surprise Me" : "Discover"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetSession}
              className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center rounded-[24px] sm:rounded-[32px] transition-all bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] shadow-sm hover:bg-[var(--color-m3-error)] hover:text-[var(--color-m3-on-error)] shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
