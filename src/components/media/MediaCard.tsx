/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Star, Sparkles } from "lucide-react";
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
  basedOnLikeTitle?: string;
  genreIds?: number[];
  actionButtons?: React.ReactNode;
  reason?: string;
  overview?: string;
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
  actionButtons,
  reason,
  isBasedOnLikes,
  basedOnLikeTitle,
}: MediaCardProps) {
  
  const getTypeColor = () => {
    switch (type) {
      case "movie": return "bg-blue-500/90 text-blue-50 border border-blue-400/40 backdrop-blur-md";
      case "tv": return "bg-emerald-500/90 text-emerald-50 border border-emerald-400/40 backdrop-blur-md";
      case "anime": return "bg-purple-500/90 text-purple-50 border border-purple-400/40 backdrop-blur-md";
      default: return "bg-gray-500/90 text-gray-50 border border-gray-400/40 backdrop-blur-md";
    }
  };

  const Wrapper = href ? Link : "div";

  return (
    <div className="group relative w-full flex flex-col">
      {/* 1. Placeholder to keep layout size static */}
      <div className="w-full flex flex-col opacity-0 pointer-events-none select-none" aria-hidden="true">
        <div className="w-full aspect-[2/3]" />
        <div className="p-3 min-h-[3.5rem]" />
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
          "absolute inset-x-0 bottom-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-[var(--color-m3-surface)] z-20",
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
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[var(--color-m3-surface-container)] text-[var(--color-m3-on-surface-variant)]">
              <span className="text-xs font-bold text-center px-4 leading-tight">{title}</span>
            </div>
          )}
            
          {/* Subtle top gradient for badges */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* Top Left Badge: Type */}
          <div className="absolute top-3 left-3 z-20">
            <span 
              style={{ viewTransitionName: `card-tag-${type}-${id}` }}
              className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md", getTypeColor())}
            >
              {type}
            </span>
          </div>

          {/* Top Right Badge: Rating */}
          <div 
            style={{ viewTransitionName: `card-rating-${type}-${id}` }}
            className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-yellow-400 text-xs font-bold shadow-sm border border-[var(--color-m3-outline-variant)]"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>

          {/* Bottom Badge: Based on Likes */}
          {isBasedOnLikes && basedOnLikeTitle && (
            <div className="absolute bottom-3 left-3 right-3 z-20">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-[var(--color-m3-tertiary)]/90 text-[var(--color-m3-on-tertiary)] backdrop-blur-md rounded-full shadow-md truncate max-w-full">
                <Sparkles className="w-3 h-3 shrink-0" />
                Because you liked {basedOnLikeTitle}
              </span>
            </div>
          )}
        </div>
        
        {/* Compact Text Section Below the Image */}
        <div className="relative z-10 p-3 shrink-0 flex flex-col justify-end bg-black/60 backdrop-blur-md border-t border-[var(--color-m3-outline-variant)]">
          <h3 
            style={{ viewTransitionName: `card-title-${type}-${id}` }}
            className="font-heading font-bold text-xs sm:text-sm text-[var(--color-m3-on-background)] leading-tight line-clamp-2 drop-shadow-md"
          >
            {title}
          </h3>
          {reason && (
            <p className="text-[10px] sm:text-[11px] text-[var(--color-m3-on-background)]/60 mt-1.5 leading-snug line-clamp-2 font-medium">
              {reason}
            </p>
          )}
          {runtime && (
            <span className="text-[10px] font-medium text-[var(--color-m3-on-background)]/70 mt-1 block">{runtime}m</span>
          )}
        </div>
      </Wrapper>
    </div>
  );
}
