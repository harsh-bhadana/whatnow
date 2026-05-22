"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId, Document } from "mongodb";
import { MediaCardProps } from "@/components/ui/MediaCard";
import { WatchHistoryItem } from "@/lib/store/useAppStore";
import { auth } from "@/auth";

export interface Profile {
  _id?: string;
  userId: string;
  name: string;
  color: string;
  includeAdult?: boolean;
  watchHistory: WatchHistoryItem[];
  watchlist?: MediaCardProps[];
}

export async function getProfiles(): Promise<Profile[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const client = await clientPromise;
    const db = client.db("whatNow");
    const profiles = await db.collection<Profile>("profiles").find({ userId: session.user.id }).toArray();
    
    return profiles.map(p => ({
      ...p,
      _id: p._id?.toString(),
    }));
  } catch (e) {
    console.error("Failed to fetch profiles", e);
    return [];
  }
}

export async function createProfile(name: string, color: string, includeAdult: boolean = false): Promise<Profile | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const newProfile = {
      userId: session.user.id,
      name,
      color,
      includeAdult,
      watchHistory: [],
      watchlist: [],
    };
    
    const result = await db.collection("profiles").insertOne(newProfile);
    
    return {
      ...newProfile,
      _id: result.insertedId.toString()
    };
  } catch (e) {
    console.error("Failed to create profile", e);
    return null;
  }
}

export async function addWatchedMedia(profileId: string, media: MediaCardProps): Promise<boolean> {
  if (!profileId) return false;
  
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    // Create history item
    const historyItem: WatchHistoryItem = {
      ...media,
      watchedAt: Date.now(),
      userRating: 0
    };
    
    // Add to watch history, ensuring uniqueness isn't strictly necessary here if we just push,
    // but better to use $addToSet to avoid duplicates
    await db.collection("profiles").updateOne(
      { _id: new ObjectId(profileId), userId: session.user.id },
      { 
        // @ts-expect-error - MongoDB types are tricky with nested arrays
        $push: { 
          watchHistory: historyItem
        } 
      }
    );
    
    return true;
  } catch (e) {
    console.error("Failed to add watched media", e);
    return false;
  }
}

export async function removeWatchedMedia(profileId: string, mediaId: number): Promise<boolean> {
  if (!profileId) return false;
  
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    const result = await db.collection("profiles").updateOne(
      { _id: new ObjectId(profileId), userId: session.user.id },
      { $pull: { watchHistory: { id: mediaId } } as Document }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to remove from watch history:", error);
    return false;
  }
}

export async function addToWatchlist(profileId: string, media: MediaCardProps): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const result = await db.collection("profiles").updateOne(
      { _id: new ObjectId(profileId), userId: session.user.id },
      { $push: { watchlist: media } as Document }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    return false;
  }
}

export async function removeFromWatchlist(profileId: string, mediaId: number): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;

    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const result = await db.collection("profiles").updateOne(
      { _id: new ObjectId(profileId), userId: session.user.id },
      { $pull: { watchlist: { id: mediaId } } as Document }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    return false;
  }
}

export async function getProfileHistory(profileId: string): Promise<WatchHistoryItem[]> {
  if (!profileId) return [];
  
  try {
    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const profile = await db.collection("profiles").findOne({ _id: new ObjectId(profileId) });
    return profile?.watchHistory || [];
  } catch (e) {
    console.error("Failed to get profile history", e);
    return [];
  }
}
