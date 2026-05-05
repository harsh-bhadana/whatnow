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
  "polygon(2% 1%, 98% 0%, 100% 97%, 1% 100%)",
  "polygon(0% 2%, 99% 1%, 98% 99%, 1% 98%)",
  "polygon(1% 0%, 100% 2%, 99% 100%, 0% 98%)",
  "polygon(0% 0%, 98% 1%, 100% 100%, 2% 99%)",
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
  
  const getOrganicClipPath = () => {
    switch (shape) {
      case "asymmetric": return ROCK_SHAPES[0];
      case "pill": return ROCK_SHAPES[1];
      case "rock3": return ROCK_SHAPES[2];
      case "rock4": return ROCK_SHAPES[3];
      default: return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
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
    <motion.div
      whileHover={{ y: -5, scale: 1.02, filter: "drop-shadow(6px 6px 0px var(--color-m3-primary))" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,0.5))" }}
      className={cn(
        "cursor-pointer group relative transition-all duration-300",
      )}
    >
      <div 
        className="relative aspect-[2/3] w-full h-full overflow-hidden bg-[var(--color-m3-surface-container)] rounded-m3-md"
        style={{ clipPath: getOrganicClipPath() }}
      >
        {/* Fallback background if image fails */}
        <div className="absolute inset-0 bg-[var(--color-m3-surface-variant)]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-m3-full uppercase tracking-wider", getTypeColor())}>
            {type}
          </span>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end text-white">
          <h3 className="font-heading font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
            {title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-sm font-medium drop-shadow-md">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
            {runtime && (
              <span className="opacity-90">{runtime}m</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
