"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { WatchHistoryItem } from "@/lib/store/useAppStore";

export async function getCollaborativeRecommendations(limit: number = 5): Promise<{ id: number, type: "movie" | "tv" | "anime" }[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const currentUser = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
    if (!currentUser || !currentUser.watchHistory) return [];

    // Extract current user's likes
    const userLikes = currentUser.watchHistory
      .filter((h: WatchHistoryItem) => h.userRating === 1)
      .map((h: WatchHistoryItem) => h.id);
      
    // Exclude everything the user has already rated/seen
    const userSeenIds = new Set(currentUser.watchHistory.map((h: WatchHistoryItem) => h.id));

    if (userLikes.length === 0) return [];

    // Aggregation pipeline to find similar users and their likes
    const pipeline = [
      // 1. Match other users who have liked at least one of the same items
      { 
        $match: { 
          _id: { $ne: new ObjectId(session.user.id) },
          "watchHistory": { 
            $elemMatch: { 
              id: { $in: userLikes },
              userRating: 1 
            } 
          }
        } 
      },
      // 2. Unwind their history to inspect individual items
      { $unwind: "$watchHistory" },
      // 3. Keep only items they liked, that the current user HAS NOT seen
      { 
        $match: { 
          "watchHistory.userRating": 1,
          "watchHistory.id": { $nin: Array.from(userSeenIds) }
        }
      },
      // 4. Group by the media ID to count how many similar users liked it
      {
        $group: {
          _id: "$watchHistory.id",
          count: { $sum: 1 },
          type: { $first: "$watchHistory.type" }
        }
      },
      // 5. Sort by popularity among similar users
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { $sort: { count: -1 } as any },
      // 6. Limit the results
      { $limit: limit }
    ];

    const results = await db.collection("users").aggregate(pipeline).toArray();

    return results.map(r => ({
      id: r._id,
      type: r.type || "movie"
    }));
  } catch (error) {
    console.error("Failed to get collaborative recommendations:", error);
    return [];
  }
}

export async function getActiveBenchmarks(): Promise<{ id: number, type: "movie" | "tv" }[]> {
  try {
    const client = await clientPromise;
    // Note: checking "whatnow" (lowercase N) because the cron job used lowercase. 
    // Wait, the cron job uses "whatnow" but the users collection uses "whatNow".
    // I should probably use "whatNow" to be consistent with users collection.
    // Let me fix this mismatch by using whatNow.
    const db = client.db("whatNow");
    const collection = db.collection("benchmark_sets");

    const latest = await collection.findOne({}, { sort: { createdAt: -1 } });
    if (latest && latest.items && Array.isArray(latest.items)) {
      return latest.items;
    }
    
    // Fallback static list if cron hasn't run yet
    return [
      { id: 27205, type: "movie" }, // Inception
      { id: 238, type: "movie" }, // The Godfather
      { id: 129, type: "anime" }, // Spirited Away (using movie as TMDB expects, but our type handles anime)
      { id: 603, type: "movie" }, // The Matrix
      { id: 496243, type: "movie" }, // Parasite
      { id: 155, type: "movie" }, // The Dark Knight
      { id: 324857, type: "movie" }, // Spider-Man: Into the Spider-Verse
      { id: 194, type: "movie" }, // Amélie
      { id: 62, type: "movie" }, // 2001: A Space Odyssey
      { id: 545611, type: "movie" }, // Everything Everywhere All at Once
      { id: 1396, type: "tv" }, // Breaking Bad
      { id: 1399, type: "tv" }, // Game of Thrones
      { id: 2316, type: "tv" }, // The Office
      { id: 246, type: "anime" }, // Avatar (using tv)
      { id: 67070, type: "tv" }, // Fleabag
    ] as { id: number, type: "movie" | "tv" }[];
  } catch (error) {
    console.error("Failed to get active benchmarks:", error);
    return [];
  }
}
