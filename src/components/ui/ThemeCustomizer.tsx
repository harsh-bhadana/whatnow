"use client";

import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store/useAppStore";
import { useState, useEffect } from "react";
import { Moon, Sun, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const palettes = [
  { id: "default", name: "Purple", color: "#6750A4" },
  { id: "mint", name: "Mint", color: "#006C4C" },
  { id: "sunset", name: "Sunset", color: "#A23F16" },
];

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const { activePalette, setActivePalette } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const applyTransition = () => {
    document.documentElement.classList.add("theme-transition");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  };

  const handleThemeChange = (newTheme: string) => {
    if (newTheme !== theme) {
      applyTransition();
      setTheme(newTheme);
      triggerOverlay();
    }
  };

  const handlePaletteChange = (newPalette: string) => {
    if (newPalette !== activePalette) {
      applyTransition();
      setActivePalette(newPalette);
      triggerOverlay();
    }
  };

  const triggerOverlay = () => {
    setShowOverlay(true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Mode Selector */}
        <div className="space-y-4">
          <span className="text-sm font-medium text-[var(--color-m3-on-surface-variant)] tracking-wide">Appearance</span>
          <div className="flex border border-[var(--color-m3-outline)] rounded-full h-10 overflow-hidden">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 flex items-center justify-center gap-2 transition-colors relative ${
                theme === "light"
                  ? "bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-secondary-container)]"
                  : "bg-transparent text-[var(--color-m3-on-surface)] hover:bg-[var(--color-m3-surface-variant)]/50"
              }`}
            >
              {theme === "light" ? <Check className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="font-medium text-sm">Light</span>
            </button>
            <div className="w-px bg-[var(--color-m3-outline)]" />
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 flex items-center justify-center gap-2 transition-colors relative ${
                theme === "dark"
                  ? "bg-[var(--color-m3-secondary-container)] text-[var(--color-m3-on-secondary-container)]"
                  : "bg-transparent text-[var(--color-m3-on-surface)] hover:bg-[var(--color-m3-surface-variant)]/50"
              }`}
            >
              {theme === "dark" ? <Check className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="font-medium text-sm">Dark</span>
            </button>
          </div>
        </div>

        {/* Palette Selector */}
        <div className="space-y-4">
          <span className="text-sm font-medium text-[var(--color-m3-on-surface-variant)] tracking-wide">Color Palette</span>
          <div className="flex gap-4">
            {palettes.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePaletteChange(p.id)}
                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-m3-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-m3-surface)] ${
                  activePalette === p.id 
                    ? "ring-2 ring-[var(--color-m3-primary)] ring-offset-2 ring-offset-[var(--color-m3-surface)]" 
                    : "hover:scale-105 active:scale-95 shadow-sm border border-black/10 dark:border-white/10"
                }`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              >
                {activePalette === p.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white drop-shadow-sm" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Palette Overlay Animation */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-[var(--color-m3-background)]"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-heading font-bold text-[var(--color-m3-primary)]"
              >
                {theme === "light" ? "Light Mode" : "Dark Mode"} &middot; {palettes.find(p => p.id === activePalette)?.name}
              </motion.div>
              <div className="flex gap-4">
                {[
                  { label: "Primary", bg: "bg-[var(--color-m3-primary)]", delay: 0.3 },
                  { label: "Secondary", bg: "bg-[var(--color-m3-secondary)]", delay: 0.4 },
                  { label: "Tertiary", bg: "bg-[var(--color-m3-tertiary)]", delay: 0.5 },
                  { label: "Surface", bg: "bg-[var(--color-m3-surface-container-high)]", delay: 0.6 },
                ].map((swatch) => (
                  <motion.div
                    key={swatch.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: swatch.delay }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-16 h-16 rounded-full shadow-lg border border-[var(--color-m3-outline-variant)] ${swatch.bg}`} />
                    <span className="text-xs font-medium text-[var(--color-m3-on-surface-variant)]">{swatch.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
