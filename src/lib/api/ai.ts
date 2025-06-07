/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenAI } from "@google/genai";
import { searchMedia } from "./tmdb";
import { MediaCardProps } from "@/components/ui/MediaCard";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export interface AIRecommendation {
  title: string;
  year?: number;
  mediaType: "movie" | "tv" | "anime";
  reason: string;
}

interface RecommendationContext {
  moods: string[];
  availableTime: number;
  mediaType: "all" | "movie" | "tv" | "anime";
  watchHistory: Array<{ title: string; type: string; rating?: number }>;
  likedTitles: string[];
  includeAdult: boolean;
}

export async function getAIRecommendations(
  context: RecommendationContext
): Promise<AIRecommendation[]> {
  if (!ai) {
    console.warn(
      "GEMINI_API_KEY is not set — skipping AI recommendations."
    );
    return [];
  }

  const { moods, availableTime, mediaType, watchHistory, likedTitles, includeAdult } = context;

  const systemPrompt = [
    "You are an expert media recommendation engine with deep knowledge of movies, TV shows, and anime.",
    "You understand nuanced mood combinations — for example, 'Cozy + Mind-bending' means something intellectually stimulating yet comforting, like a warm sci-fi mystery.",
    "You balance popular crowd-pleasers with hidden gems that deserve more attention.",
    "You ALWAYS return valid JSON — an array of recommendation objects, nothing else.",
  ].join(" ");

  const watchHistoryBlock =
    watchHistory.length > 0
      ? `The user has already watched: ${watchHistory.map((w) => `"${w.title}" (${w.type}${w.rating ? `, rated ${w.rating}/10` : ""})`).join(", ")}. Do NOT recommend these titles. Use them to understand the user's taste and preferences.`
      : "The user has no watch history yet.";

  const likedBlock =
    likedTitles.length > 0
      ? `The user especially liked: ${likedTitles.map((t) => `"${t}"`).join(", ")}. Lean into what these titles have in common — tone, themes, pacing, storytelling style.`
      : "";

  const mediaTypeBlock =
    mediaType === "all"
      ? "Include a healthy mix of movies, TV shows, and anime."
      : `Only recommend ${mediaType === "tv" ? "TV shows" : mediaType === "anime" ? "anime" : "movies"}.`;

  const timeBlock =
    mediaType === "movie" || mediaType === "all"
      ? `For movies, prefer runtimes under ${availableTime} minutes.`
      : `For TV shows/anime, prefer episodes around ${availableTime} minutes or less.`;

  const adultBlock = includeAdult
    ? "Adult/mature content is acceptable."
    : "Keep recommendations family-friendly — no adult or explicit content.";

  const userPrompt = [
    `The user is in the mood for: ${moods.length > 0 ? moods.join(" + ") : "anything — surprise them"}.`,
    `They have ${availableTime} minutes available.`,
    mediaTypeBlock,
    timeBlock,
    watchHistoryBlock,
    likedBlock,
    adultBlock,
    "",
    "Return exactly 15 recommendations as a JSON array. Each object must have:",
    '  - "title": the exact title of the movie/show/anime',
    '  - "year": release year (number)',
    '  - "mediaType": one of "movie", "tv", or "anime"',
    '  - "reason": 1-2 sentences explaining why this fits, written in a personal and conversational tone',
    "",
    "Mix well-known titles with hidden gems. Order from strongest match to weakest.",
  ].join("\n");

  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      console.error("Gemini returned an empty response.");
      return [];
    }

    const parsed = JSON.parse(text);
    const recommendations: AIRecommendation[] = Array.isArray(parsed)
      ? parsed
      : parsed.recommendations ?? [];

    return recommendations;
  } catch (error) {
    console.error("Failed to get AI recommendations:", error);
    return [];
  }
}

export async function resolveWithTMDB(
  aiRecs: AIRecommendation[],
  includeAdult: boolean = false
): Promise<Array<MediaCardProps & { reason: string }>> {
  const results = await Promise.allSettled(
    aiRecs.map(async (rec) => {
      const searchResults = await searchMedia(
        rec.year ? `${rec.title} ${rec.year}` : rec.title,
        includeAdult
      );

      if (searchResults.length === 0) return null;

      // Pick the best match — first result is usually the most relevant
      const match = searchResults[0];

      return {
        ...match,
        type: rec.mediaType,
        reason: rec.reason,
      } as MediaCardProps & { reason: string };
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<MediaCardProps & { reason: string }> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value);
}
