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
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;
  
  watchHistory: WatchHistoryItem[];
  setWatchHistory: (history: WatchHistoryItem[]) => void;
  addToHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: number) => void;
  
  preferredGenres: string[];
  addPreferredGenre: (genre: string) => void;
  
  // Transition State
  selectedMedia: MediaCardProps | null;
  setSelectedMedia: (media: MediaCardProps | null) => void;
  cachedRecommendations: MediaCardProps[];
  setCachedRecommendations: (recommendations: MediaCardProps[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      availableTime: 120,
      setAvailableTime: (time) => set({ availableTime: time, cachedRecommendations: [] }),
      
      selectedMoods: [],
      toggleMood: (mood) =>
        set((state) => ({
          cachedRecommendations: [],
          selectedMoods: state.selectedMoods.includes(mood)
            ? state.selectedMoods.filter((m) => m !== mood)
            : [...state.selectedMoods, mood],
        })),
        
      activeProfileId: null,
      setActiveProfileId: (id) => set({ activeProfileId: id }),
      watchHistory: [],
      setWatchHistory: (history) => set({ watchHistory: history }),
      addToHistory: (item) =>
        set((state) => {
          // Check if it already exists
          const exists = state.watchHistory.find((h) => h.id === item.id);
          if (exists) return state;
          return { watchHistory: [item, ...state.watchHistory] };
        }),
      removeFromHistory: (id) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((item) => item.id !== id),
        })),
        
      preferredGenres: [],
      addPreferredGenre: (genre) =>
        set((state) => ({
          preferredGenres: state.preferredGenres.includes(genre)
            ? state.preferredGenres
            : [...state.preferredGenres, genre],
        })),
        
      selectedMedia: null,
      setSelectedMedia: (media) => set({ selectedMedia: media }),
      cachedRecommendations: [],
      setCachedRecommendations: (recommendations) => set({ cachedRecommendations: recommendations }),
    }),
    {
      name: "media-recommender-storage",
      partialize: (state) => ({
        watchHistory: state.watchHistory,
        preferredGenres: state.preferredGenres,
        activeProfileId: state.activeProfileId,
      }), // persist history, preferences, and active profile
    }
  )
);
