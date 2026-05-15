"use client";
/**
 * components/AyahCard.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Renders a single Quran ayah in one of three reading modes:
 *
 *  • "default"     — Arabic + Indonesian translation (standard)
 *  • "arabic"      — Arabic only, font upscaled ~1.4×, focused tilawah
 *  • "translation" — Indonesian only, no Arabic, focused tadabbur
 *
 * Receives all state from the parent (SurahReaderClient) to avoid each
 * card reading from localStorage independently.
 * ─────────────────────────────────────────────────────────────────────
 */

import { memo, useCallback } from "react";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { cn, toArabicNumerals } from "@/lib/utils";
import AudioPlayer from "@/components/AudioPlayer";
import type { AyahWithTranslation, FontSize, ReadingMode } from "@/types/quran";

// ─── Props ────────────────────────────────────────────────────────────

interface AyahCardProps {
  ayah: AyahWithTranslation;
  surahNumber: number;
  fontSize: FontSize;         // From useSettings
  readingMode: ReadingMode;   // "default" | "arabic" | "translation"
  isBookmarked: boolean;      // From useBookmarks
  onBookmark: (ayah: AyahWithTranslation) => void;
  onUnbookmark: (ayahNumber: number) => void;
}

// ─── Font size map ────────────────────────────────────────────────────

/**
 * Arabic font size class per setting × mode.
 * In "arabic" mode we upscale one step to give full reading focus.
 */
const ARABIC_SIZE: Record<FontSize, Record<ReadingMode, string>> = {
  sm: { default: "arabic-text-sm", arabic: "arabic-text-md", translation: "" },
  md: { default: "arabic-text-md", arabic: "arabic-text-lg", translation: "" },
  lg: { default: "arabic-text-lg", arabic: "arabic-text-lg", translation: "" },
};

// ─────────────────────────────────────────────────────────────────────

/**
 * AyahCard — wrapped in React.memo so only the card whose bookmark
 * state changed re-renders when the user taps the bookmark icon.
 */
