/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { discoverMediaFromParams, TMDBDiscoverParams } from "./tmdb";
import { MediaCardProps } from "@/components/ui/MediaCard";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

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
): Promise<Array<MediaCardProps & { reason: string }>> {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not set — skipping AI recommendations.");
    return [];
  }

  const { moods, availableTime, mediaType, watchHistory, likedTitles, includeAdult } = context;

  // STEP 1: Intent Parsing to TMDB Params
  const intentPrompt = `
You are an expert media recommendation engine. Convert the user's request into TMDB discovery parameters.
User is in the mood for: ${moods.length > 0 ? moods.join(" + ") : "anything"}.
Time available: ${availableTime} minutes.
Media Type: ${mediaType}

Provide TMDB params. Use your knowledge of TMDB genres (e.g. Action=28, Comedy=35, Sci-Fi=878) to set 'with_genres'. 
If they want a specific vibe, you can provide 'with_keywords' (pipe | separated TMDB keyword IDs or short descriptive words).
You can set 'vote_average.gte' if they want high quality.
`;

  const tmdbSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      with_genres: { type: Type.STRING, description: "Pipe (|) separated TMDB genre IDs." },
      with_keywords: { type: Type.STRING, description: "Pipe (|) separated TMDB keyword IDs or short words." },
      "primary_release_date.gte": { type: Type.STRING, description: "YYYY-MM-DD" },
      "primary_release_date.lte": { type: Type.STRING, description: "YYYY-MM-DD" },
      "vote_average.gte": { type: Type.NUMBER, description: "Minimum rating 0-10" },
      with_runtime_lte: { type: Type.NUMBER, description: "Max runtime in minutes" }
    },
  };

  let tmdbParams: TMDBDiscoverParams = { mediaType, with_runtime_lte: availableTime };

  try {
    const intentResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: intentPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tmdbSchema,
      },
    });

    if (intentResponse.text) {
      const parsed = JSON.parse(intentResponse.text);
      tmdbParams = { ...tmdbParams, ...parsed, mediaType };
    }
  } catch (e) {
    console.error("Intent parsing failed, falling back to defaults.", e);
  }

  // STEP 2: TMDB Discovery
  const candidates = await discoverMediaFromParams(tmdbParams, includeAdult);
  
  if (candidates.length === 0) return [];

  // Filter out watch history
  const historyIds = watchHistory.map(w => w.title.toLowerCase());
  const validCandidates = candidates.filter(c => !historyIds.includes(c.title.toLowerCase())).slice(0, 15);

  if (validCandidates.length === 0) return [];

  // STEP 3: AI Re-ranking & Insights
  const candidatesJson = validCandidates.map(c => ({
    id: c.id,
    title: c.title,
    overview: c.overview,
    type: c.type
  }));

  const insightPrompt = `
You are an expert movie/TV recommender.
The user is in the mood for: ${moods.length > 0 ? moods.join(" + ") : "anything"}.
They liked: ${likedTitles.length > 0 ? likedTitles.join(", ") : "nothing specific yet"}.
Here are ${validCandidates.length} candidates from TMDB:
${JSON.stringify(candidatesJson, null, 2)}

For each candidate, provide a personalized 1-2 sentence reason ("Why you'll like this") explaining why it fits their current mood and past likes.
Output a JSON array of objects with 'id' (number) and 'reason' (string).
`;

  const insightSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        reason: { type: Type.STRING },
      },
      required: ["id", "reason"]
    }
  };

  try {
    const insightResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: insightPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema,
      },
    });

    if (insightResponse.text) {
      const insights = JSON.parse(insightResponse.text);
      const insightMap = new Map<number, string>();
      insights.forEach((i: any) => insightMap.set(i.id, i.reason));

      return validCandidates.map(c => ({
        ...c,
        reason: insightMap.get(c.id) || "It perfectly matches your current mood!"
      }));
    }
  } catch (e) {
    console.error("Insight generation failed", e);
  }

  return validCandidates.map(c => ({ ...c, reason: "A great match based on your preferences." }));
}

export async function resolveWithTMDB(aiRecs: any[]): Promise<any[]> {
    return aiRecs;
}
