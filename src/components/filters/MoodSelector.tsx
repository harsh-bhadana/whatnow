"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Check } from "lucide-react";

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
      layout
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 outline-none overflow-hidden relative",
        selected
          ? "bg-[var(--color-m3-primary-container)] text-[var(--color-m3-on-primary-container)] shadow-sm"
          : "bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-container-highest)] border border-transparent"
      )}
    >
      {/* State layer overlay */}
      <div className="absolute inset-0 bg-current opacity-0 hover:opacity-[0.08] transition-opacity" />
      
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0, width: 0 }}
          animate={{ scale: 1, opacity: 1, width: "auto" }}
          exit={{ scale: 0, opacity: 0, width: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex-shrink-0"
        >
          <Check className="w-4 h-4" strokeWidth={3} />
        </motion.div>
      )}
      <span>{label}</span>
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
