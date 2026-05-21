import { getUserData } from "@/app/actions/user";
import { WatchlistGrid } from "./WatchlistGrid";
import { redirect } from "next/navigation";

export default async function WatchlistPage() {
  const data = await getUserData();
  
  if (!data) {
    redirect("/");
  }

  const watchlist = data.watchlist || [];

  return <WatchlistGrid initialWatchlist={watchlist} />;
}
