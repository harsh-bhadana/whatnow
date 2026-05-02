import { MediaCardProps } from "@/components/ui/MediaCard";

const ANILIST_URL = "https://graphql.anilist.co";

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

export async function fetchAnimeRecommendations(timeLimit: number, moods: string[]): Promise<MediaCardProps[]> {
  try {
    // Basic query for popular anime
    const query = `
      query ($perPage: Int) {
        Page (page: 1, perPage: $perPage) {
          media (type: ANIME, sort: POPULARITY_DESC) {
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

    const variables = {
      perPage: 10
    };

    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const data = await res.json();
    
    if (!data?.data?.Page?.media) {
      return MOCK_ANIME_DATA.filter(item => (item.runtime || 0) <= timeLimit);
    }

    return data.data.Page.media
      .filter((anime: any) => anime.duration <= timeLimit)
      .map((anime: any): MediaCardProps => ({
        id: anime.id,
        title: anime.title.english || anime.title.romaji,
        imageUrl: anime.coverImage.large,
        rating: (anime.averageScore || 0) / 10, // Normalize to 10
        type: "anime",
        runtime: anime.duration,
        shape: Math.random() > 0.6 ? "pill" : "default",
      }));

  } catch (error) {
    console.error("Failed to fetch AniList recommendations", error);
    return MOCK_ANIME_DATA.filter(item => (item.runtime || 0) <= timeLimit);
  }
}
