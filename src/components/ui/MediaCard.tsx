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
  id,
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
    <motion.div 
      layoutId={`card-container-${id}`}
      className="group cursor-pointer relative w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col bg-zinc-900"
      onClick={onClick}
    >
      {/* Ambient Blurred Background for the entire card */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        layoutId={`card-ambient-${id}`}
        src={imageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-125"
        aria-hidden="true"
      />

      {/* The fully visible poster image on top */}
      <div className="relative z-10 w-full aspect-[2/3] overflow-hidden bg-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          layoutId={`card-image-${id}`}
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Subtle top gradient for badges */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Top Left Badge: Type */}
        <div className="absolute top-3 left-3 z-20">
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm", getTypeColor())}>
            {type}
          </span>
        </div>

        {/* Top Right Badge: Rating */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-yellow-400 text-xs font-bold shadow-sm border border-white/10">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Small Text Section Below the Image (Shows the ambient blur behind it) */}
      <motion.div 
        layoutId={`card-text-container-${id}`}
        className="relative z-10 p-3 min-h-[4rem] flex flex-col justify-center bg-black/20 backdrop-blur-lg border-t border-white/10"
      >
        <motion.h3 
          layoutId={`card-title-${id}`}
          className="font-heading font-bold text-sm text-white leading-tight line-clamp-2 drop-shadow-md"
        >
          {title}
        </motion.h3>
        {runtime && (
          <span className="text-[11px] font-medium text-white/70 mt-0.5">{runtime}m</span>
        )}
      </motion.div>
    </motion.div>
  );
}
