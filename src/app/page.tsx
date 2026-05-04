import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import ProfileSelector from "@/components/ui/ProfileSelector";
import { LogOut } from "lucide-react";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="relative">
      <div className="absolute top-6 right-6 z-50">
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/auth/signin" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-container-highest)] transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>
      <ProfileSelector />
    </div>
  );
}
