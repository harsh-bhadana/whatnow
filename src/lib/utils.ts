import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { WatchHistoryItem } from "@/lib/store/useAppStore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TasteProfile {
  likedGenres: number[];
  dislikedGenres: number[];
  likedTitles: string[];
  dislikedTitles: string[];
}

export function buildTasteProfile(watchHistory: WatchHistoryItem[]): TasteProfile {
  const genreCounts: { [id: number]: number } = {};
  const dislikedGenreCounts: { [id: number]: number } = {};
  const likedTitles: string[] = [];
  const dislikedTitles: string[] = [];

  watchHistory.forEach((item) => {
    if (item.userRating === 1 || item.userRating === 0.5) {
      if (item.title) likedTitles.push(item.title);
      const weight = item.userRating === 1 ? 1 : 0.5;
      item.genreIds?.forEach((id) => {
        genreCounts[id] = (genreCounts[id] || 0) + weight;
      });
    } else if (item.userRating === -1) {
      if (item.title) dislikedTitles.push(item.title);
      item.genreIds?.forEach((id) => {
        dislikedGenreCounts[id] = (dislikedGenreCounts[id] || 0) + 1;
      });
    }
  });

  const likedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => Number(id));

  const dislikedGenres = Object.entries(dislikedGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => Number(id));

  return {
    likedGenres,
    dislikedGenres,
    likedTitles,
    dislikedTitles
  };
}
