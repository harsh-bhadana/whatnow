"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function MoodChip({ label, selected, onClick }: MoodChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-m3-full text-sm font-medium transition-colors border outline-none",
        selected
          ? "bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-secondary-container)] border-transparent"
          : "bg-[var(--color-m3-surface)] text-[var(--color-m3-on-surface)] border-[var(--color-m3-outline)] hover:bg-[var(--color-m3-surface-variant)]"
      )}
    >
      {label}
    </motion.button>
  );
}

interface MoodSelectorProps {
  moods: string[];
  selectedMoods: string[];
  onSelect: (mood: string) => void;
}

export function MoodSelector({ moods, selectedMoods, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <MoodChip
          key={mood}
          label={mood}
          selected={selectedMoods.includes(mood)}
          onClick={() => onSelect(mood)}
        />
      ))}
    </div>
  );
}
