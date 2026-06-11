# Setup Documentation

## Prerequisites
- Node.js (v20+)
- MongoDB instance (local or Atlas)

## Installation
1. Clone the repository.
2. Run `npm install` to install dependencies.

## Environment Variables
Create a `.env.local` file in the root directory. You can use the provided `.env.dev` as a template.

Required variables typically include:
- `MONGODB_URI`: Connection string for your MongoDB database.
- `AUTH_SECRET`: Secret key for NextAuth.js (generate using `npx auth secret` or `openssl rand -base64 32`).
- `GEMINI_API_KEY`: API key for Google's Gemini SDK, used to generate AI-driven media recommendations. You can get one from [Google AI Studio](https://aistudio.google.com/).

## Database Seeding
To populate the database with initial mock data (if applicable), you can run the seed script:
```bash
node seed.js
```
Make sure your `MONGODB_URI` is correctly set in your environment before running the seed script.

## Running the App
Start the development server:
```bash
npm run dev
```

## Available Scripts
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