const AyahCard = memo(function AyahCard({
  ayah,
  surahNumber,
  fontSize,
  readingMode,
  isBookmarked,
  onBookmark,
  onUnbookmark,
}: AyahCardProps) {
  const ayahKey = `${surahNumber}:${ayah.number}`;

  // Whether to show each content block
  const showArabic = readingMode !== "translation";
  const showTranslation = readingMode !== "arabic";

  // ── Share handler ──────────────────────────────────────────────────

  /**
   * Shares ayah via Web Share API (mobile) or clipboard (desktop).
   * The share text adapts to the current reading mode.
   */
  const handleShare = useCallback(async () => {
    const parts: string[] = [];
    if (showArabic) parts.push(ayah.arabic);
    if (showTranslation) parts.push(ayah.translation);
    parts.push(`— QS. ${surahNumber}:${ayah.number}`);
    const text = parts.join("\n\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: `Al-Quran ${surahNumber}:${ayah.number}`, text });
      } catch {
        // User cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(text).catch(() => null);
    }
  }, [ayah, surahNumber, showArabic, showTranslation]);

  // ── Bookmark toggle ────────────────────────────────────────────────

  const handleBookmarkToggle = useCallback(() => {
    isBookmarked ? onUnbookmark(ayah.number) : onBookmark(ayah);
  }, [isBookmarked, ayah, onBookmark, onUnbookmark]);

  // ─────────────────────────────────────────────────────────────────

  return (
    <article
      id={`ayah-${ayah.number}`}
      data-ayah={ayah.number}
      className={cn(
        "border-b border-border last:border-b-0 bg-background",
        // In arabic-only mode, give more vertical breathing room
        readingMode === "arabic" ? "px-4 py-8" : "px-4 py-5"
      )}
      aria-label={`Ayat ${ayah.number}`}
    >
      {/* ── Ayah number badge ───────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full shadow-sm",
            "bg-[#DFF5EC] text-[#1F7A5A]",
            "dark:bg-[#1E3A34] dark:text-[#7BE0B8]",
            readingMode === "translation" 
              ? "text-[10px] font-bold" 
              : "text-base font-bold arabic-text leading-none pt-0.5"
          )}
          aria-label={`Ayat ${surahNumber}:${ayah.number}`}
        >
          {readingMode === "translation" ? ayah.number : toArabicNumerals(ayah.number)}
        </div>

        {/* Juz / page info — hidden in full-translation mode to reduce clutter */}
        {readingMode !== "translation" && (
          <span className="text-[10px] text-muted-foreground/60 mt-2.5">
            Juz {ayah.juz} · Hal. {ayah.page}
          </span>
        )}
      </div>

      {/* ── Arabic text ─────────────────────────────────────────────── */}
      {showArabic && (
        <p
          className={cn(
            "arabic-text text-foreground mb-4 text-right",
            ARABIC_SIZE[fontSize][readingMode],
            // In arabic-only mode add extra bottom margin for visual breathing
            readingMode === "arabic" && "mb-8"
          )}
          dir="rtl"
          lang="ar"
        >
          {ayah.arabic}
        </p>
      )}

      {/* ── Indonesian translation ───────────────────────────────────── */}
      {showTranslation && (
        <p
          className={cn(
            "leading-relaxed text-muted-foreground mb-4",
            // Larger text in translation-only mode for easier reading
            readingMode === "translation" ? "text-base" : "text-sm",
            // Border accent only in default mode (would look odd in translation-only)
            readingMode === "default" &&
              "border-l-2 border-[oklch(0.6_0.14_196)]/30 pl-3"
          )}
          lang="id"
        >
          {/* Ayah number inline for translation-only mode */}
          {readingMode === "translation" && (
            <span className="text-[oklch(0.6_0.14_196)] font-semibold mr-1.5">
              {ayah.number}.
            </span>
          )}
          {ayah.translation}
        </p>
      )}

      {/* ── Action row: Audio | Bookmark | Share ─────────────────────── */}
      <div className="flex items-center gap-2 pt-1">
        {/* Audio — only shown when Arabic is visible */}
        {showArabic && (
          <AudioPlayer globalAyahNumber={ayah.numberInQuran} ayahKey={ayahKey} />
        )}

        {/* Bookmark toggle */}
        <button
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? "Hapus bookmark" : "Tambah bookmark"}
          aria-pressed={isBookmarked}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            "transition-all duration-200 touch-no-highlight",
            isBookmarked
              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500"
              : "bg-muted text-muted-foreground hover:bg-amber-50 hover:text-amber-500"
          )}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Bookmark className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          aria-label="Bagikan ayat"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            "bg-muted text-muted-foreground hover:bg-muted/80",
            "transition-colors duration-200 touch-no-highlight"
          )}
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Sajda indicator */}
        {ayah.sajda && (
          <span
            className={cn(
              "ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full",
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            )}
            title="Ayat Sajdah — disunnahkan sujud tilawah"
          >
            Sajda
          </span>
        )}
      </div>
    </article>
  );
});

export default AyahCard;

// ─── Skeleton ─────────────────────────────────────────────────────────

import { Skeleton } from "@/components/ui/skeleton";

/** AyahCardSkeleton — varies height to simulate realistic ayah lengths */
export function AyahCardSkeleton({ index }: { index: number }) {
  const isLong = index % 3 === 0;
  return (
    <div className="px-4 py-5 border-b border-border">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-9 h-9 rounded-full skeleton-pulse" />
        <Skeleton className="h-3 w-20 mt-3 skeleton-pulse" />
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className={cn("h-8 skeleton-pulse", isLong ? "w-full" : "w-4/5")} />
        <Skeleton className={cn("h-8 skeleton-pulse", isLong ? "w-5/6" : "w-3/5")} />
        {isLong && <Skeleton className="h-8 w-2/3 skeleton-pulse" />}
      </div>
      <div className="space-y-1.5 mb-4">
        <Skeleton className="h-3 w-full skeleton-pulse" />
        <Skeleton className="h-3 w-5/6 skeleton-pulse" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-10 h-10 rounded-full skeleton-pulse" />
        <Skeleton className="w-10 h-10 rounded-full skeleton-pulse" />
        <Skeleton className="w-10 h-10 rounded-full skeleton-pulse" />
      </div>
    </div>
  );
}
