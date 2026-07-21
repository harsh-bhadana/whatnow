import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MONGODB_URI: z.string().url(),
    TMDB_API_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1).optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional(),
    NEXTAUTH_URL: z.string().url().optional(),
  },
  client: {},
  runtimeEnv: {
    MONGODB_URI: process.env.MONGODB_URI,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
});
