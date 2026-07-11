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
      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider">Appearance</span>
          <div className="flex bg-[var(--color-m3-surface-container-highest)] p-1 rounded-xl">
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                theme === "light"
                  ? "bg-[var(--color-m3-surface)] shadow-sm text-[var(--color-m3-primary)]"
                  : "text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-on-surface)]"
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="font-medium text-sm">Light</span>
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                theme === "dark"
                  ? "bg-[var(--color-m3-surface)] shadow-sm text-[var(--color-m3-primary)]"
                  : "text-[var(--color-m3-on-surface-variant)] hover:text-[var(--color-m3-on-surface)]"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="font-medium text-sm">Dark</span>
            </button>
          </div>
        </div>

        {/* Palette Selector */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-[var(--color-m3-on-surface-variant)] uppercase tracking-wider">Color Palette</span>
          <div className="flex gap-3">
            {palettes.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePaletteChange(p.id)}
                className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm border-2 ${
                  activePalette === p.id 
                    ? "border-[var(--color-m3-primary)] scale-110" 
                    : "border-transparent"
                }`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              >
                {activePalette === p.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white drop-shadow-md" />
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
