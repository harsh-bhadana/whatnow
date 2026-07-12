"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useTransitionRouter as useRouter, Link } from "next-view-transitions";
import { searchMedia } from "@/lib/api/tmdb";
import { MediaCardProps } from "./MediaCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store/useAppStore";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedMedia } = useAppStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    const delayDebounce = setTimeout(async () => {
      const data = await searchMedia(query);
      setResults(data.slice(0, 5)); // Show top 5
      setLoading(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  const handleSelectResult = (item: MediaCardProps) => {
    setSelectedMedia(item);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative hidden sm:block mx-4 max-w-xs w-full z-50">
      <form onSubmit={handleSearch}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[var(--color-m3-on-surface-variant)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.length >= 2) setIsOpen(true);
            }}
            placeholder="Search movies, tv..."
            className="w-full bg-[var(--color-m3-surface-container-highest)] border border-transparent focus:border-[var(--color-m3-primary)] focus:bg-[var(--color-m3-surface)] rounded-full py-1.5 pl-9 pr-4 text-sm text-[var(--color-m3-on-surface)] placeholder-[var(--color-m3-on-surface-variant)] outline-none transition-all shadow-sm"
          />
          {loading && (
            <Loader2 className="absolute right-3 w-4 h-4 animate-spin text-[var(--color-m3-primary)]" />
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-m3-surface-container-high)] border border-[var(--color-m3-outline)]/20 rounded-2xl shadow-xl overflow-hidden"
          >
            {results.length > 0 ? (
              <ul className="py-2">
                {results.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/media/${item.type}/${item.id}`}
                      onClick={() => handleSelectResult(item)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--color-m3-surface-container-highest)] transition-colors"
                    >
                      {item.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-8 h-12 object-cover rounded-md shrink-0 border border-[var(--color-m3-outline)]/20"
                        />
                      ) : (
                        <div className="w-8 h-12 rounded-md bg-[var(--color-m3-surface-variant)] shrink-0 flex items-center justify-center border border-[var(--color-m3-outline)]/20">
                          <Search className="w-4 h-4 opacity-30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-m3-on-surface)] truncate">{item.title}</p>
                        <p className="text-xs text-[var(--color-m3-on-surface-variant)] capitalize">{item.type} • ★ {item.rating?.toFixed(1)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
                <li>
                  <button 
                    onClick={handleSearch}
                    className="w-full text-center px-4 py-3 mt-1 text-xs font-bold text-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary)]/10 transition-colors border-t border-[var(--color-m3-outline)]/10"
                  >
                    View All Results
                  </button>
                </li>
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[var(--color-m3-on-surface-variant)]">
                {loading ? "Searching..." : "No results found"}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
