import { getUserData } from "@/app/actions/user";
import { HistoryGrid } from "./HistoryGrid";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const data = await getUserData();
  
  if (!data) {
    redirect("/");
  }

  const history = data.watchHistory || [];

  return <HistoryGrid initialHistory={history} />;
}
