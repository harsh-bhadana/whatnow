import { MediaCardProps } from "@/components/ui/MediaCard";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

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

export async function fetchRecommendations(timeLimit: number, moods: string[]): Promise<MediaCardProps[]> {
  if (!TMDB_API_KEY) {
    console.warn("TMDB API key is missing. Returning mock data.");
    // Filter mock data by time limit just to show logic
    return MOCK_DATA.filter(item => (item.runtime || 0) <= timeLimit);
  }

  try {
    // Basic example fetching popular movies
    // In a real scenario, we would map `moods` to TMDB genre IDs
    // and use the /discover/movie endpoint filtering by with_genres and with_runtime.lte
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_runtime.lte=${timeLimit}&sort_by=popularity.desc`
    );
    const data = await res.json();

    if (!data.results) return [];

    return data.results.map((item: any): MediaCardProps => ({
      id: item.id,
      title: item.title || item.name,
      imageUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : "",
      rating: item.vote_average,
      type: "movie",
      shape: Math.random() > 0.6 ? "asymmetric" : (Math.random() > 0.5 ? "pill" : "default"), // Randomize shapes for M3 look
      // TMDB discover doesn't return exact runtime in the list, would need a separate call per movie for exact runtime
      // but we filtered by it, so we can just omit it or fetch details later.
    }));
  } catch (error) {
    console.error("Failed to fetch TMDB recommendations", error);
    return [];
  }
}
