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
// import { Settings, Search } from "lucide-react";
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
      {/* Removed Top Bar as requested to focus on bottom navigation */}

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
