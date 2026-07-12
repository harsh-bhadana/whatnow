import { motion } from "framer-motion";
import { TreePine } from "lucide-react";

export function TouchGrassCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full aspect-[2/3] bg-green-500/5 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 transition-colors shadow-sm overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
      <TreePine className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mb-3 sm:mb-4 animate-bounce" />
      <h3 className="text-lg sm:text-xl font-bold font-heading text-green-700 dark:text-green-400 mb-2 leading-tight">
        The rabbit hole goes deeper...
      </h3>
      <p className="text-xs sm:text-sm text-green-600/90 dark:text-green-400/80">
        You&apos;ve been scrolling for a while! It might be time to touch some grass. 🌱
      </p>
    </motion.div>
  );
}
