"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { getUserData } from "@/app/actions/user";

export function StoreInitializer() {
  const { setUserDataLoaded, setWatchHistory, setWatchlist } = useAppStore();

  useEffect(() => {
    async function loadUserData() {
      try {
        const data = await getUserData();
        if (data) {
          setWatchHistory(data.watchHistory || []);
          setWatchlist(data.watchlist || []);
          // In the future we can also store the adult settings in the store if needed
        }
      } catch (e) {
        console.error("Failed to fetch user data for store:", e);
      } finally {
        setUserDataLoaded(true);
      }
    }

    loadUserData();
  }, [setUserDataLoaded, setWatchHistory, setWatchlist]);

  return null;
}
