import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileSelector from "@/components/ui/ProfileSelector";

import { Suspense } from "react";

async function PageInner() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return <ProfileSelector />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex-1 bg-[var(--color-m3-background)] flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-[var(--color-m3-primary)] animate-spin" /></div>}>
      <PageInner />
    </Suspense>
  );
}
