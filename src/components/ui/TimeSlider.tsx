"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center text-[var(--color-m3-on-surface)]">
        <span className="text-sm font-medium">Available Time</span>
        <span className="text-xl font-heading font-bold text-[var(--color-m3-primary)]">{formatTime(value)}</span>
      </div>
      
      <div className="relative h-12 flex items-center group cursor-pointer" 
           onPointerDown={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
             const newValue = Math.round((p * (max - min) + min) / step) * step;
             onChange(newValue);
           }}
           onPointerMove={(e) => {
             if (e.buttons === 1) {
               const rect = e.currentTarget.getBoundingClientRect();
               const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
               const newValue = Math.round((p * (max - min) + min) / step) * step;
               onChange(newValue);
             }
           }}
      >
        {/* Background Track (Straight line) */}
        <div className="absolute left-0 right-0 h-1 bg-[var(--color-m3-surface-variant)] rounded-full overflow-hidden" />
        
        {/* Filled Squiggly Track */}
        <div 
          className="absolute left-0 h-6 overflow-hidden pointer-events-none transition-all duration-75 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 w-[1000px] text-[var(--color-m3-primary)] opacity-100">
            <svg 
              width="100%" 
              height="100%" 
              preserveAspectRatio="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="squiggle" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 0,12 Q 6,6 12,12 T 24,12" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#squiggle)" />
            </svg>
          </div>
        </div>

        {/* Thumb */}
        <motion.div 
          className="absolute h-5 w-5 rounded-m3-full bg-[var(--color-m3-primary)] shadow-md pointer-events-none z-10 top-1/2 -mt-2.5"
          style={{ left: `calc(${percentage}% - 10px)` }}
          whileHover={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        />
        
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

      <div className="flex justify-between text-xs text-[var(--color-m3-outline)] font-medium">
        <span>{formatTime(min)}</span>
        <span>{formatTime(max)}+</span>
      </div>
    </div>
  );
}
