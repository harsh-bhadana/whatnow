/* eslint-disable @typescript-eslint/no-explicit-any */
import { MediaCardProps } from "@/components/ui/MediaCard";

const ANILIST_URL = "https://graphql.anilist.co";

// Mood to AniList Genre/Tag mapping
const MOOD_TO_ANILIST: Record<string, string[]> = {
  "Cozy": ["Slice of Life", "Iyashikei", "Comedy"],
  "Adrenaline": ["Action", "Thriller", "Mecha"],
  "Laughs": ["Comedy"],
  "Tears": ["Drama", "Tragedy"],
  "Thought-provoking": ["Psychological", "Sci-Fi", "Mystery"],
  "Spooky": ["Horror", "Thriller"],
  "Heartwarming": ["Romance", "Slice of Life"],
  "Epic": ["Fantasy", "Adventure"],
  "Mind-bending": ["Psychological", "Sci-Fi"],
  "Nostalgic": ["Slice of Life", "Comedy"]
};

const MOCK_ANIME_DATA: MediaCardProps[] = [
  {
    id: 101,
    title: "Attack on Titan",
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiMF.jpg",
    rating: 8.5,
    type: "anime",
    runtime: 24,
    shape: "asymmetric",
  },
  {
    id: 102,
    title: "Jujutsu Kaisen",
    imageUrl: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",
    rating: 8.6,
    type: "anime",
    runtime: 24,
    shape: "pill",
  },
];

export async function fetchAnimeRecommendations(
  timeLimit: number, 
  moods: string[], 
  watchedHistoryIds: number[] = [],
  includeAdult: boolean = false
): Promise<MediaCardProps[]> {
  
  try {
    // Collect unique genres based on moods
    const genres = new Set<string>();
    moods.forEach(mood => {
      if (MOOD_TO_ANILIST[mood]) {
        MOOD_TO_ANILIST[mood].forEach(g => genres.add(g));
      }
    });

    const genreFilter = genres.size > 0 ? `genre_in: [${Array.from(genres).map(g => `"${g}"`).join(',')}]` : "";

    const adultFilter = includeAdult ? "" : ", isAdult: false";
    const query = `
      query ($perPage: Int) {
        Page (page: 1, perPage: $perPage) {
          media (type: ANIME, sort: POPULARITY_DESC, ${genreFilter}${adultFilter}) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            averageScore
            duration
          }
        }
      }
    `;

    const variables = { perPage: 20 };

    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await res.json();
    
    if (!data?.data?.Page?.media) {
      return MOCK_ANIME_DATA.filter(item => 
        (item.runtime || 0) <= timeLimit && !watchedHistoryIds.includes(item.id)
      );
    }

    return data.data.Page.media
      .filter((anime: any) => anime.duration <= timeLimit && !watchedHistoryIds.includes(anime.id))
      .slice(0, 10)
      .map((anime: any): MediaCardProps => ({
        id: anime.id,
        title: anime.title.english || anime.title.romaji,
        imageUrl: anime.coverImage.large,
        rating: (anime.averageScore || 0) / 10,
        type: "anime",
        runtime: anime.duration,
        shape: Math.random() > 0.6 ? "pill" : "default",
      }));

  } catch (error) {
    console.error("Failed to fetch AniList recommendations", error);
    return MOCK_ANIME_DATA.filter(item => 
      (item.runtime || 0) <= timeLimit && !watchedHistoryIds.includes(item.id)
    );
  }
}
