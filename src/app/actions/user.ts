"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId, Document } from "mongodb";
import { MediaCardProps } from "@/components/ui/MediaCard";
import { WatchHistoryItem } from "@/lib/store/useAppStore";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface UserData {
  watchHistory: WatchHistoryItem[];
  watchlist: MediaCardProps[];
  settings?: {
    includeAdult?: boolean;
  };
}

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

export async function addWatchedMedia(media: MediaCardProps): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const historyItem: WatchHistoryItem = {
      ...media,
      watchedAt: Date.now(),
      userRating: 0
    };
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        // @ts-expect-error - MongoDB types are tricky with nested arrays
        $push: { 
          watchHistory: historyItem
        } 
      }
    );
    
    revalidatePath("/history");
    return true;
  } catch (e) {
    console.error("Failed to add watched media", e);
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
