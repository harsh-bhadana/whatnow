# WhatNow - Content Recommendation App

WhatNow is a personalized content recommendation platform built with Next.js. It helps users discover new movies, TV shows, and anime tailored to their precise moods and available time. 

## Features
- **AI-Driven Recommendations:** Uses the Gemini 2.0 Flash model to generate hyper-personalized media recommendations, reranking items based on your unique watch history and current vibe.
- **Collaborative Filtering:** Queries a MongoDB aggregation pipeline to find users with similar taste, injecting what *they* liked into your discovery feed.
- **Implicit Signals:** Seamlessly builds your taste profile in the background—even just clicking a movie card records a fractional interest weight.
- **Dynamic Candidate Swapping:** Instantly removes disliked cards and replaces them with fresh candidates without page reloads, adjusting your taste on the fly.
- **Where to Watch Integration:** Powered by JustWatch, instantly tells you which streaming platforms, rental, or purchase options are available in your region.
- **Unified Experience:** Seamless single-user architecture where all your watch history and watchlists are securely synced with your account.
- **Server-Rendered Performance:** Key pages like History and Watchlist use Next.js Server Components for instant loading and zero layout shift.
- **Modern UI:** Built with Tailwind CSS and Framer Motion for a sleek, animated experience. Features dynamic neon badges for theatrical and new releases.
- **Authentication:** Secure user authentication using NextAuth.
- **Database:** MongoDB for robust data storage.

## Tech Stack
- [Next.js](https://nextjs.org/) (React framework, App Router)
- [Gemini SDK](https://ai.google.dev/) (AI recommendation engine)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)
- [Framer Motion](https://www.framer.com/motion/) (Animations)
- [MongoDB](https://www.mongodb.com/) (Database)
- [NextAuth.js](https://next-auth.js.org/) (Authentication)
- [Zustand](https://github.com/pmndrs/zustand) (Client UI State)

## AI Recommendation Architecture

WhatNow features a highly optimized **2-Step Hybrid AI Pipeline** designed for maximum speed and minimal rate-limit consumption. 

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Next.js Server
    participant TMDB as TMDB API
    participant DB as MongoDB
    participant Gemini as Gemini 2.0 Flash

    User->>NextJS: Submits Moods (e.g. "Epic")
    Note over NextJS: Deterministic Mapping & Taste Profile Extraction
    par Fetch Candidates
        NextJS->>TMDB: Fetch by Mood Genres (Top 2 Pages)
        NextJS->>DB: Collaborative Match (Users with similar taste)
    end
    TMDB-->>NextJS: Returns validated movies/shows (~40 unique candidates)
    NextJS->>Gemini: Send 40 candidates + User History (Likes/Dislikes)
    Note over Gemini: AI Reasoning & Personalization
    Gemini-->>NextJS: Returns top 12 scored candidates + "Why you'll like this" insights
    NextJS-->>User: Renders UI with media cards & AI insights
```

## Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation
For more detailed information, please refer to the `docs/` folder:
- [Architecture](docs/ARCHITECTURE.md)
- [Setup & Environment Variables](docs/SETUP.md)
