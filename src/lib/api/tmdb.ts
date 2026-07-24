/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { MediaCardProps } from "@/components/media/MediaCard";

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

import { MOOD_TO_TMDB_GENRE, MOOD_PRIMARY_GENRES, MOOD_TO_TMDB_KEYWORDS } from "@/lib/constants";
export async function fetchRecommendations(
  timeLimit: number, 
  moods: string[], 
  watchedHistoryIds: number[] = [],
  mediaType: "all" | "movie" | "tv" | "anime" = "all",
  likedMediaIds: { id: number, type: "movie" | "tv" | "anime", title?: string }[] = [],
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
        const fetchType = media.type === "anime" ? "tv" : media.type;
        const res = await fetch(`${BASE_URL}/${fetchType}/${media.id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
        const data = await res.json();
        if (data.success === false) {
           console.error(`TMDB API Error (Liked Media ${media.id}):`, data.status_message);
           return [];
        }
        return (data.results || []).map((item: any) => {
          let itemType: "movie" | "tv" | "anime" = fetchType;
          if ((item.genre_ids || []).includes(16) && (fetchType === "tv" || item.original_language === "ja")) {
            itemType = "anime";
          }
          return { ...item, media_type: itemType, isBasedOnLikes: true, basedOnLikeTitle: media.title };
        });
      });
      allPromises.push(...fetchPromises);
    }
    
    // DISCOVER FETCHES (if moods selected OR if nothing selected for wildcard)
    if (moods.length > 0 || likedMediaIds.length === 0) {
      const primaryGenreIds = new Set<number>();
      const allGenreIds = new Set<number>();

      moods.forEach(mood => {
        if (MOOD_PRIMARY_GENRES[mood]) MOOD_PRIMARY_GENRES[mood].forEach(id => primaryGenreIds.add(id));
        if (MOOD_TO_TMDB_GENRE[mood]) MOOD_TO_TMDB_GENRE[mood].forEach(id => allGenreIds.add(id));
      });
      
      const strictGenreParam = Array.from(primaryGenreIds).join(','); // AND logic for primary genres
      const looseGenreParam = Array.from(allGenreIds).join('|');    // OR logic for all mood genres

      // Collect keyword IDs for thematic precision
      const keywordIds = new Set<number>();
      moods.forEach(mood => {
        if (MOOD_TO_TMDB_KEYWORDS[mood]) MOOD_TO_TMDB_KEYWORDS[mood].forEach(id => keywordIds.add(id));
      });
      const keywordParam = Array.from(keywordIds).join('|');

      const handleFetch = async (url: string, type: "movie" | "tv" | "anime") => {
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
      
      const pagesToFetch = [page, page + 1];
      pagesToFetch.forEach(p => {
        // High-precision strict fetch (primary genres)
        if (strictGenreParam) {
          const strictParams = `&api_key=${TMDB_API_KEY}&include_adult=${includeAdult}&page=${p}&vote_average.gte=6.5&vote_count.gte=100&with_genres=${strictGenreParam}&sort_by=popularity.desc`;
          if (mediaType === "movie" || mediaType === "all") {
            allPromises.push(handleFetch(`${BASE_URL}/discover/movie?with_runtime.lte=${timeLimit}${strictParams}`, "movie"));
          }
          if (mediaType === "tv" || mediaType === "all") {
            allPromises.push(handleFetch(`${BASE_URL}/discover/tv?${strictParams}`, "tv"));
          }
        }

        // High-variety loose fetch (all mood genres)
        const looseParams = `&api_key=${TMDB_API_KEY}&include_adult=${includeAdult}&page=${p}&vote_average.gte=6.5&vote_count.gte=100${looseGenreParam ? `&with_genres=${looseGenreParam}` : ''}&sort_by=popularity.desc`;
        if (mediaType === "movie" || mediaType === "all") {
          allPromises.push(handleFetch(`${BASE_URL}/discover/movie?with_runtime.lte=${timeLimit}${looseParams}`, "movie"));
        }
        if (mediaType === "tv" || mediaType === "all") {
          allPromises.push(handleFetch(`${BASE_URL}/discover/tv?${looseParams}`, "tv"));
        }
        if (mediaType === "anime") {
          allPromises.push(handleFetch(`${BASE_URL}/discover/tv?page=${p}&api_key=${TMDB_API_KEY}&include_adult=${includeAdult}&vote_average.gte=6.0&vote_count.gte=20&with_genres=16&with_original_language=ja&sort_by=popularity.desc`, "anime"));
        }

        // Keyword-targeted fetch (thematic precision, page 1 only)
        if (keywordParam && p === page) {
          const keywordParams = `&api_key=${TMDB_API_KEY}&include_adult=${includeAdult}&page=${p}&vote_average.gte=6.0&vote_count.gte=50&with_keywords=${keywordParam}&sort_by=vote_average.desc`;
          if (mediaType === "movie" || mediaType === "all") {
            allPromises.push(handleFetch(`${BASE_URL}/discover/movie?with_runtime.lte=${timeLimit}${keywordParams}`, "movie"));
          }
          if (mediaType === "tv" || mediaType === "all") {
            allPromises.push(handleFetch(`${BASE_URL}/discover/tv?${keywordParams}`, "tv"));
          }
        }
      });
    }

    const nestedResults = await Promise.all(allPromises);
    rawResults = nestedResults.flat();

    // Deduplicate by ID
    const uniqueMap = new Map();
    rawResults.forEach(item => {
      if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
    });
    rawResults = Array.from(uniqueMap.values());

    // Filter strictly by requested mediaType and remove watched items
    rawResults = rawResults
      .filter((item: any) => {
        if (watchedHistoryIds.includes(item.id)) return false;
        const itemType = item.media_type || "movie";
        if (mediaType === "movie") return itemType === "movie";
        if (mediaType === "tv") return itemType === "tv";
        if (mediaType === "anime") return itemType === "anime" || (itemType === "tv" && (item.genre_ids || []).includes(16));
        return true;
      })
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    return rawResults
      .slice(0, 40)
      .map((item: any): MediaCardProps => {
        const shapeMod = item.id % 3;
        const shape = shapeMod === 0 ? "asymmetric" : (shapeMod === 1 ? "pill" : "default");
        
        return {
          id: item.id,
          title: item.title || item.name,
          overview: item.overview || "",
          imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
          rating: item.vote_average,
          type: item.media_type || "movie",
          genreIds: item.genre_ids || [],
          shape,
          isBasedOnLikes: item.isBasedOnLikes,
          basedOnLikeTitle: item.basedOnLikeTitle,
        };
      });
  } catch (error) {
    console.error("Failed to fetch TMDB recommendations", error);
    return [];
  }
}

export async function fetchMediaDetails(id: number, type: "movie" | "tv" | "anime" = "movie"): Promise<any> {
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") return null;
  
  try {
    const fetchType = type === "anime" ? "tv" : type;
    const res = await fetch(`${BASE_URL}/${fetchType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,watch/providers`);
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
      .map((item: any): MediaCardProps => {
        let itemType: "movie" | "tv" | "anime" = item.media_type as "movie" | "tv";
        if (itemType === "tv" && (item.genre_ids || []).includes(16) && item.original_language === "ja") {
          itemType = "anime";
        }
        return {
          id: item.id,
          title: item.title || item.name,
          imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
          rating: item.vote_average,
          type: itemType,
          genreIds: item.genre_ids || [],
          shape: Math.random() > 0.6 ? "pill" : "default",
        };
      });
  } catch (error) {
    console.error("Failed to search media:", error);
    return [];
  }
}

export async function fetchTrendingMedia(
  mediaType: "all" | "movie" | "tv" | "anime" = "all",
  page: number = 1
): Promise<MediaCardProps[]> {
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") {
    return [];
  }

  try {
    let endpoint = `${BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`;
    if (mediaType === "movie") {
      endpoint = `${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`;
    } else if (mediaType === "tv") {
      endpoint = `${BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}&page=${page}&language=en-US`;
    } else if (mediaType === "anime") {
      endpoint = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&page=${page}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&vote_count.gte=50`;
    }

    const res = await fetch(endpoint);
    const data = await res.json();
    if (!data.results) return [];

    return data.results
      .filter((item: any) => item.poster_path && (item.title || item.name))
      .map((item: any): MediaCardProps => {
        let itemType: "movie" | "tv" | "anime" = (item.media_type || (mediaType === "movie" ? "movie" : "tv")) as "movie" | "tv";
        if (mediaType === "anime" || (itemType === "tv" && (item.genre_ids || []).includes(16) && item.original_language === "ja")) {
          itemType = "anime";
        }
        return {
          id: item.id,
          title: item.title || item.name,
          imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
          rating: item.vote_average || 0,
          type: itemType,
          genreIds: item.genre_ids || [],
          overview: item.overview || "",
        };
      });
  } catch (error) {
    console.error("Failed to fetch trending media:", error);
    return [];
  }
}

export async function fetchMediaDetailsBulk(
  mediaItems: { id: number, type: "movie" | "tv" | "anime" }[]
): Promise<MediaCardProps[]> {
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") {
    return [];
  }

  try {
    const fetchPromises = mediaItems.map(async (media) => {
      const fetchType = media.type === "anime" ? "tv" : media.type;
      const res = await fetch(`${BASE_URL}/${fetchType}/${media.id}?api_key=${TMDB_API_KEY}&language=en-US`);
      const data = await res.json();
      if (data.success === false) return null;
      data.media_type = media.type;
      return data;
    });

    const results = await Promise.all(fetchPromises);
    const validResults = results.filter(r => r !== null && (r.title || r.name));
    
    return validResults.map((item: any): MediaCardProps => {
      let itemType: "movie" | "tv" | "anime" = item.media_type as "movie" | "tv" | "anime";
      if (itemType === "tv" && (item.genres || []).some((g: any) => g.id === 16) && item.original_language === "ja") {
        itemType = "anime";
      }
      return {
        id: item.id,
        title: item.title || item.name,
        imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
        rating: item.vote_average || 0,
        type: itemType,
        genreIds: (item.genres || []).map((g: any) => g.id),
        overview: item.overview || "",
      };
    });
  } catch (error) {
    console.error("Failed to fetch bulk media details:", error);
    return [];
  }
}
