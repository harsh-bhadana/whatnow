import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MediaCardProps } from "@/components/ui/MediaCard";

export interface WatchHistoryItem extends MediaCardProps {
  watchedAt: number;
  userRating: number;
}

export interface LocalProfile {
  id: string;
  name: string;
  color: string;
  watchHistory: WatchHistoryItem[];
}

interface AppState {
  // Current Session Inputs
  availableTime: number; // in minutes
  setAvailableTime: (time: number) => void;
  selectedMoods: string[];
  toggleMood: (mood: string) => void;
  
  // Persistent Data
  profiles: LocalProfile[];
  addProfile: (profile: LocalProfile) => void;
  updateProfileHistory: (profileId: string, history: WatchHistoryItem[]) => void;
  
  activeProfileId: string | null;
  setActiveProfileId: (id: string | null) => void;
  
  watchHistory: WatchHistoryItem[];
  setWatchHistory: (history: WatchHistoryItem[]) => void;
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
        
      profiles: [],
      addProfile: (profile) => 
        set((state) => ({ profiles: [...state.profiles, profile] })),
      updateProfileHistory: (profileId, history) =>
        set((state) => ({
          profiles: state.profiles.map((p) => 
            p.id === profileId ? { ...p, watchHistory: history } : p
          ),
          // Also update active watchHistory if the updated profile is currently active
          watchHistory: state.activeProfileId === profileId ? history : state.watchHistory
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
          
          const newHistory = [item, ...state.watchHistory];
          
          return { 
            watchHistory: newHistory,
            // Automatically sync the profile's history too
            profiles: state.profiles.map(p => 
              p.id === state.activeProfileId ? { ...p, watchHistory: newHistory } : p
            )
          };
        }),
      removeFromHistory: (id) =>
        set((state) => {
          const newHistory = state.watchHistory.filter((item) => item.id !== id);
          return {
            watchHistory: newHistory,
            // Automatically sync the profile's history too
            profiles: state.profiles.map(p => 
              p.id === state.activeProfileId ? { ...p, watchHistory: newHistory } : p
            )
          };
        }),
        
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
