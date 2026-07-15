import { Suspense } from "react";
import MediaDetailClient from "./ClientPage";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function MediaDetailPage({ params }: PageProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-[var(--color-m3-primary)] animate-spin" />
        </div>
      }
    >
      <MediaDetailClient params={params} />
    </Suspense>
  );
}
