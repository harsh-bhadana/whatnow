"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { ArrowLeft, Star, Clock, Trash2, Check } from "lucide-react";
import { Link } from 'next-view-transitions';
import { useAppStore } from "@/lib/store/useAppStore";
import { fetchMediaDetails } from "@/lib/api/tmdb";
import { addWatchedMedia, removeWatchedMedia } from "@/app/actions/profiles";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function MediaDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { selectedMedia, watchHistory, addToHistory, removeFromHistory, activeProfileId } = useAppStore();
  
  const [details, setDetails] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const isWatched = watchHistory.some((item) => item.id === Number(resolvedParams.id));

  // If a user hits this page directly without going through the flow, 
  // selectedMedia might be null. We should ideally fetch the basic details or use what we have.
  // For now, we'll assume they navigated from the app.
  const mediaContext = selectedMedia || {
    id: Number(resolvedParams.id),
    type: resolvedParams.type as "movie" | "tv" | "anime",
    title: "Loading...", // Fallback if direct link
    imageUrl: "",
    rating: 0,
    runtime: undefined,
  };

  useEffect(() => {
    async function load() {
      if (resolvedParams.type !== "anime") { // Only TMDB for now
        setLoading(true);
        try {
          const data = await fetchMediaDetails(Number(resolvedParams.id), resolvedParams.type as any);
          startTransition(() => {
            setDetails(data as unknown);
            setLoading(false);
          });
        } catch (e) {
          console.error(e);
          setLoading(false);
        }
      }
    }
    load();
  }, [resolvedParams.id, resolvedParams.type]);

  const handleToggleWatch = async () => {
    if (!selectedMedia) return;

    if (isWatched) {
      removeFromHistory(selectedMedia.id);
      if (activeProfileId) {
        await removeWatchedMedia(activeProfileId, selectedMedia.id);
      }
    } else {
      const historyItem = {
        ...selectedMedia,
        watchedAt: Date.now(),
        userRating: 0,
      };
      addToHistory(historyItem);
      if (activeProfileId) {
        await addWatchedMedia(activeProfileId, selectedMedia);
      }
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col">
      {/* Immersive Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {mediaContext.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={mediaContext.imageUrl} 
            alt="background" 
            className="w-full h-full object-cover opacity-20 scale-110 blur-3xl saturate-200"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-950/90 to-zinc-950" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6 sm:p-12 max-w-7xl mx-auto w-full">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-8 sm:mb-16">
          <Link 
            href="/recommendations"
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors text-white border border-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Poster Image */}
          <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 relative group perspective-1000">
            <div 
              style={{ viewTransitionName: `card-image-${mediaContext.type}-${mediaContext.id}` }}
              className="aspect-[2/3] w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            >
              {mediaContext.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaContext.imageUrl}
                    alt={mediaContext.title}
                    className="w-full h-full object-cover"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-zinc-800 animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Info Section */}
          <div className="flex-1 flex flex-col pt-2 md:pt-4">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
                {mediaContext.title || (details as any)?.title || (details as any)?.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm sm:text-base font-medium text-zinc-300">
              <span className="uppercase tracking-wider px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white shadow-sm">
                {mediaContext.type}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 rounded-full border border-white/5">
                <Star className="w-5 h-5 text-yellow-400 fill-current drop-shadow-md" />
                <span className="text-white font-semibold">{mediaContext.rating?.toFixed(1) || (details as any)?.vote_average?.toFixed(1)}</span>
              </div>
              {(mediaContext.runtime || (details as any)?.runtime) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 rounded-full border border-white/5">
                  <Clock className="w-5 h-5 text-zinc-400" />
                  <span>{mediaContext.runtime || (details as any)?.runtime}m</span>
                </div>
              )}
            </div>

            <div className="mt-8 sm:mt-12 text-zinc-300 text-lg leading-relaxed max-w-3xl">
              {loading ? (
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="h-5 bg-white/10 rounded-full w-full"></div>
                  <div className="h-5 bg-white/10 rounded-full w-5/6"></div>
                  <div className="h-5 bg-white/10 rounded-full w-4/6"></div>
                </div>
              ) : (details as any)?.overview ? (
                <p className="text-sm text-[var(--color-m3-outline)] leading-relaxed">{(details as { overview?: string })?.overview}</p>
              ) : mediaContext.type === "anime" ? (
                <p>Details for anime are not fetched yet, but it&apos;s a great choice!</p>
              ) : (
                <p>No description available.</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-10 sm:mt-12 flex gap-4 max-w-md">
              <button 
                onClick={handleToggleWatch}
                disabled={!selectedMedia}
                className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg ${
                  isWatched 
                    ? 'bg-white/10 text-white hover:bg-red-500/80 hover:shadow-red-500/20 border border-white/10 hover:border-transparent' 
                    : 'bg-[var(--color-m3-primary)] text-[var(--color-m3-on-primary)] hover:brightness-110 hover:shadow-[var(--color-m3-primary)]/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isWatched ? (
                  <>
                    <Trash2 className="w-6 h-6" />
                    <span>Remove from History</span>
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    <span>Mark as Watched</span>
                  </>
                )}
              </button>
            </div>
            
            {(details as any)?.credits?.cast && (details as any).credits.cast.length > 0 && (
              <div className="mt-12 sm:mt-16 border-t border-white/10 pt-8">
                <h3 className="text-xl font-heading font-semibold text-white mb-6">Top Cast</h3>
                <div className="flex flex-wrap gap-3">
                  {(details as any).credits.cast.slice(0, 8).map((c: any) => (
                    <span key={c.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm text-zinc-300 hover:bg-white/10 transition-colors cursor-default">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const usProviders = (details as any)?.["watch/providers"]?.results?.US;
              if (!usProviders) return null;
              
              const allProviders = [
                ...(usProviders.flatrate || []),
                ...(usProviders.rent || []),
                ...(usProviders.buy || [])
              ];
              
              const uniqueProviders = Array.from(new Map(allProviders.map(item => [item.provider_id, item])).values());
              if (uniqueProviders.length === 0) return null;

              return (
                <div className="mt-10 border-t border-white/10 pt-8">
                  <h3 className="text-xl font-heading font-semibold text-white mb-6">Where to Watch</h3>
                  <div className="flex flex-wrap gap-4">
                    {uniqueProviders.map((provider: any) => (
                      <div key={provider.provider_id} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`} 
                          alt={provider.provider_name}
                          className="w-8 h-8 rounded-full shadow-sm"
                        />
                        {provider.provider_name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </main>
  );
}
