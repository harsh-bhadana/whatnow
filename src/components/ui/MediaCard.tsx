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
  shape?: "default" | "pill" | "asymmetric";
  onClick?: () => void;
}

export function MediaCard({
  title,
  imageUrl,
  rating,
  type,
  runtime,
  shape = "default",
  onClick,
}: MediaCardProps) {
  
  const getShapeClasses = () => {
    switch (shape) {
      case "pill":
        return "rounded-m3-full";
      case "asymmetric":
        return "rounded-tl-m3-xl rounded-br-m3-xl rounded-tr-m3-sm rounded-bl-m3-sm";
      case "default":
      default:
        return "rounded-m3-lg";
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
      whileHover={{ y: -5, boxShadow: "var(--shadow-m3-elevation-3)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden cursor-pointer group bg-[var(--color-m3-surface-container)]",
        "flex flex-col shadow-[var(--shadow-m3-elevation-1)] transition-shadow duration-300",
        getShapeClasses()
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
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
