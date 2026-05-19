"use client";

import { useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useTransitionRouter as useRouter } from "next-view-transitions";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto h-full">
      <div className="p-4 bg-red-500/10 rounded-full">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--color-m3-on-background)]">
          Something went wrong!
        </h2>
        <p className="text-[var(--color-m3-on-surface-variant)]">
          {error.message || "We couldn't load your recommendations. Please try again."}
        </p>
      </div>

      <div className="flex gap-4 w-full pt-4">
        <button
          onClick={() => router.back()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-[var(--color-m3-outline)] text-[var(--color-m3-on-surface)] hover:bg-[var(--color-m3-surface-variant)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button
          onClick={() => reset()}
          className="flex-1 py-3 rounded-full bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] font-bold shadow-[var(--shadow-m3-elevation-1)] hover:brightness-110 transition-all"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
