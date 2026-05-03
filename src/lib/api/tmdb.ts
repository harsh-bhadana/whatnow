import { MediaCardProps } from "@/components/ui/MediaCard";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
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

// Mock data fallback if API key is not present
const MOCK_DATA: MediaCardProps[] = [
  {
    id: 1,
    title: "Inception",
    imageUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    rating: 8.8,
    type: "movie",
    runtime: 148,
    shape: "default",
  },
  {
    id: 2,
    title: "Breaking Bad",
    imageUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    rating: 9.5,
    type: "tv",
    runtime: 45,
    shape: "pill",
  },
  {
    id: 3,
    title: "Everything Everywhere All at Once",
    imageUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    rating: 8.0,
    type: "movie",
    runtime: 139,
    shape: "asymmetric",
  }
];

export async function fetchRecommendations(
  timeLimit: number, 
  moods: string[], 
  watchedHistoryIds: number[] = []
): Promise<MediaCardProps[]> {
  
  if (!TMDB_API_KEY) {
    console.warn("TMDB API key is missing. Returning mock data.");
    return MOCK_DATA.filter(item => 
      (item.runtime || 0) <= timeLimit && !watchedHistoryIds.includes(item.id)
    );
  }

  try {
    // Collect all unique genre IDs based on selected moods
    const genreIds = new Set<number>();
    moods.forEach(mood => {
      if (MOOD_TO_TMDB_GENRE[mood]) {
        MOOD_TO_TMDB_GENRE[mood].forEach(id => genreIds.add(id));
      }
    });
    
    const genreParam = Array.from(genreIds).join('|'); // OR logic for genres

    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_runtime.lte=${timeLimit}&with_genres=${genreParam}&sort_by=popularity.desc`
    );
    const data = await res.json();

    if (!data.results) return [];

    return data.results
      .filter((item: any) => !watchedHistoryIds.includes(item.id)) // Exclude watched
      .slice(0, 10) // Limit to top 10 from TMDB
      .map((item: any): MediaCardProps => ({
        id: item.id,
        title: item.title || item.name,
        imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
        rating: item.vote_average,
        type: "movie",
        shape: Math.random() > 0.6 ? "asymmetric" : (Math.random() > 0.5 ? "pill" : "default"),
      }));
  } catch (error) {
    console.error("Failed to fetch TMDB recommendations", error);
    return [];
  }
}

export async function fetchMediaDetails(id: number, type: "movie" | "tv" = "movie"): Promise<any> {
  if (!TMDB_API_KEY) return null;
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to fetch TMDB details", e);
    return null;
  }
}
