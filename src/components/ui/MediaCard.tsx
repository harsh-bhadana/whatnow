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

export function MediaCard({
  title,
  imageUrl,
  rating,
  type,
  runtime,
  onClick,
}: MediaCardProps) {
  
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
      className="group cursor-pointer flex flex-col h-full w-full bg-[var(--color-m3-surface-container)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--color-m3-outline-variant)] hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--color-m3-surface-variant)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10">
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm", getTypeColor())}>
            {type}
          </span>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-heading font-bold text-base md:text-lg text-[var(--color-m3-on-surface)] leading-tight line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex items-center gap-1.5 text-[var(--color-m3-primary)] font-bold text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
          {runtime && (
            <span className="text-sm font-medium text-[var(--color-m3-outline)]">{runtime}m</span>
          )}
        </div>
      </div>
    </div>
  );
}
