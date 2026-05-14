"use client";
/**
 * app/search/page.tsx — Search Page
 * ─────────────────────────────────────────────────────────────────────
 * Client component because search is fully interactive.
 *
 * Strategy:
 *  1. Fetch all 114 surahs once on mount (cached via force-cache)
 *  2. Filter client-side using filterSurahs() — instant, no API call
 *  3. Show empty state with illustration when no results found
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import SurahListItem from "@/components/SurahListItem";
import { SurahListItemSkeleton } from "@/components/SurahListItem";
import { getSurahList, filterSurahs } from "@/lib/quran-api";
import type { SurahListItem as SurahListItemType } from "@/types/quran";
import { Search } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const [allSurahs, setAllSurahs] = useState<SurahListItemType[]>([]);
  const [results, setResults] = useState<SurahListItemType[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /** Load surah list on mount (fetched once, then cached by browser) */
  useEffect(() => {
    getSurahList()
      .then((surahs) => {
        setAllSurahs(surahs);
        setResults(surahs);       // Show all surahs initially
      })
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Called by SearchBar after its 300ms debounce.
   * Runs client-side filtering — no network request.
   */
  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      setResults(filterSurahs(allSurahs, q));
    },
    [allSurahs]
  );

  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* ── Search Input ──────────────────────────────────────────────── */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Cari surah... (contoh: Al-Baqarah, 2, الب)"
          autoFocus
        />
      </div>

      {/* ── Results Area ─────────────────────────────────────────────── */}
      <section aria-live="polite" aria-label="Hasil pencarian">
        {isLoading ? (
          /* Loading skeletons */
          <div className="border-t border-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <SurahListItemSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          /* Results list */
          <>
            {/* Result count */}
            <div className="px-4 py-2 border-b border-border">
              <p className="text-xs text-muted-foreground">
                {query
                  ? `${results.length} hasil untuk "${query}"`
                  : `${results.length} surah`}
              </p>
            </div>

            <div className="border-t border-border">
              {results.map((surah) => (
                <SurahListItem
                  key={surah.number}
                  surah={surah}
                  searchQuery={query}
                />
              ))}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="text-5xl mb-4" role="img" aria-label="Tidak ditemukan">
              🔍
            </div>
            <h2 className="text-base font-semibold text-foreground mb-2">
              Tidak ditemukan
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Tidak ada surah yang cocok dengan{" "}
              <span className="font-medium text-foreground">"{query}"</span>.
              Coba cari dengan nama Latin, nomor surah, atau huruf Arab.
            </p>

            {/* Search tips */}
            <div className="mt-6 text-left bg-muted rounded-xl p-4 w-full max-w-xs">
              <p className="text-xs font-semibold text-foreground mb-2">
                Tips pencarian:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Nama Latin: <code className="text-foreground">Al-Baqarah</code></li>
                <li>• Nomor surah: <code className="text-foreground">2</code></li>
                <li>• Terjemahan: <code className="text-foreground">sapi</code></li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
