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
    return candidates.map(c => ({ ...c, reason: c.overview }));
  }

  const candidatesJson = candidates.map(c => ({
    id: c.id,
    title: c.title,
    type: c.type,
    genres: (c.genreIds || []).map(id => TMDB_GENRE_MAP[id]).filter(Boolean),
    synopsis: (c.overview || "").slice(0, 150)
  }));

  const insightPrompt = `
You are a ruthless, opinionated film curator with encyclopedic knowledge. Your job is NOT to describe movies — it's to decide if THIS SPECIFIC USER will love them.

═══ USER PROFILE ═══
Mood right now: ${moods.length > 0 ? moods.join(" + ") : "open to anything"}
Media type: ${mediaType === "all" ? "Movies and TV" : mediaType.toUpperCase()}
Titles they LOVED: ${likedTitles.length > 0 ? likedTitles.join(", ") : "No history yet — score based on mood fit only"}
Titles they HATED: ${dislikedTitles.length > 0 ? dislikedTitles.join(", ") : "No dislikes recorded"}

═══ SCORING RUBRIC (follow exactly) ═══
9-10: "Drop everything and watch this" — mood + taste DNA align perfectly. Shares director, writer, thematic depth, tone, or visual style with a liked title.
7-8:  Strong match — clear connection to liked titles or deeply resonates with the mood. Would confidently recommend to this user.
5-6:  Decent but generic — mood fits loosely, but no strong taste connection. A "fine" pick, not an exciting one.
3-4:  Weak — some surface-level mood alignment, but conflicts with user taste or is tonally wrong.
1-2:  Actively bad for this user — similar to a disliked title, wrong mood entirely, or low quality.

═══ MANDATORY RULES ═══
1. Score (1-10) based on how well it fits the User History AND current Moods. You MUST give at least 30% of candidates a score ≤ 4. Not everything is good for this user.
2. If a candidate shares franchise, director, writer, or theme with a DISLIKED title → score ≤ 3, no exceptions.
3. If a candidate shares franchise, director, writer, or theme with a LIKED title → score ≥ 7.
4. Instead of a long reason, provide a "cleverTag". STRICT MAXIMUM OF 5 WORDS. NO SENTENCES.
   EXAMPLES: "For Marvel Fans", "Mind-bending Sci-Fi", "The Nun Returns".
   If you cannot think of a punchy 2-5 word tag, return an empty string "".
5. For users with NO history, score purely on mood alignment and critical quality. Be honest about generic blockbusters.

═══ CANDIDATES (${candidates.length} items) ═══
${JSON.stringify(candidatesJson, null, 2)}

Output a JSON array of objects with 'id' (number), 'score' (number), and 'cleverTag' (string) for every candidate.
`;

  const insightSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        score: { type: Type.INTEGER },
        cleverTag: { type: Type.STRING },
      },
      required: ["id", "score", "cleverTag"]
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
      const insightMap = new Map<number, {score: number, cleverTag: string}>();
      insights.forEach((i: any) => insightMap.set(i.id, { score: i.score, cleverTag: i.cleverTag }));

      const enriched = candidates
        .map(c => {
          const insight = insightMap.get(c.id);
          
          // Enforce 5-word limit by truncating instead of discarding
          let tag = insight?.cleverTag || "";
          const words = tag.split(" ");
          if (words.length > 5) {
            tag = words.slice(0, 5).join(" ") + "...";
          }

          return {
            ...c,
            score: insight?.score ?? 5,
            reason: tag
          };
        })
        .filter((c: any) => c.score >= 5)
        .sort((a: any, b: any) => b.score - a.score);

      return enriched.map((c: any) => {
        const { score, ...rest } = c;
        return {
          ...rest,
          matchScore: score,
        } as MediaCardProps;
      });
    }
  } catch (e) {
    console.error("Insight generation failed", e);
  }

  return candidates.map(c => ({ ...c, reason: "" }));
}

export async function generateInsights(
  candidates: MediaCardProps[],
  moods: string[],
  likedTitles: string[],
  mediaType: "all" | "movie" | "tv" | "anime" = "all"
): Promise<Array<MediaCardProps>> {
  const scored = await scoreAndRank(candidates, moods, likedTitles, [], mediaType);
  return scored.slice(0, 12);
}

