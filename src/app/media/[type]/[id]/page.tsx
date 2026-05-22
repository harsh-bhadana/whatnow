/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { ArrowLeft, Star, Clock, Trash2, Check, Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from 'next-view-transitions';
import { useAppStore } from "@/lib/store/useAppStore";
import { fetchMediaDetails } from "@/lib/api/tmdb";
import { addWatchedMedia, removeWatchedMedia, addToWatchlist, removeFromWatchlist } from "@/app/actions/profiles";
import { MediaCardProps } from "@/components/ui/MediaCard";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function MediaDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { selectedMedia, watchHistory, addToHistory, removeFromHistory, activeProfileId, watchlist, addToWatchlistStore, removeFromWatchlistStore } = useAppStore();
  
  const [details, setDetails] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const isWatched = watchHistory.some((item) => item.id === Number(resolvedParams.id));
  const isWatchlisted = watchlist?.some((item) => item.id === Number(resolvedParams.id)) || false;

  const isDirectLink = !selectedMedia || selectedMedia.id !== Number(resolvedParams.id);

  // If we navigated normally, selectedMedia has the initial data.
  // If direct link (or refresh), we rely on details once it loads.
  const mediaContext = isDirectLink ? {
    id: Number(resolvedParams.id),
    type: resolvedParams.type as "movie" | "tv" | "anime",
    title: (details as any)?.title || (details as any)?.name || "Loading...",
    imageUrl: (details as any)?.poster_path ? `https://image.tmdb.org/t/p/w500${(details as any).poster_path}` : "",
    rating: (details as any)?.vote_average || 0,
    runtime: (details as any)?.runtime,
  } : selectedMedia;

  // For the actions (watchlist/history), we need a fully formed MediaCardProps.
  // We use selectedMedia if valid, otherwise we reconstruct it from details.
  const targetMedia: MediaCardProps | null = isDirectLink ? (
    details ? {
      id: Number(resolvedParams.id),
      type: resolvedParams.type as "movie" | "tv" | "anime",
      title: (details as any).title || (details as any).name || "",
      imageUrl: (details as any).poster_path ? `https://image.tmdb.org/t/p/w500${(details as any).poster_path}` : "",
      rating: (details as any).vote_average || 0,
      runtime: (details as any).runtime,
    } : null
  ) : selectedMedia;

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
      } else {
        // If it's anime, we don't fetch TMDB details yet, so immediately stop loading
        setLoading(false);
      }
    }
    load();
  }, [resolvedParams.id, resolvedParams.type]);

  const handleToggleWatch = async () => {
    if (!targetMedia) return;

    if (isWatched) {
      removeFromHistory(targetMedia.id);
      if (activeProfileId) {
        await removeWatchedMedia(activeProfileId, targetMedia.id);
      }
    } else {
      const historyItem = {
        ...targetMedia,
        watchedAt: Date.now(),
        userRating: 0,
      };
      addToHistory(historyItem);
      if (activeProfileId) {
        await addWatchedMedia(activeProfileId, targetMedia);
      }
    }
  };

  const handleToggleWatchlist = async () => {
    if (!targetMedia) return;
    
    if (isWatchlisted) {
      removeFromWatchlistStore(targetMedia.id);
      if (activeProfileId) {
        await removeFromWatchlist(activeProfileId, targetMedia.id);
      }
    } else {
      addToWatchlistStore(targetMedia);
      if (activeProfileId) {
        await addToWatchlist(activeProfileId, targetMedia);
      }
    }
  };
  return (
    <main className="flex-1 md:flex-none relative flex flex-col md:flex-row bg-zinc-950 md:h-[calc(100dvh-64px)] md:max-h-[calc(100dvh-64px)] md:min-h-0 md:overflow-hidden">
      
      {/* LEFT SIDE: Bleed Poster Image */}
      <div className="relative flex flex-col w-full h-[40vh] md:h-full md:w-[35vw] lg:w-[30vw] xl:w-[25vw] shrink-0 z-10 shadow-[20px_0_50px_rgba(0,0,0,0.8)] bg-zinc-900 overflow-hidden">
        <button 
          onClick={() => router.back()}
          className="absolute top-6 left-6 z-30 p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl transition-colors text-white border border-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {mediaContext.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            style={{ viewTransitionName: `card-image-${mediaContext.type}-${mediaContext.id}` }}
            src={mediaContext.imageUrl.replace('/w500/', '/original/')}
            alt={mediaContext.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            style={{ viewTransitionName: `card-image-${mediaContext.type}-${mediaContext.id}` }}
            className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-500"
          >
            <span className="text-xs font-bold text-center px-4 leading-tight">{mediaContext.title}</span>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Info Section */}
      <div className="flex-1 relative z-20 md:overflow-y-auto scrollbar-hide flex flex-col bg-zinc-950 md:bg-transparent -mt-6 md:mt-0 rounded-t-3xl md:rounded-none min-h-0">
        
        {/* Immersive Ambient Background for right side on desktop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none hidden md:block">
          {mediaContext.imageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={mediaContext.imageUrl} 
              alt="background" 
              className="w-full h-full object-cover opacity-10 scale-125 blur-3xl saturate-200"
            />
          )}
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-16 max-w-4xl w-full md:pt-16">
          <div className="shrink-0">
            <h1 
              style={{ viewTransitionName: `card-title-${mediaContext.type}-${mediaContext.id}` }}
              className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-white leading-tight tracking-tight drop-shadow-lg w-fit"
            >
              {mediaContext.title || (details as any)?.title || (details as any)?.name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6 text-sm sm:text-base font-medium text-zinc-300 shrink-0">
            <span 
              style={{ viewTransitionName: `card-tag-${mediaContext.type}-${mediaContext.id}` }}
              className="uppercase tracking-wider px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white shadow-sm"
            >
              {mediaContext.type}
            </span>
            <div 
              style={{ viewTransitionName: `card-rating-${mediaContext.type}-${mediaContext.id}` }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 rounded-full border border-white/5"
            >
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

          <div className="mt-8 sm:mt-10 text-zinc-300 text-base sm:text-lg leading-relaxed max-w-3xl shrink-0">
            {loading ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-5 bg-white/10 rounded-full w-full"></div>
                <div className="h-5 bg-white/10 rounded-full w-5/6"></div>
                <div className="h-5 bg-white/10 rounded-full w-4/6"></div>
              </div>
            ) : (details as any)?.overview ? (
              <p className="text-[var(--color-m3-outline)] leading-relaxed">{(details as { overview?: string })?.overview}</p>
            ) : mediaContext.type === "anime" ? (
              <p className="text-[var(--color-m3-outline)]">Details for anime are not fetched yet, but it&apos;s a great choice!</p>
            ) : (
              <p className="text-[var(--color-m3-outline)]">No description available.</p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 sm:mt-12 flex gap-4 max-w-md shrink-0">
            <button 
              onClick={handleToggleWatch}
              disabled={!targetMedia}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg text-base sm:text-lg ${
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
            <button 
              onClick={handleToggleWatchlist}
              disabled={!targetMedia}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg text-base sm:text-lg ${
                isWatchlisted 
                  ? 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] hover:brightness-110 border border-[var(--color-m3-outline)]/20' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isWatchlisted ? (
                <>
                  <BookmarkCheck className="w-6 h-6" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-6 h-6" />
                  <span>Watch Later</span>
                </>
              )}
            </button>
          </div>
          
          {(details as any)?.credits?.cast && (details as any).credits.cast.length > 0 && (
            <div className="mt-10 sm:mt-14 border-t border-white/10 pt-6 sm:pt-8 shrink-0">
              <h3 className="text-xl sm:text-2xl font-heading font-semibold text-white mb-4 sm:mb-6">Top Cast</h3>
              <div className="flex flex-wrap gap-3">
                {(details as any).credits.cast.slice(0, 8).map((c: any) => (
                  <span key={c.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm sm:text-base text-zinc-300 hover:bg-white/10 transition-colors cursor-default">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(() => {
            if (mediaContext.type === "anime") {
              return (
                <div className="mt-10 sm:mt-14 border-t border-white/10 pt-6 sm:pt-8 shrink-0 pb-12">
                  <h3 className="text-xl sm:text-2xl font-heading font-semibold text-white mb-4 sm:mb-6">Where to Watch</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm sm:text-base font-medium text-white hover:bg-white/10 transition-colors">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src="https://image.tmdb.org/t/p/w200/mXeC4TrcgdU6ltE9bCBCEORwSQR.jpg" 
                        alt="Crunchyroll"
                        className="w-8 h-8 rounded-full shadow-sm"
                      />
                      Crunchyroll
                    </div>
                  </div>
                </div>
              );
            }

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
              <div className="mt-10 sm:mt-14 border-t border-white/10 pt-6 sm:pt-8 shrink-0 pb-12">
                <h3 className="text-xl sm:text-2xl font-heading font-semibold text-white mb-4 sm:mb-6">Where to Watch</h3>
                <div className="flex flex-wrap gap-4">
                  {uniqueProviders.map((provider: any) => (
                    <div key={provider.provider_id} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm sm:text-base font-medium text-white hover:bg-white/10 transition-colors">
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
    </main>
  );
}
