"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId, Document } from "mongodb";
import { MediaCardProps } from "@/components/media/MediaCard";
import { WatchHistoryItem } from "@/lib/store/useAppStore";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type UserData = {
  watchHistory: WatchHistoryItem[];
  watchlist: MediaCardProps[];
  settings?: {
    includeAdult?: boolean;
  };
};

export async function getUserData(): Promise<UserData | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    // session.user.id is the string representation of the MongoDB ObjectId
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) });
    
    if (!user) return null;

    return {
      watchHistory: user.watchHistory || [],
      watchlist: user.watchlist || [],
      settings: user.settings || { includeAdult: false }
    };
  } catch (e) {
    console.error("Failed to fetch user data", e);
    return null;
  }
}

export async function rateMedia(media: MediaCardProps, rating: 1 | -1): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const historyItem: WatchHistoryItem = {
      ...media,
      watchedAt: Date.now(),
      userRating: rating
    };
    
    // Use an aggregation pipeline with an update, or just try to update the array element first.
    // If we update the element, it will only succeed if the element exists.
    // Actually, in MongoDB it's easiest to pull it first and then push it, or use $set with array filters.
    // Let's do a pull then push to ensure it is at the front and has the new rating, 
    // OR we can just check if it exists in a separate query, but to be safe and update `watchedAt` + `userRating`:
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $pull: { watchHistory: { id: media.id } } as Document }
    );

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        // @ts-expect-error - MongoDB types are tricky with nested arrays
        $push: { 
          watchHistory: {
            $each: [historyItem],
            $position: 0
          }
        } 
      }
    );
    
    revalidatePath("/history");
    return true;
  } catch (e) {
    console.error("Failed to rate media", e);
    return false;
  }
}

export async function removeWatchedMedia(mediaId: number): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $pull: { watchHistory: { id: mediaId } } as Document }
    );
    
    revalidatePath("/history");
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to remove from watch history:", error);
    return false;
  }
}

export async function addToWatchlist(media: MediaCardProps): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $push: { watchlist: media } as Document }
    );
    
    revalidatePath("/watchlist");
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    return false;
  }
}

export async function removeFromWatchlist(mediaId: number): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $pull: { watchlist: { id: mediaId } } as Document }
    );
    
    revalidatePath("/watchlist");
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    return false;
  }
}

export interface TasteProfile {
  likedGenres: number[];
  dislikedGenres: number[];
  likedTitles: string[];
  dislikedTitles: string[];
}

export function buildTasteProfile(watchHistory: WatchHistoryItem[]): TasteProfile {
  const genreCounts: { [id: number]: number } = {};
  const dislikedGenreCounts: { [id: number]: number } = {};
  const likedTitles: string[] = [];
  const dislikedTitles: string[] = [];

  watchHistory.forEach((item) => {
    if (item.userRating === 1) {
      if (item.title) likedTitles.push(item.title);
      item.genreIds?.forEach((id) => {
        genreCounts[id] = (genreCounts[id] || 0) + 1;
      });
    } else if (item.userRating === -1) {
      if (item.title) dislikedTitles.push(item.title);
      item.genreIds?.forEach((id) => {
        dislikedGenreCounts[id] = (dislikedGenreCounts[id] || 0) + 1;
      });
    }
  });

  const likedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => Number(id));

  const dislikedGenres = Object.entries(dislikedGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => Number(id));

  return {
    likedGenres,
    dislikedGenres,
    likedTitles,
    dislikedTitles
  };
}
