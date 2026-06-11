/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MediaCardProps } from "@/components/media/MediaCard";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export async function generateInsights(
  candidates: MediaCardProps[],
  moods: string[],
  likedTitles: string[]
): Promise<Array<MediaCardProps>> {
  if (!ai || candidates.length === 0) {
    return candidates.map(c => ({ ...c, reason: "A great match based on your preferences." }));
  }

  // We only want to generate insights for the top 15 to save tokens
  const candidatesToEnrich = candidates.slice(0, 15);
  const remainingCandidates = candidates.slice(15);

  const candidatesJson = candidatesToEnrich.map(c => ({
    id: c.id,
    title: c.title,
    type: c.type
  }));

  const insightPrompt = `
You are an expert movie/TV recommender.
The user is in the mood for: ${moods.length > 0 ? moods.join(" + ") : "anything"}.
They liked: ${likedTitles.length > 0 ? likedTitles.join(", ") : "nothing specific yet"}.
Here are ${candidatesToEnrich.length} candidates from TMDB:
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
      model: "gemini-2.0-flash",
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

      const enrichedTop = candidatesToEnrich.map(c => ({
        ...c,
        reason: insightMap.get(c.id) || "It perfectly matches your current mood!"
      }));
      
      const enrichedRemaining = remainingCandidates.map(c => ({
        ...c,
        reason: "A great match based on your preferences."
      }));

      return [...enrichedTop, ...enrichedRemaining];
    }
  } catch (e) {
    console.error("Insight generation failed", e);
  }

  return candidates.map(c => ({ ...c, reason: "A great match based on your preferences." }));
}
