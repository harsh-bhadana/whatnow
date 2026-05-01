import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MediaCardProps } from "@/components/ui/MediaCard";

export interface WatchHistoryItem extends MediaCardProps {
  watchedAt: number;
  userRating: number;
}

interface AppState {
  // Current Session Inputs
  availableTime: number; // in minutes
  setAvailableTime: (time: number) => void;
  selectedMoods: string[];
  toggleMood: (mood: string) => void;
  
  // Persistent Data
  watchHistory: WatchHistoryItem[];
  addToHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: number) => void;
  
  preferredGenres: string[];
  addPreferredGenre: (genre: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      availableTime: 120,
      setAvailableTime: (time) => set({ availableTime: time }),
      
      selectedMoods: [],
      toggleMood: (mood) =>
        set((state) => ({
          selectedMoods: state.selectedMoods.includes(mood)
            ? state.selectedMoods.filter((m) => m !== mood)
            : [...state.selectedMoods, mood],
        })),
        
      watchHistory: [],
      addToHistory: (item) =>
        set((state) => ({
          watchHistory: [item, ...state.watchHistory.filter((i) => i.id !== item.id)],
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((i) => i.id !== id),
        })),
        
      preferredGenres: [],
      addPreferredGenre: (genre) =>
        set((state) => ({
          preferredGenres: state.preferredGenres.includes(genre)
            ? state.preferredGenres
            : [...state.preferredGenres, genre],
        })),
    }),
    {
      name: "media-recommender-storage",
      partialize: (state) => ({
        watchHistory: state.watchHistory,
        preferredGenres: state.preferredGenres,
      }), // only persist history and preferences
    }
  )
);
