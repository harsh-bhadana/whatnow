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
