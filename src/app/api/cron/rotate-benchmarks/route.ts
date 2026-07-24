import { NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import clientPromise from '@/lib/mongodb';

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export async function GET(request: Request) {
  try {
    // Optional: Verify Vercel Cron Secret in production
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!ai) {
      return new NextResponse('Gemini API key missing', { status: 500 });
    }

    const prompt = `
You are a master film and TV curator.
Generate a diverse list of 15 globally recognized, highly polarizing, or foundational movies and 5 highly foundational TV shows that are excellent for gauging a user's taste preferences.
Include a mix of genres (Sci-Fi, Romance, Action, Drama, Anime) and eras.

For each item, provide:
1. 'id': The correct TMDB (The Movie Database) integer ID.
2. 'type': Either "movie" or "tv".

IMPORTANT: You MUST provide accurate TMDB IDs.
EXAMPLES of good benchmarks: 
- Movies: Inception (27205), The Godfather (238), Spirited Away (129), Parasite (496243).
- TV Shows: Breaking Bad (1396), Game of Thrones (1399), The Office (2316).

Output a JSON array of objects.
`;

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          type: { type: Type.STRING },
        },
        required: ["id", "type"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    const benchmarks = JSON.parse(response.text);

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db("whatNow");
    const collection = db.collection("benchmark_sets");

    // Clear old benchmarks and insert the new array as a single document
    await collection.deleteMany({});
    await collection.insertOne({
      createdAt: new Date(),
      items: benchmarks
    });

    return NextResponse.json({ success: true, count: benchmarks.length });
  } catch (error: unknown) {
    console.error("Cron failed:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return new NextResponse('Internal Server Error: ' + msg, { status: 500 });
  }
}
