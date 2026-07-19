import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  // Without profiles, just redirect directly to the main discover page
  redirect("/discover");
}
