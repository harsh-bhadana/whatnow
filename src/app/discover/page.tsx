"use client";

import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!activeProfileId) {
      router.push("/");
    }
  }, [activeProfileId, router]);

  const handleDiscover = () => {
    // Navigate to recommendations page with query params or rely on store
    router.push("/recommendations");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-3xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full flex flex-col gap-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-[var(--color-m3-primary)]">
            What are you in the mood for?
          </h1>
          <p className="text-lg text-[var(--color-m3-outline)] max-w-xl mx-auto">
            Tell us how much time you have and what you want to feel. We'll find the perfect movie, show, or anime for you.
          </p>
        </div>

        <div className="bg-[var(--color-m3-surface-container)] p-8 rounded-m3-xl shadow-[var(--shadow-m3-elevation-1)] space-y-8">
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
          whileHover={{ scale: 1.02, boxShadow: "var(--shadow-m3-elevation-2)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDiscover}
          className={cn(
            "w-full py-4 rounded-m3-full text-lg font-bold transition-all",
            "bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] shadow-[var(--shadow-m3-elevation-1)]",
            selectedMoods.length === 0 && "opacity-80 grayscale-[30%]"
          )}
        >
          {selectedMoods.length === 0 ? "Surprise Me" : "Discover"}
        </motion.button>
      </motion.div>
    </main>
  );
}
