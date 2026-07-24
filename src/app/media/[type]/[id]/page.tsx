/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import { ArrowLeft, Star, Clock, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, ChevronUp } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { fetchMediaDetails } from "@/lib/api/tmdb";
import { rateMedia, removeWatchedMedia, addToWatchlist, removeFromWatchlist } from "@/app/actions/user";
import { MediaCardProps } from "@/components/media/MediaCard";
import { WatchProviders } from "@/components/media/WatchProviders";
import { TMDB_GENRE_MAP } from "@/lib/constants";

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default function MediaDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { selectedMedia, watchHistory, rateMediaStore, removeFromHistory, watchlist, addToWatchlistStore, removeFromWatchlistStore } = useAppStore();
  
  const [details, setDetails] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const watchedItem = watchHistory.find((item) => item.id === Number(resolvedParams.id));
  const userRating = watchedItem?.userRating;
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
    load();
  }, [resolvedParams.id, resolvedParams.type]);

  const handleRate = async (rating: 1 | -1) => {
    if (!targetMedia) return;

    if (userRating === rating) {
      // Toggle off: remove the rating entirely
      removeFromHistory(targetMedia.id);
      await removeWatchedMedia(targetMedia.id);
    } else {
      // Set or update rating
      const historyItem = {
        ...targetMedia,
        watchedAt: Date.now(),
        userRating: rating,
      };
      rateMediaStore(historyItem);
      await rateMedia(targetMedia, rating);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!targetMedia) return;
    
    if (isWatchlisted) {
      removeFromWatchlistStore(targetMedia.id);
      await removeFromWatchlist(targetMedia.id);
    } else {
      addToWatchlistStore(targetMedia);
      await addToWatchlist(targetMedia);
    }
  };
  return (
    <main className="flex-1 w-full relative flex flex-col md:flex-row bg-[var(--color-m3-background)] md:h-full md:overflow-hidden">
      
      {/* LEFT SIDE: Bleed Poster Image */}
      <div className="relative flex flex-col w-full h-[55vh] sm:h-[60vh] md:h-full md:w-[35vw] lg:w-[30vw] xl:w-[25vw] shrink-0 z-10 md:border-r md:border-[var(--color-m3-outline-variant)] md:shadow-2xl bg-[var(--color-m3-surface)] overflow-hidden">
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-30 p-3 rounded-full bg-[var(--color-m3-surface-container-highest)]/80 hover:bg-black/60 backdrop-blur-xl transition-colors text-[var(--color-m3-on-background)] border border-[var(--color-m3-outline-variant)]"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {mediaContext.imageUrl ? (
          <div className="relative w-full h-full">
            {/* Base Image: Cached w500 image for instant, smooth View Transitions */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              style={{ viewTransitionName: `card-image-${mediaContext.type}-${mediaContext.id}` }}
              src={mediaContext.imageUrl}
              alt={mediaContext.title}
              className="w-full h-full object-cover absolute inset-0 z-0"
            />
            {/* High-Res Image: Fades in once loaded */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaContext.imageUrl.replace('/w500/', '/original/')}
              alt={mediaContext.title}
              className="w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-700 ease-in-out"
              onLoad={(e) => (e.currentTarget.style.opacity = '1')}
              style={{ opacity: 0 }}
            />
          </div>
        ) : (
          <div 
            style={{ viewTransitionName: `card-image-${mediaContext.type}-${mediaContext.id}` }}
            className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-m3-surface-container)] text-[var(--color-m3-on-surface-variant)]"
          >
            <span className="text-xs font-bold text-center px-4 leading-tight">{mediaContext.title}</span>
          </div>
        )}

        {/* Mobile Gradient & Blur Overlay */}
        <div className="absolute inset-0 top-[40%] bg-gradient-to-t from-[var(--color-m3-background)] via-[var(--color-m3-background)]/80 to-transparent md:hidden z-20 pointer-events-none" />
        <div 
          className="absolute inset-0 top-[40%] backdrop-blur-3xl md:hidden z-20 pointer-events-none"
          style={{ 
            maskImage: 'linear-gradient(to top, black 25%, transparent 100%)', 
            WebkitMaskImage: 'linear-gradient(to top, black 25%, transparent 100%)' 
          }}
        />
      </div>

      {/* RIGHT SIDE: Info Section */}
      <div className="flex-1 relative z-20 md:overflow-y-auto scrollbar-hide flex flex-col bg-transparent md:bg-transparent -mt-[15vh] md:mt-0 min-h-0">
        
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

        <div className="relative z-10 p-6 sm:p-10 lg:p-16 max-w-4xl w-full flex flex-col min-h-full pb-24 md:pt-16">
          <div className="shrink-0 mb-6 md:mb-0 relative pr-12 md:pr-0">
            <h1 
              style={{ viewTransitionName: `card-title-${mediaContext.type}-${mediaContext.id}` }}
              className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-[var(--color-m3-on-background)] leading-tight tracking-tight drop-shadow-lg w-fit"
            >
              {mediaContext.title || (details as any)?.title || (details as any)?.name}
            </h1>
            <div className="md:hidden absolute right-0 bottom-2 text-[var(--color-m3-on-background)]/80 animate-bounce">
              <ChevronUp className="w-8 h-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />
            </div>
          </div>
          
          <div className="flex-1 bg-[var(--color-m3-background)] md:bg-transparent -mx-6 px-6 sm:-mx-10 sm:px-10 lg:-mx-16 lg:px-16 pt-6 md:pt-0 rounded-t-3xl md:rounded-none md:mt-6">
            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-medium text-[var(--color-m3-on-surface)] shrink-0">
            <span 
              style={{ viewTransitionName: `card-tag-${mediaContext.type}-${mediaContext.id}` }}
              className={`uppercase tracking-wider px-4 py-1.5 backdrop-blur-md border rounded-full font-bold shadow-sm ${
                mediaContext.type === "movie" ? "bg-blue-500/20 text-blue-300 border-blue-400/40" :
                mediaContext.type === "tv" ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" :
                "bg-purple-500/20 text-purple-300 border-purple-400/40"
              }`}
            >
              {mediaContext.type}
            </span>
            <div 
              style={{ viewTransitionName: `card-rating-${mediaContext.type}-${mediaContext.id}` }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-m3-surface-container-highest)]/80 rounded-full border border-[var(--color-m3-outline-variant)]/50"
            >
              <Star className="w-5 h-5 text-yellow-400 fill-current drop-shadow-md" />
              <span className="text-[var(--color-m3-on-background)] font-semibold">{mediaContext.rating?.toFixed(1) || (details as any)?.vote_average?.toFixed(1)}</span>
            </div>
            {(mediaContext.runtime || (details as any)?.runtime) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-m3-surface-container-highest)]/80 rounded-full border border-[var(--color-m3-outline-variant)]/50">
                <Clock className="w-5 h-5 text-[var(--color-m3-on-surface-variant)]" />
                <span>{mediaContext.runtime || (details as any)?.runtime}m</span>
              </div>
            )}
            {/* Genre Tags */}
            {(() => {
              const genreList: string[] = (details as any)?.genres
                ? (details as any).genres.map((g: any) => g.name)
                : (selectedMedia?.genreIds || []).map(id => TMDB_GENRE_MAP[id]).filter(Boolean);
              
              if (!genreList || genreList.length === 0) return null;
              
              return (
                <div className="flex flex-wrap gap-2 items-center">
                  {genreList.map((genreName, idx) => (
                    <span key={idx} className="text-xs font-semibold px-3 py-1 bg-white/10 text-white/90 backdrop-blur-md rounded-full border border-white/10 shadow-sm">
                      {genreName}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="mt-8 sm:mt-10 text-[var(--color-m3-on-surface)] text-base sm:text-lg leading-relaxed max-w-3xl shrink-0">
            {loading ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-5 bg-[var(--color-m3-surface-variant)] rounded-full w-full"></div>
                <div className="h-5 bg-[var(--color-m3-surface-variant)] rounded-full w-5/6"></div>
                <div className="h-5 bg-[var(--color-m3-surface-variant)] rounded-full w-4/6"></div>
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
            <div className="flex-1 flex gap-2">
              <button 
                onClick={() => handleRate(1)}
                disabled={!targetMedia}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg text-sm sm:text-base ${
                  userRating === 1 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 shadow-green-500/20' 
                    : 'bg-[var(--color-m3-surface-variant)]/50 text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)]/50 hover:text-[var(--color-m3-on-background)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className={`w-5 h-5 sm:w-6 sm:h-6 ${userRating === 1 ? 'fill-current' : ''}`} />
                <span>Like</span>
              </button>
              <button 
                onClick={() => handleRate(-1)}
                disabled={!targetMedia}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg text-sm sm:text-base ${
                  userRating === -1 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 shadow-red-500/20' 
                    : 'bg-[var(--color-m3-surface-variant)]/50 text-[var(--color-m3-on-surface-variant)] hover:bg-[var(--color-m3-surface-variant)] border border-[var(--color-m3-outline-variant)]/50 hover:text-[var(--color-m3-on-background)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsDown className={`w-5 h-5 sm:w-6 sm:h-6 ${userRating === -1 ? 'fill-current' : ''}`} />
                <span>Dislike</span>
              </button>
            </div>
            <button 
              onClick={handleToggleWatchlist}
              disabled={!targetMedia}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-lg text-base sm:text-lg ${
                isWatchlisted 
                  ? 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] hover:brightness-110 border border-[var(--color-m3-outline)]/20' 
                  : 'bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-background)] hover:bg-white/20 border border-[var(--color-m3-outline-variant)]'
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
          
          {/* Watch Providers Section */}
          <WatchProviders providers={(details as any)?.['watch/providers']} />
          
          {/* Cast Section */}
          {(details as any)?.credits?.cast && (details as any).credits.cast.length > 0 && (
            <div className="mt-10 sm:mt-14 border-t border-[var(--color-m3-outline-variant)] pt-6 sm:pt-8 shrink-0">
              <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[var(--color-m3-on-background)] mb-4 sm:mb-6">Top Cast</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {(details as any).credits.cast.slice(0, 12).map((c: any) => (
                  <div key={c.id} className="snap-start shrink-0 w-28 sm:w-32 flex flex-col items-center text-center">
                    {c.profile_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                        alt={c.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mb-3 shadow-lg border-2 border-[var(--color-m3-surface-container)]"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[var(--color-m3-surface-variant)]/50 border-2 border-[var(--color-m3-outline-variant)] mb-3 flex items-center justify-center text-[var(--color-m3-on-background)]/30">
                        <span className="text-2xl">{c.name.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-[var(--color-m3-on-background)] leading-tight">{c.name}</span>
                    <span className="text-xs text-[var(--color-m3-on-background)]/50 mt-1 line-clamp-2">{c.character}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trailer Section */}
          {(() => {
            const trailer = (details as any)?.videos?.results?.find(
              (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
            );
            if (!trailer) return null;
            return (
              <div className="mt-10 sm:mt-14 border-t border-[var(--color-m3-outline-variant)] pt-6 sm:pt-8 shrink-0 pb-12">
                <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[var(--color-m3-on-background)] mb-4 sm:mb-6">Trailer</h3>
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-m3-outline-variant)] bg-black/50">
                  <iframe 
                    src={`https://www.youtube.com/embed/${trailer.key}?modestbranding=1&rel=0`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            );
          })()}

          {(() => {
            if (mediaContext.type === "anime") {
              return (
                <div className="mt-10 sm:mt-14 border-t border-[var(--color-m3-outline-variant)] pt-6 sm:pt-8 shrink-0 pb-12">
                  <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[var(--color-m3-on-background)] mb-4 sm:mb-6">Where to Watch</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-3 bg-[var(--color-m3-surface-variant)]/50 border border-[var(--color-m3-outline-variant)] px-4 py-3 rounded-xl text-sm sm:text-base font-medium text-[var(--color-m3-on-background)] hover:bg-[var(--color-m3-surface-variant)] transition-colors">
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
              <div className="mt-10 sm:mt-14 border-t border-[var(--color-m3-outline-variant)] pt-6 sm:pt-8 shrink-0 pb-12">
                <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[var(--color-m3-on-background)] mb-4 sm:mb-6">Where to Watch</h3>
                <div className="flex flex-wrap gap-4">
                  {uniqueProviders.map((provider: any) => (
                    <div key={provider.provider_id} className="flex items-center gap-3 bg-[var(--color-m3-surface-variant)]/50 border border-[var(--color-m3-outline-variant)] px-4 py-3 rounded-xl text-sm sm:text-base font-medium text-[var(--color-m3-on-background)] hover:bg-[var(--color-m3-surface-variant)] transition-colors">
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
