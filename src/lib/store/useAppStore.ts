import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MediaCardProps } from "@/components/ui/MediaCard";

export interface WatchHistoryItem extends MediaCardProps {
  watchedAt: number;
}

interface AppState {
  // Current Session Inputs
  availableTime: number; // in minutes
  setAvailableTime: (time: number) => void;
  selectedMoods: string[];
  toggleMood: (mood: string) => void;
  
  // Persistent Data
  activeProfileId: string | null;
  activeProfile: { name: string; color: string; includeAdult?: boolean } | null;
  setActiveProfile: (id: string | null, profile?: { name: string; color: string; includeAdult?: boolean }) => void;
  
  watchHistory: WatchHistoryItem[];
  setWatchHistory: (history: WatchHistoryItem[]) => void;
  addToHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: number) => void;
  

  
  // Transition State
  selectedMedia: MediaCardProps | null;
  setSelectedMedia: (media: MediaCardProps | null) => void;
  cachedRecommendations: MediaCardProps[];
  setCachedRecommendations: (recommendations: MediaCardProps[]) => void;
  
  // Advanced Filters
  mediaType: "all" | "movie" | "tv" | "anime";
  setMediaType: (type: "all" | "movie" | "tv" | "anime") => void;
  selectedLikedMediaIds: number[];
  toggleLikedMedia: (id: number) => void;
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
      activeProfile: null,
      setActiveProfile: (id, profile) => set({ activeProfileId: id, activeProfile: profile || null }),
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
        

        
      selectedMedia: null,
      setSelectedMedia: (media) => set({ selectedMedia: media }),
      cachedRecommendations: [],
      setCachedRecommendations: (recommendations) => set({ cachedRecommendations: recommendations }),
      
      mediaType: "all",
      setMediaType: (type) => set({ mediaType: type, cachedRecommendations: [] }),
      selectedLikedMediaIds: [],
      toggleLikedMedia: (id) =>
        set((state) => ({
          cachedRecommendations: [],
          selectedLikedMediaIds: state.selectedLikedMediaIds.includes(id)
            ? state.selectedLikedMediaIds.filter((mid) => mid !== id)
            : [...state.selectedLikedMediaIds, id],
        })),
    }),
    {
      name: "media-recommender-storage",
      partialize: (state) => ({
        watchHistory: state.watchHistory,
        activeProfileId: state.activeProfileId,
        activeProfile: state.activeProfile,
      }),
    }
  )
);
