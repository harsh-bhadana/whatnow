"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center text-[var(--color-m3-on-surface)]">
        <span className="text-sm font-medium">Available Time</span>
        <span className="text-lg font-bold text-[var(--color-m3-primary)]">{formatTime(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "w-full h-2 rounded-m3-full appearance-none cursor-pointer",
          "bg-[var(--color-m3-surface-variant)]",
          "accent-[var(--color-m3-primary)]"
        )}
      />
      <div className="flex justify-between text-xs text-[var(--color-m3-outline)]">
        <span>{formatTime(min)}</span>
        <span>{formatTime(max)}+</span>
      </div>
    </div>
  );
}
