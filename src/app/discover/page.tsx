"use client";

import { useEffect, useState } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { motion } from "framer-motion";
import { MoodSelector } from "@/components/ui/MoodSelector";
import { TimeSlider } from "@/components/ui/TimeSlider";
import { useAppStore } from "@/lib/store/useAppStore";
import { cn } from "@/lib/utils";

const MOODS = [
  "Cozy", "Adrenaline", "Laughs", "Tears", "Thought-provoking",
  "Spooky", "Heartwarming", "Epic", "Mind-bending", "Nostalgic"
];

export default function Discover() {
  const router = useRouter();
  const { availableTime, setAvailableTime, selectedMoods, toggleMood, activeProfileId } = useAppStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !activeProfileId) {
      router.push("/");
    }
  }, [isMounted, activeProfileId, router]);

  if (!isMounted) return null;

  const handleDiscover = () => {
    // Navigate to recommendations page with query params or rely on store
    router.push("/recommendations");
  };

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-6 w-full overflow-hidden">
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
        className="relative z-10 w-full max-w-2xl flex flex-col gap-4 sm:gap-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-[var(--color-m3-on-background)] leading-tight">
            What are you in the mood for?
          </h1>
          <p className="text-base md:text-lg text-[var(--color-m3-on-surface-variant)] max-w-xl mx-auto font-medium">
            Tell us how much time you have and what you want to feel. We&apos;ll find the perfect movie, show, or anime for you.
          </p>
        </div>

        <div className="bg-[var(--color-m3-surface-container)] p-5 md:p-6 rounded-[32px] md:rounded-[40px] shadow-sm border border-[var(--color-m3-outline)]/5 space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-heading font-semibold text-[var(--color-m3-on-surface)]">
              I have...
            </h2>
            <TimeSlider 
              value={availableTime} 
              onChange={setAvailableTime} 
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-heading font-semibold text-[var(--color-m3-on-surface)]">
              I want something...
            </h2>
            <MoodSelector 
              moods={MOODS} 
              selectedMoods={selectedMoods} 
              onSelect={toggleMood} 
            />
          </section>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDiscover}
          className={cn(
            "w-full py-4 rounded-[32px] text-lg font-bold transition-all shadow-[var(--shadow-m3-elevation-1)]",
            "bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)]",
            selectedMoods.length === 0 && "opacity-90 grayscale-[20%]"
          )}
        >
          {selectedMoods.length === 0 ? "Surprise Me" : "Discover"}
        </motion.button>
      </motion.div>
    </main>
  );
}
