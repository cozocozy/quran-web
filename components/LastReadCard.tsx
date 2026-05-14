"use client";
/**
 * components/LastReadCard.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Displays the user's last-read position as a tappable resume card.
 * If no history exists, shows a Bismillah welcome card instead.
 *
 * This is a client component because it reads from localStorage via
 * the useLastRead hook.
 * ─────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLastRead } from "@/lib/use-last-read";
import { Skeleton } from "@/components/ui/skeleton";

// ─────────────────────────────────────────────────────────────────────

export default function LastReadCard() {
  const { lastRead } = useLastRead();

  // ── Welcome card (no history) ────────────────────────────────────
  if (!lastRead) {
    return (
      <div
        className={cn(
          "mx-4 mt-4 rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-[oklch(0.6_0.14_196)] to-[oklch(0.5_0.18_220)]",
          "text-white p-5"
        )}
      >
        {/* Decorative sparkle */}
        <Sparkles className="w-5 h-5 mb-3 opacity-80" aria-hidden="true" />

        {/* Bismillah in Arabic */}
        <p
          className="arabic-text arabic-text-md text-white/90 mb-3"
          dir="rtl"
          lang="ar"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        <p className="text-sm font-medium text-white/80">
          Selamat datang di Al-Quran
        </p>
        <p className="text-xs text-white/60 mt-1">
          Mulai membaca untuk melacak progres bacaan Anda
        </p>
      </div>
    );
  }

  // ── Resume card (has history) ────────────────────────────────────
  return (
    <Link
      href={`/surah/${lastRead.surahNumber}#ayah-${lastRead.ayahNumber}`}
      className={cn(
        "mx-4 mt-4 rounded-2xl overflow-hidden block",
        "bg-gradient-to-br from-[oklch(0.6_0.14_196)] to-[oklch(0.5_0.18_220)]",
        "text-white p-5 active:opacity-90 transition-opacity touch-no-highlight"
      )}
      aria-label={`Lanjutkan membaca ${lastRead.surahEnglishName} ayat ${lastRead.ayahNumber}`}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 opacity-80" aria-hidden="true" />
        <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
          Terakhir Dibaca
        </span>
      </div>

      {/* Surah info */}
      <div className="flex items-end justify-between">
        <div>
          {/* Arabic name */}
          <p
            className="arabic-title text-2xl text-white mb-1"
            dir="rtl"
            lang="ar"
          >
            {lastRead.surahName}
          </p>
          {/* Latin + ayah number */}
          <p className="text-base font-bold text-white/90">
            {lastRead.surahEnglishName}
          </p>
          <p className="text-xs text-white/60 mt-0.5">
            Ayat {lastRead.ayahNumber}
          </p>
        </div>

        {/* Continue arrow */}
        <div className="bg-white/20 rounded-full p-2">
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────

/** Shown while the component is hydrating from localStorage */
export function LastReadCardSkeleton() {
  return (
    <div className="mx-4 mt-4 rounded-2xl bg-muted p-5 skeleton-pulse">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
