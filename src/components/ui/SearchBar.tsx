"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTransitionRouter as useRouter } from "next-view-transitions";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative hidden sm:block mx-4 max-w-xs w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-[var(--color-m3-on-surface-variant)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, tv..."
          className="w-full bg-[var(--color-m3-surface-container-highest)] border border-transparent focus:border-[var(--color-m3-primary)] focus:bg-[var(--color-m3-surface)] rounded-full py-1.5 pl-9 pr-4 text-sm text-[var(--color-m3-on-surface)] placeholder-[var(--color-m3-on-surface-variant)] outline-none transition-all shadow-sm"
        />
      </div>
    </form>
  );
}
