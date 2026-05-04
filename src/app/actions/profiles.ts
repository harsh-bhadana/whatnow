"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { MediaCardProps } from "@/components/ui/MediaCard";
import { WatchHistoryItem } from "@/lib/store/useAppStore";

export interface Profile {
  _id?: string;
  name: string;
  color: string;
  watchHistory: WatchHistoryItem[];
}

export async function getProfiles(): Promise<Profile[]> {
  try {
    const client = await clientPromise;
    const db = client.db("whatNow");
    const profiles = await db.collection<Profile>("profiles").find({}).toArray();
    
    return profiles.map(p => ({
      ...p,
      _id: p._id?.toString(),
    }));
  } catch (e) {
    console.error("Failed to fetch profiles", e);
    return [];
  }
}

export async function createProfile(name: string, color: string): Promise<Profile | null> {
  try {
    const client = await clientPromise;
    const db = client.db("whatNow");
    
    const newProfile = {
      name,
      color,
      watchHistory: [],
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
    const client = await clientPromise;
    const db = client.db("whatNow");
    
    // Add to watch history, ensuring uniqueness isn't strictly necessary here if we just push,
    // but better to use $addToSet to avoid duplicates
    await db.collection("profiles").updateOne(
      { _id: new ObjectId(profileId) },
      { 
        // @ts-ignore
        $push: { 
          // @ts-ignore
          watchHistory: {
            ...media,
            watchedAt: Date.now()
          } 
        } 
      }
    );
    
    return true;
  } catch (e) {
    console.error("Failed to add watched media", e);
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
