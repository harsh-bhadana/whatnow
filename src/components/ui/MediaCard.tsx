/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'next-view-transitions';

export interface MediaCardProps {
  id: number;
  title: string;
  imageUrl: string;
  rating: number;
  type: "movie" | "tv" | "anime";
  runtime?: number;
  shape?: "rock1" | "rock2" | "rock3" | "rock4" | "default" | string;
  href?: string;
  onClick?: (e?: any) => void;
  isBasedOnLikes?: boolean;
  actionButtons?: React.ReactNode;
}

export function MediaCard({
  id,
  title,
  imageUrl,
  rating,
  type,
  runtime,
  href,
  onClick,
  isBasedOnLikes,
  actionButtons,
}: MediaCardProps) {
  
  const getTypeColor = () => {
    switch (type) {
      case "movie": return "bg-blue-100 text-blue-800";
      case "tv": return "bg-green-100 text-green-800";
      case "anime": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const Wrapper = href ? Link : "div";

  return (
    <div className="group relative w-full flex flex-col">
      {/* 1. Placeholder to keep layout size static */}
      <div className="w-full flex flex-col opacity-0 pointer-events-none select-none" aria-hidden="true">
        <div className="w-full aspect-[2/3]" />
        <div className="p-3 min-h-[4rem]" />
      </div>

      {/* 2. Action Buttons in the transparent space that will be revealed */}
      {actionButtons && (
        <div className="absolute top-1 inset-x-0 h-12 z-30 flex items-center justify-end px-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
          {actionButtons}
        </div>
      )}

      {/* 3. The Actual Card that shrinks from the top */}
      <Wrapper 
        href={href as string}
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-zinc-900 z-20",
          actionButtons ? "top-0 group-hover:top-14" : "top-0 hover:-translate-y-1"
        )}
        onClick={onClick}
      >
        {/* Ambient Blurred Background for the entire card */}
        {imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-125"
            aria-hidden="true"
          />
        )}

        {/* The fully visible poster image on top */}
        <div 
          style={{ viewTransitionName: `card-image-${type}-${id}` }}
          className="relative z-10 w-full flex-1 overflow-hidden rounded-t-2xl bg-black/20"
        >
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-500">
              <span className="text-xs font-bold text-center px-4 leading-tight">{title}</span>
            </div>
          )}
            
          {/* Subtle top gradient for badges */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* Top Left Badge: Type */}
          <div className="absolute top-3 left-3 z-20">
            <span 
              style={{ viewTransitionName: `card-tag-${type}-${id}` }}
              className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm", getTypeColor())}
            >
              {type}
            </span>
          </div>

          {/* Top Right Badge: Rating */}
          <div 
            style={{ viewTransitionName: `card-rating-${type}-${id}` }}
            className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-yellow-400 text-xs font-bold shadow-sm border border-white/10"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>

          {/* Bottom Left Badge: Based on your likes */}
          {isBasedOnLikes && (
            <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-center items-center gap-1.5 bg-gradient-to-r from-pink-500/80 to-purple-500/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <Star className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md text-center leading-tight">Based on likes</span>
            </div>
          )}
        </div>
        
        {/* Small Text Section Below the Image */}
        <div className="relative z-10 p-3 min-h-[4rem] shrink-0 flex flex-col justify-center bg-black/20 backdrop-blur-lg border-t border-white/10">
          <h3 
            style={{ viewTransitionName: `card-title-${type}-${id}` }}
            className="font-heading font-bold text-sm text-white leading-tight line-clamp-2 drop-shadow-md w-fit"
          >
            {title}
          </h3>
          {runtime && (
            <span className="text-[11px] font-medium text-white/70 mt-0.5">{runtime}m</span>
          )}
        </div>
      </Wrapper>
    </div>
  );
}
