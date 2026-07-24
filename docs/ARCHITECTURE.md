# System Architecture

## Overview
WhatNow is a personalized content recommendation platform built on a modern serverless stack utilizing Next.js App Router for full-stack React capabilities.

## High-Level Architecture

### Frontend (Client)
- **Framework**: Next.js (React 19)
- **State Management**: Zustand is used for ephemeral UI state (e.g., active mood selections, discover UI states). Data-heavy pages like History and Watchlist are rendered via Server Components and do not rely on global client state.
- **Styling & UI**: Tailwind CSS for responsive utility-first styling. Framer Motion for fluid animations and micro-interactions.
- **Routing**: Next-View-Transitions for seamless page transitions.

### Backend (Server)
- **Framework**: Next.js Server Components and API Routes (Route Handlers).
- **Authentication**: NextAuth.js (v5 beta) handling session management.
- **AI Integration**: `@google/genai` (Gemini SDK) used in Server Actions to process user context and deliver personalized recommendations. Features an optimized **2-Step Hybrid Pipeline** that hits TMDB deterministically and MongoDB for collaborative filtering first, then enriches results with Gemini to minimize latency and token usage.
- **Data Validation**: Zod for schema validation on API inputs and environment variables.

### Database Layer
- **Database**: MongoDB (via `mongodb` driver and `@auth/mongodb-adapter`).
- **Data Models**: Users, Sessions, Accounts (NextAuth default). The `users` collection also directly embeds all user-specific app data such as `watchHistory` and `watchlist`, enforcing a strict single-user paradigm.

## Data Flow
1. **User Request**: Client navigates to a route or triggers an action.
2. **Next.js Server**: Server Components fetch initial data directly from MongoDB (e.g., retrieving watch history on the server to prevent layout shift).
3. **Client Hydration**: React components render interactively on the client. Ephemeral UI states are managed by Zustand.
4. **AI Recommendation Pipeline**:
   - **Step 1 (Deterministic Fetch & Collaboration)**: Client requests recommendations based on moods. The Next.js Server Action (`getAIRecommendations`) maps these deterministically and fetches validated candidates from the TMDB API. Concurrently, it queries MongoDB to find items liked by users with similar taste (`getCollaborativeRecommendations`).
   - **Step 2 (AI Enrichment)**: The pool of ~40 unique candidates is passed to the Gemini 2.0 Flash model. The AI cross-references the candidates against the user's specific watch history, implicit signals (clicks), and explicit liked/disliked items to generate hyper-personalized "Why you'll like this" insights, which are then streamed/returned to the client.
5. **Dynamic UI Updates**: Actions like liking or disliking cards instantly update MongoDB and the global state, swapping out disliked cards with fresh candidates from the pre-fetched pool without full page reloads.
6. **API Actions**: Client-side interactions trigger Server Actions or API routes, which validate inputs using Zod, interact with MongoDB, and return results.

## Folder Structure
- `src/app/`: Next.js App Router pages, layouts, and API routes.
- `src/components/`: Reusable React components (UI elements, forms, layouts).
- `src/lib/`: Utility functions, database connections, NextAuth configuration.
- `public/`: Static assets like images and icons.
- `docs/`: Project documentation.
