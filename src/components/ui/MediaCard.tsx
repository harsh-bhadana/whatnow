"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaCardProps {
  id: number;
  title: string;
  imageUrl: string;
  rating: number;
  type: "movie" | "tv" | "anime";
  runtime?: number;
  shape?: "rock1" | "rock2" | "rock3" | "rock4" | "default" | string;
  onClick?: () => void;
}

const ROCK_SHAPES = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "40% 60% 70% 30% / 50% 60% 30% 60%",
  "70% 30% 50% 50% / 30% 30% 70% 70%",
  "30% 70% 70% 30% / 60% 40% 60% 40%",
  "50% 50% 20% 80% / 25% 80% 20% 75%",
];

export function MediaCard({
  title,
  imageUrl,
  rating,
  type,
  runtime,
  shape = "default",
  onClick,
}: MediaCardProps) {
  
  const getOrganicRadius = () => {
    switch (shape) {
      case "asymmetric": return ROCK_SHAPES[0];
      case "pill": return ROCK_SHAPES[1];
      case "rock3": return ROCK_SHAPES[2];
      case "rock4": return ROCK_SHAPES[3];
      default: return ROCK_SHAPES[4];
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "movie": return "bg-blue-100 text-blue-800";
      case "tv": return "bg-green-100 text-green-800";
      case "anime": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div 
      className="group cursor-pointer flex flex-col h-full w-full"
      onClick={onClick}
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.02, boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)" }}
        whileTap={{ scale: 0.98, boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)" }}
        style={{ borderRadius: getOrganicRadius() }}
        className="aspect-[4/5] bg-[var(--color-m3-surface-container)] relative overflow-hidden transition-all duration-500 shadow-md w-full"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          loading="lazy"
        />
        
        {/* Badges Overlapping inside the pebble */}
        <div className="absolute top-4 left-4 z-20">
          <span className={cn("text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm", getTypeColor())}>
            {type}
          </span>
        </div>
      </motion.div>
      
      {/* Content strictly outside the stone shape */}
      <div className="mt-5 px-2 flex-1 flex flex-col">
        <h3 className="font-heading font-bold text-[1.1rem] text-[var(--color-m3-on-surface)] leading-tight line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex items-center gap-1.5 text-[var(--color-m3-primary)] font-bold text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
          {runtime && (
            <span className="text-sm font-bold text-[var(--color-m3-outline)]">{runtime}m</span>
          )}
        </div>
      </div>
    </div>
  );
}
