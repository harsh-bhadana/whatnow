"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface TimeSliderProps {
  value: number; // in minutes
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function TimeSlider({ value, onChange, min = 15, max = 240, step = 15 }: TimeSliderProps) {
  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  };

  const getTimeSuggestion = (mins: number) => {
    if (mins <= 30) return "Short film, Anime, or Sitcom";
    if (mins <= 60) return "TV Drama or Documentary";
    if (mins <= 120) return "Standard Movie";
    if (mins <= 180) return "Long Movie or Mini-binge";
    return "Epic Movie or Binge-watch session";
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-start text-[var(--color-m3-on-surface)] px-2">
        <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-m3-outline)] mt-1">Available Time</span>
        <div className="flex flex-col items-end">
          <motion.span 
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-heading font-black text-[var(--color-m3-primary)]"
          >
            {formatTime(value)}
          </motion.span>
          <motion.span 
            key={`suggestion-${value}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium text-[var(--color-m3-outline)] mt-1"
          >
            {getTimeSuggestion(value)}
          </motion.span>
        </div>
      </div>
      
      <div className="relative h-16 flex items-center group cursor-pointer touch-none" 
           onPointerDown={(e) => {
             setIsDragging(true);
             const rect = e.currentTarget.getBoundingClientRect();
             const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
             const newValue = Math.round((p * (max - min) + min) / step) * step;
             onChange(newValue);
           }}
           onPointerMove={(e) => {
             if (isDragging || e.buttons === 1) {
               const rect = e.currentTarget.getBoundingClientRect();
               const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
               const newValue = Math.round((p * (max - min) + min) / step) * step;
               onChange(newValue);
             }
           }}
           onPointerUp={() => setIsDragging(false)}
           onPointerLeave={() => setIsDragging(false)}
      >
        {/* Thick Background Track */}
        <div className="absolute left-0 right-0 h-8 bg-[var(--color-m3-surface-container-highest)] rounded-full overflow-hidden" />
        
        {/* Thick Filled Track */}
        <div 
          className="absolute left-0 h-8 bg-[var(--color-m3-primary)] rounded-full pointer-events-none transition-all duration-100 ease-out"
          style={{ width: `${percentage}%` }}
        />

        {/* Chunky Thumb */}
        <motion.div 
          className="absolute h-10 w-10 rounded-full bg-[var(--color-m3-on-primary)] shadow-md pointer-events-none z-10 top-1/2 -mt-5 flex items-center justify-center"
          style={{ left: `calc(${percentage}% - 20px)` }}
          animate={{ 
            scale: isDragging ? 1.3 : 1,
            boxShadow: isDragging 
              ? "0px 8px 16px rgba(103, 80, 164, 0.3)" 
              : "0px 4px 8px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Inner decorative dot */}
          <div className="w-3 h-3 rounded-full bg-[var(--color-m3-primary)]" />
        </motion.div>
        
        {/* Invisible native input for accessibility / focus */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-sm text-[var(--color-m3-outline)] font-medium px-2">
        <span>{formatTime(min)}</span>
        <span>{formatTime(max)}+</span>
      </div>
    </div>
  );
}
