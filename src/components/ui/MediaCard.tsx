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
      className="group cursor-pointer relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Subtle top gradient for badges */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Top Left Badge: Type */}
      <div className="absolute top-3 left-3 z-10">
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm", getTypeColor())}>
          {type}
        </span>
      </div>

      {/* Top Right Badge: Rating */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-yellow-400 text-xs font-bold shadow-sm border border-white/10">
        <Star className="w-3.5 h-3.5 fill-current" />
        <span>{rating.toFixed(1)}</span>
      </div>
      
      {/* Bottom Text Container (Glassmorphism) */}
      <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl backdrop-blur-xl bg-black/40 border border-white/10 flex flex-col z-10">
        <h3 className="font-heading font-bold text-sm md:text-base text-white leading-tight line-clamp-2 drop-shadow-md">
          {title}
        </h3>
        {runtime && (
          <span className="text-xs font-medium text-white/80 mt-1">{runtime}m</span>
        )}
      </div>
    </div>
  );
}
