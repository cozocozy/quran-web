/**
 * app/surah/[id]/page.tsx — Surah Reader (Server Component)
 * ─────────────────────────────────────────────────────────────────────
 * - generateStaticParams: pre-renders all 114 surah pages at build time
 * - Fetches Arabic + Indonesian data server-side (cached)
 * - Passes data to SurahReaderClient for interactive features
 *   (bookmarks, audio, last-read tracking, scroll-to-top FAB)
 * ─────────────────────────────────────────────────────────────────────
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurahWithTranslation, getSurahList } from "@/lib/quran-api";
import SurahReaderClient from "./SurahReaderClient";

// ─── Static Generation ────────────────────────────────────────────────

/**
 * Pre-generate static pages for all 114 surahs.
 * At runtime, any surah not found falls through to notFound().
 */
export async function generateStaticParams() {
  const surahs = await getSurahList();
  return surahs.map((s) => ({ id: String(s.number) }));
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const surahNumber = Number(id);

  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return { title: "Surah Tidak Ditemukan" };
  }

  try {
    const surah = await getSurahWithTranslation(surahNumber);
    return {
      title: `${surah.englishName} (${surah.name}) — ${surah.numberOfAyahs} Ayat`,
      description: `Baca Surah ${surah.englishName} (${surah.englishNameTranslation}) — ${surah.numberOfAyahs} ayat dengan terjemahan Bahasa Indonesia.`,
    };
  } catch {
    return { title: "Surah" };
  }
}

// ─────────────────────────────────────────────────────────────────────

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surahNumber = Number(id);

  // Validate surah number range
  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    notFound();
  }

  // Fetch surah data server-side — cached by Next.js
  const surah = await getSurahWithTranslation(surahNumber).catch(() => null);

  // Jika surah null (karena offline/API error saat dev), biarkan Client Component yang mencoba meload dari IndexedDB
  return <SurahReaderClient initialSurah={surah} surahNumber={surahNumber} />;
}
