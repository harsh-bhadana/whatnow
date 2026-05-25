import { motion } from "framer-motion";
import { TreePine } from "lucide-react";

export function TouchGrassCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 xl:col-span-6 bg-[var(--color-m3-surface-container)] rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-[var(--color-m3-outline)]/20 shadow-sm overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
      <TreePine className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
      <h3 className="text-2xl font-bold font-heading text-[var(--color-m3-on-surface)] mb-2">
        The rabbit hole goes deeper...
      </h3>
      <p className="text-[var(--color-m3-on-surface-variant)] max-w-md">
        But you've been scrolling for a while! It might be time to take a break, step outside, and touch some grass. 🌱
      </p>
    </motion.div>
  );
}
