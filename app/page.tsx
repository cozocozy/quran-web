/**
 * app/page.tsx — Home Page
 * ─────────────────────────────────────────────────────────────────────
 * Server component: fetches the list of all 114 surahs at request time
 * (cached via force-cache so it only hits the API once per build/ISR).
 *
 * Layout:
 *  - Sticky top bar: logo + search icon + settings icon
 *  - LastReadCard (client component — reads localStorage)
 *  - Section header "Daftar Surah"
 *  - Full list of 114 SurahListItem rows
 * ─────────────────────────────────────────────────────────────────────
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Settings, Search } from "lucide-react";
import { getSurahList } from "@/lib/quran-api";
import SurahListItem from "@/components/SurahListItem";
import LastReadCard from "@/components/LastReadCard";

// ─── Metadata ─────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Al-Quran — Baca & Dengarkan Al-Quran",
  description:
    "Baca Al-Quran 114 surah lengkap dengan terjemahan Bahasa Indonesia, bookmark, dan murottal.",
};

// ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  /**
   * Fetch all 114 surahs server-side.
   * `force-cache` means Next.js caches this at the CDN edge.
   * The Quran API data never changes, so no revalidation is needed.
   */
  const surahs = await getSurahList();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Top Bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          {/* App logo / brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Quran">
              ☪️
            </span>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Al-Quran
            </h1>
          </div>

          {/* Action icons — min 44px touch targets */}
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              aria-label="Cari surah atau ayat"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-no-highlight"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/settings"
              aria-label="Pengaturan"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-no-highlight"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Last Read / Welcome Card ─────────────────────────────────── */}
      {/*
        LastReadCard is a Client Component — it reads localStorage on the
        client. It's rendered here inside the server page via RSC.
      */}
      <LastReadCard />

      {/* ── Surah List ───────────────────────────────────────────────── */}
      <section aria-labelledby="surah-list-heading" className="mt-6">
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2
            id="surah-list-heading"
            className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
          >
            Daftar Surah
          </h2>
          <span className="text-xs text-muted-foreground/60">
            {surahs.length} surah
          </span>
        </div>

        {/* List container — no need for virtualization at 114 items */}
        <div className="bg-background border-t border-border">
          {surahs.map((surah) => (
            <SurahListItem key={surah.number} surah={surah} />
          ))}
        </div>
      </section>
    </div>
  );
}
