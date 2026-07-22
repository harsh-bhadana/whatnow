/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MediaCardProps } from "@/components/media/MediaCard";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

import { TMDB_GENRE_MAP } from "@/lib/constants";

export async function scoreAndRank(
  candidates: MediaCardProps[],
  moods: string[],
  likedTitles: string[],
  dislikedTitles: string[],
  mediaType: "all" | "movie" | "tv" | "anime"
): Promise<Array<MediaCardProps>> {
  if (!ai || candidates.length === 0) {
    return candidates.slice(0, 12).map(c => ({ ...c, reason: "A great match based on your preferences." }));
  }

  const candidatesJson = candidates.map(c => ({
    id: c.id,
    title: c.title,
    type: c.type,
    genres: (c.genreIds || []).map(id => TMDB_GENRE_MAP[id]).filter(Boolean)
  }));

  const insightPrompt = `
You are an expert ${mediaType === "all" ? "movie/TV" : mediaType} recommender.
Media Type Selected by User: ${mediaType.toUpperCase()}.
The user is in the mood for: ${moods.length > 0 ? moods.join(" + ") : "anything"}.
They liked: ${likedTitles.length > 0 ? likedTitles.join(", ") : "nothing specific yet"}.
They disliked: ${dislikedTitles.length > 0 ? dislikedTitles.join(", ") : "nothing specific yet"}.
Here are ${candidates.length} candidates from TMDB:
${JSON.stringify(candidatesJson, null, 2)}

For each candidate, provide a relevance score from 1-10 and a personalized 1-2 sentence reason ("Why you'll like this") explaining why it fits their current mood, media preference, and past likes.
Penalize titles similar to disliked items.
Boost titles sharing DNA with liked items (beyond genre).
Cross-reference mood selection.
Be bold about low scores.

Output a JSON array of objects with 'id' (number), 'score' (number), and 'reason' (string).
`;

  const insightSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        score: { type: Type.INTEGER },
        reason: { type: Type.STRING },
      },
      required: ["id", "score", "reason"]
    }
  };

  try {
    const insightResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: insightPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema,
      },
    });

    if (insightResponse.text) {
      const insights = JSON.parse(insightResponse.text);
      const insightMap = new Map<number, {score: number, reason: string}>();
      insights.forEach((i: any) => insightMap.set(i.id, { score: i.score, reason: i.reason }));

      const enriched = candidates
        .map(c => {
          const insight = insightMap.get(c.id);
          return {
            ...c,
            score: insight?.score ?? 5,
            reason: insight?.reason || "It perfectly matches your current mood!"
          };
        })
        .filter((c: any) => c.score >= 5)
        .sort((a: any, b: any) => b.score - a.score);

      return enriched.slice(0, 12).map((c: any) => {
        const { score, ...rest } = c;
        return rest as MediaCardProps;
      });
    }
  } catch (e) {
    console.error("Insight generation failed", e);
  }

  return candidates.slice(0, 12).map(c => ({ ...c, reason: "A great match based on your preferences." }));
}

export async function generateInsights(
  candidates: MediaCardProps[],
  moods: string[],
  likedTitles: string[],
  mediaType: "all" | "movie" | "tv" | "anime" = "all"
): Promise<Array<MediaCardProps>> {
  return scoreAndRank(candidates, moods, likedTitles, [], mediaType);
}

