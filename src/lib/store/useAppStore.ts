import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MediaCardProps } from "@/components/media/MediaCard";

export interface WatchHistoryItem extends MediaCardProps {
  watchedAt: number;
  userRating?: number;
}

interface AppState {
  // Current Session Inputs
  availableTime: number; // in minutes
  setAvailableTime: (time: number) => void;
  selectedMoods: string[];
  toggleMood: (mood: string) => void;
  
  // Persistent Data (Now loaded from User collection)
  userDataLoaded: boolean;
  setUserDataLoaded: (loaded: boolean) => void;
  
  watchHistory: WatchHistoryItem[];
  setWatchHistory: (history: WatchHistoryItem[]) => void;
  rateMediaStore: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: number) => void;
  
  watchlist: MediaCardProps[];
  setWatchlist: (watchlist: MediaCardProps[]) => void;
  addToWatchlistStore: (item: MediaCardProps) => void;
  removeFromWatchlistStore: (id: number) => void;
  

  
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
  resetSession: () => void;

  // Theming
  activePalette: string;
  setActivePalette: (palette: string) => void;
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
        
      userDataLoaded: false,
      setUserDataLoaded: (loaded) => set({ userDataLoaded: loaded }),
      watchHistory: [],
      setWatchHistory: (history) => set({ watchHistory: history }),
      rateMediaStore: (item) =>
        set((state) => {
          // Check if it already exists
          const existingIndex = state.watchHistory.findIndex((h) => h.id === item.id);
          if (existingIndex !== -1) {
            // Update existing rating
            const newHistory = [...state.watchHistory];
            newHistory[existingIndex] = { ...newHistory[existingIndex], userRating: item.userRating };
            return { watchHistory: newHistory };
          }
          // Otherwise prepend new
          return { watchHistory: [item, ...state.watchHistory] };
        }),
      removeFromHistory: (id) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((item) => item.id !== id),
        })),
        
      watchlist: [],
      setWatchlist: (watchlist) => set({ watchlist }),
      addToWatchlistStore: (item) =>
        set((state) => {
          if (state.watchlist.some((w) => w.id === item.id)) return state;
          return { watchlist: [item, ...state.watchlist] };
        }),
      removeFromWatchlistStore: (id) =>
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== id),
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
      resetSession: () => set({
        availableTime: 120,
        selectedMoods: [],
        cachedRecommendations: [],
        selectedMedia: null,
        mediaType: "all",
        selectedLikedMediaIds: [],
      }),

      activePalette: "default",
      setActivePalette: (palette) => set({ activePalette: palette }),
    }),
    {
      name: "media-recommender-storage",
      partialize: (state) => ({
        // We only persist session inputs. Watch history and watchlist are fetched from the server.
        availableTime: state.availableTime,
        selectedMoods: state.selectedMoods,
      }),
    }
  )
);
