/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { MediaCardProps } from "@/components/ui/MediaCard";

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Mood to TMDB Genre IDs mapping
const MOOD_TO_TMDB_GENRE: Record<string, number[]> = {
  "Cozy": [10751, 10749, 35], // Family, Romance, Comedy
  "Adrenaline": [28, 53, 12], // Action, Thriller, Adventure
  "Laughs": [35], // Comedy
  "Tears": [18], // Drama
  "Thought-provoking": [878, 9648], // Sci-Fi, Mystery
  "Spooky": [27, 53], // Horror, Thriller
  "Heartwarming": [10751, 10749], // Family, Romance
  "Epic": [12, 14, 36], // Adventure, Fantasy, History
  "Mind-bending": [878, 9648], // Sci-Fi, Mystery
  "Nostalgic": [10751, 35] // Family, Comedy
};

export async function fetchRecommendations(
  timeLimit: number, 
  moods: string[], 
  watchedHistoryIds: number[] = [],
  mediaType: "all" | "movie" | "tv" | "anime" = "all",
  likedMediaIds: { id: number, type: "movie" | "tv" }[] = [],
  includeAdult: boolean = false,
  page: number = 1
): Promise<MediaCardProps[]> {
  
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") {
    return [];
  }

  try {
    let rawResults: any[] = [];
    const allPromises: Promise<any[]>[] = [];
    
    // LIKED MEDIA FETCHES
    if (likedMediaIds.length > 0) {
      const fetchPromises = likedMediaIds.map(async (media) => {
        const res = await fetch(`${BASE_URL}/${media.type}/${media.id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
        const data = await res.json();
        if (data.success === false) {
           console.error(`TMDB API Error (Liked Media ${media.id}):`, data.status_message);
           return [];
        }
        return (data.results || []).map((item: any) => ({ ...item, media_type: media.type, isBasedOnLikes: true }));
      });
      allPromises.push(...fetchPromises);
    }
    
    // DISCOVER FETCHES (if moods selected OR if nothing selected for wildcard)
    if (moods.length > 0 || likedMediaIds.length === 0) {
      const genreIds = new Set<number>();
      moods.forEach(mood => {
        if (MOOD_TO_TMDB_GENRE[mood]) MOOD_TO_TMDB_GENRE[mood].forEach(id => genreIds.add(id));
      });
      
      const genreParam = Array.from(genreIds).join('|');
      // Advanced Filters applied to Discover queries
      const commonParams = `&api_key=${TMDB_API_KEY}&include_adult=${includeAdult}&page=${page}&vote_average.gte=6.5&vote_count.gte=100${genreParam ? `&with_genres=${genreParam}` : ''}&sort_by=popularity.desc`;

      const handleFetch = async (url: string, type: string) => {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.success === false) {
            console.error(`TMDB API Error (${type}):`, data.status_message);
            return [];
          }
          return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
        } catch (e) {
          console.error(`TMDB Fetch Error (${type}):`, e);
          return [];
        }
      };
      
      if (mediaType === "movie" || mediaType === "all") {
        allPromises.push(handleFetch(`${BASE_URL}/discover/movie?with_runtime.lte=${timeLimit}${commonParams}`, "movie"));
      }
      if (mediaType === "tv" || mediaType === "all") {
        allPromises.push(handleFetch(`${BASE_URL}/discover/tv?with_runtime.lte=${timeLimit}${commonParams}`, "tv"));
      }
      if (mediaType === "anime") {
        allPromises.push(handleFetch(`${BASE_URL}/discover/tv?with_runtime.lte=${timeLimit}&page=${page}&api_key=${TMDB_API_KEY}&include_adult=${includeAdult}&vote_average.gte=6.5&vote_count.gte=50&with_genres=16&with_original_language=ja&sort_by=popularity.desc`, "tv"));
      }
    }

    const nestedResults = await Promise.all(allPromises);
    rawResults = nestedResults.flat();

    // Deduplicate by ID
    const uniqueMap = new Map();
    rawResults.forEach(item => {
      if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
    });
    rawResults = Array.from(uniqueMap.values());

    // Sort by rating to surface highest quality first, filter out watched
    rawResults = rawResults
      .filter((item: any) => !watchedHistoryIds.includes(item.id))
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    return rawResults
      .slice(0, 12)
      .map((item: any): MediaCardProps => ({
        id: item.id,
        title: item.title || item.name,
        imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
        rating: item.vote_average,
        type: item.media_type || "movie",
        shape: Math.random() > 0.6 ? "asymmetric" : (Math.random() > 0.5 ? "pill" : "default"),
      }));
  } catch (error) {
    console.error("Failed to fetch TMDB recommendations", error);
    return [];
  }
}

export async function fetchMediaDetails(id: number, type: "movie" | "tv" = "movie"): Promise<any> {
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") return null;
  
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,watch/providers`);
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch TMDB details", e);
    return null;
  }
}

export async function searchMedia(query: string, includeAdult: boolean = false): Promise<MediaCardProps[]> {
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") {
    return [];
  }

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=${includeAdult}&language=en-US&page=1`);
    const data = await res.json();
    
    if (!data.results) return [];

    return data.results
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any): MediaCardProps => ({
        id: item.id,
        title: item.title || item.name,
        imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
        rating: item.vote_average,
        type: item.media_type as "movie" | "tv",
        shape: Math.random() > 0.6 ? "pill" : "default",
      }));
  } catch (error) {
    console.error("Failed to search media:", error);
    return [];
  }
}
