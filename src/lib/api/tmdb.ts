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
  { id: 1, title: "Inception", rating: 8.8, imageUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", type: "movie", shape: "default" },
  { id: 2, title: "Stranger Things", rating: 8.6, imageUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8OSqEpIG0.jpg", type: "tv", shape: "pill" },
  { id: 3, title: "The Matrix", rating: 8.7, imageUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", type: "movie", shape: "asymmetric" },
  { id: 4, title: "Interstellar", rating: 8.6, imageUrl: "https://image.tmdb.org/t/p/w500/gEU2QlsEOWpNATscjpbCUf3aX9C.jpg", type: "movie", shape: "default" },
  { id: 5, title: "Breaking Bad", rating: 9.5, imageUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizwpB2.jpg", type: "tv", shape: "asymmetric" },
  { id: 6, title: "The Dark Knight", rating: 9.0, imageUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", type: "movie", shape: "pill" },
  { id: 7, title: "Pulp Fiction", rating: 8.9, imageUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", type: "movie", shape: "default" },
  { id: 8, title: "The Office", rating: 8.9, imageUrl: "https://image.tmdb.org/t/p/w500/qWnJzyZwidYfSEgjnZ5s81nSNyC.jpg", type: "tv", shape: "pill" },
  { id: 9, title: "Spider-Man: Into the Spider-Verse", rating: 8.4, imageUrl: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", type: "movie", shape: "asymmetric" },
  { id: 10, title: "Game of Thrones", rating: 9.3, imageUrl: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", type: "tv", shape: "default" },
  { id: 11, title: "Everything Everywhere All at Once", rating: 8.0, imageUrl: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg", type: "movie", shape: "pill" },
  { id: 12, title: "The Last of Us", rating: 8.7, imageUrl: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", type: "tv", shape: "asymmetric" },
];

export async function fetchRecommendations(
  timeLimit: number, 
  moods: string[], 
  watchedHistoryIds: number[] = []
): Promise<MediaCardProps[]> {
  
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") {
    // Return expanded mock data if no key is present, filtering out watched items
    return MOCK_DATA
      .filter(item => !watchedHistoryIds.includes(item.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
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
  if (!TMDB_API_KEY || TMDB_API_KEY === "your_key_here") {
    // Find the mock item
    const item = MOCK_DATA.find((m) => m.id === id);
    if (!item) return null;
    
    // Return mock rich details
    return {
      overview: `This is a beautifully rendered mock description for ${item.title}. Since the TMDB API is not connected, we are using this placeholder synopsis. Imagine an epic adventure full of twists, turns, and emotional depth!`,
      credits: {
        cast: [
          { name: "Famous Actor 1" },
          { name: "Famous Actor 2" },
          { name: "Supporting Role" }
        ]
      }
    };
  }
  
  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,watch/providers`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to fetch TMDB details", e);
    return null;
  }
}
