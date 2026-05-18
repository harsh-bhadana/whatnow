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

const MOCK_DATA: MediaCardProps[] = [
  { id: 1, title: "Inception", rating: 8.8, imageUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", type: "movie", shape: "default" },
  { id: 2, title: "Stranger Things", rating: 8.6, imageUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8OSqEpIG0.jpg", type: "tv", shape: "pill" },
  { id: 3, title: "The Matrix", rating: 8.7, imageUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", type: "movie", shape: "asymmetric" },
  { id: 4, title: "Interstellar", rating: 8.6, imageUrl: "https://image.tmdb.org/t/p/w500/gEU2QlsEOWpNATscjpbCUf3aX9C.jpg", type: "movie", shape: "default" },
  { id: 5, title: "Breaking Bad", rating: 9.5, imageUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizwpB2.jpg", type: "tv", shape: "asymmetric" },
  { id: 6, title: "The Dark Knight", rating: 9.0, imageUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", type: "movie", shape: "pill" },
  { id: 7, title: "Pulp Fiction", rating: 8.9, imageUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", type: "movie", shape: "default" },
  { id: 8, title: "The Office", rating: 8.9, imageUrl: "https://image.tmdb.org/t/p/w500/qWnJzyZwidYfSEgjnZ5s81nSNyC.jpg", type: "tv", shape: "pill" },
];

export async function fetchRecommendations(
  timeLimit: number, 
  moods: string[], 
  watchedHistoryIds: number[] = [],
  mediaType: "all" | "movie" | "tv" | "anime" = "all",
  likedMediaIds: { id: number, type: "movie" | "tv" }[] = []
): Promise<MediaCardProps[]> {
  
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") {
    return MOCK_DATA
      .filter(item => !watchedHistoryIds.includes(item.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
  }

  try {
    let rawResults: any[] = [];
    
    // IF LIKED MEDIA PROVIDED: Use TMDB's /recommendations endpoint
    if (likedMediaIds.length > 0) {
      const fetchPromises = likedMediaIds.map(async (media) => {
        const res = await fetch(`${BASE_URL}/${media.type}/${media.id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
        const data = await res.json();
        if (data.success === false) {
           console.error(`TMDB API Error (Liked Media ${media.id}):`, data.status_message);
           return MOCK_DATA
             .filter(item => !watchedHistoryIds.includes(item.id))
             .map(item => ({ ...item, media_type: item.type }));
        }
        return (data.results || []).map((item: any) => ({ ...item, media_type: media.type }));
      });
      
      const nestedResults = await Promise.all(fetchPromises);
      rawResults = nestedResults.flat();
      
    } else {
      // OTHERWISE: Use /discover based on moods and media type
      const genreIds = new Set<number>();
      moods.forEach(mood => {
        if (MOOD_TO_TMDB_GENRE[mood]) MOOD_TO_TMDB_GENRE[mood].forEach(id => genreIds.add(id));
      });
      
      const genreParam = Array.from(genreIds).join('|');
      // Advanced Filters applied to Discover queries
      const commonParams = `&api_key=${TMDB_API_KEY}&include_adult=false&vote_average.gte=6.5&vote_count.gte=100&with_genres=${genreParam}&sort_by=popularity.desc`;

      const queries = [];
      
      const handleFetch = async (url: string, type: string) => {
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.success === false) {
            console.error(`TMDB API Error (${type}):`, data.status_message);
            // Fallback to mock data if API key is invalid or request fails
            return MOCK_DATA
              .filter(item => item.type === type || type === "all")
              .filter(item => !watchedHistoryIds.includes(item.id))
              .map(item => ({ ...item, media_type: item.type }));
          }
          return (data.results || []).map((item: any) => ({ ...item, media_type: type }));
        } catch (e) {
          console.error(`TMDB Fetch Error (${type}):`, e);
          return [];
        }
      };
      
      if (mediaType === "movie" || mediaType === "all") {
        queries.push(handleFetch(`${BASE_URL}/discover/movie?with_runtime.lte=${timeLimit}${commonParams}`, "movie"));
      }
      
      if (mediaType === "tv" || mediaType === "all") {
        queries.push(handleFetch(`${BASE_URL}/discover/tv?with_runtime.lte=${timeLimit}${commonParams}`, "tv"));
      }
      
      if (mediaType === "anime") {
        queries.push(handleFetch(`${BASE_URL}/discover/tv?with_runtime.lte=${timeLimit}&api_key=${TMDB_API_KEY}&include_adult=false&vote_average.gte=6.5&vote_count.gte=50&with_genres=16&with_original_language=ja&sort_by=popularity.desc`, "tv"));
      }

      const nestedResults = await Promise.all(queries);
      rawResults = nestedResults.flat();
    }

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
