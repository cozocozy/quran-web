"use client";
/**
 * app/surah/[id]/SurahReaderClient.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Client component for the interactive surah reading experience.
 *
 * Reading Modes (toggled via the pill switcher in the top bar):
 *  • "default"     — Arabic + Indonesian translation
 *  • "arabic"      — Arabic only, larger font for focused tilawah
 *  • "translation" — Indonesian only for tadabbur
 *
 * Other responsibilities:
 *  - Track last-read position via IntersectionObserver → saveLastRead
 *  - Show/hide scroll-to-top FAB after 300px scroll
 *  - Manage per-surah bookmark state (useBookmarks hook)
 *  - Apply font size from persistent settings
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronUp, AlignJustify, Globe, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import AyahCard from "@/components/AyahCard";
import { useBookmarks } from "@/lib/use-bookmarks";
import { useLastRead } from "@/lib/use-last-read";
import { useSettings } from "@/lib/use-settings";
import type {
  SurahWithTranslation,
  AyahWithTranslation,
  Bookmark,
  ReadingMode,
} from "@/types/quran";

// ─── Props ────────────────────────────────────────────────────────────

interface SurahReaderClientProps {
  surah: SurahWithTranslation;
}

/**
 * Surahs that do NOT show the Bismillah header:
 *  1 = Al-Fatihah (Bismillah is its first ayah, not a header)
 *  9 = At-Tawbah (no Bismillah by Quranic ruling)
 */
const NO_BISMILLAH_SURAHS = new Set([1, 9]);

// ─── Mode Config ──────────────────────────────────────────────────────

/**
 * Mode options displayed in the segmented switcher.
 * Each has an icon, short label, and aria-label.
 */
const READING_MODES: {
  value: ReadingMode;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ariaLabel: string;
}[] = [
  {
    value: "default",
    icon: AlignJustify,
    label: "Arab + ID",
    ariaLabel: "Mode Arab dan Terjemahan",
  },
  {
    value: "arabic",
    icon: BookOpen,
    label: "Arab",
    ariaLabel: "Mode Arab saja",
  },
  {
    value: "translation",
    icon: Globe,
    label: "Terjemahan",
    ariaLabel: "Mode Terjemahan saja",
  },
];

// ─────────────────────────────────────────────────────────────────────

export default function SurahReaderClient({ surah }: SurahReaderClientProps) {
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { saveLastRead } = useLastRead();
  const { settings } = useSettings();

  /**
   * readingMode is local per-session state — changing it doesn't write to
   * localStorage (that would affect all surahs). It initialises from the
   * persistent settings preference on mount.
   */
  const [readingMode, setReadingMode] = useState<ReadingMode>(
    settings.readingMode ?? "default"
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  // ── Sync initial mode from settings after hydration ────────────────
  useEffect(() => {
    setReadingMode(settings.readingMode ?? "default");
  }, [settings.readingMode]);

  // ── Scroll-to-top FAB ──────────────────────────────────────────────

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Last-read tracking via IntersectionObserver ────────────────────

  useEffect(() => {
    /**
     * Saves the most-visible ayah's position as last-read.
     * Throttled to once every 2 seconds to avoid localStorage thrashing.
     */
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.5)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const ayahNumber = Number(
          (visible.target as HTMLElement).dataset.ayah
        );
        if (!ayahNumber || isNaN(ayahNumber)) return;

        if (throttleTimer) return;
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          saveLastRead(surah.number, ayahNumber, surah.name, surah.englishName);
        }, 2000);
      },
      { threshold: 0.5 }
    );

    listRef.current
      ?.querySelectorAll("article[data-ayah]")
      .forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [surah, saveLastRead]);

  // ── Bookmark handlers ──────────────────────────────────────────────

  const handleBookmark = useCallback(
    (ayah: AyahWithTranslation) => {
      const bookmark: Bookmark = {
        surahNumber: surah.number,
        ayahNumber: ayah.number,
        surahName: surah.englishName,
        arabicText: ayah.arabic.slice(0, 100),
        savedAt: new Date().toISOString(),
      };
      addBookmark(bookmark);
    },
    [surah, addBookmark]
  );

  const handleUnbookmark = useCallback(
    (ayahNumber: number) => removeBookmark(surah.number, ayahNumber),
    [surah.number, removeBookmark]
  );

  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky Top Bar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center px-2 h-14 max-w-lg mx-auto gap-2">
          {/* Back button */}
          <Link
            href="/"
            aria-label="Kembali ke daftar surah"
            className="flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors touch-no-highlight flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>

          {/* Surah name (center) */}
          <div className="flex-1 text-center min-w-0">
            <p
              className="arabic-text text-lg text-foreground leading-tight"
              dir="rtl"
              lang="ar"
            >
              {surah.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {surah.englishName} · {surah.numberOfAyahs} Ayat
            </p>
          </div>

          {/* Spacer */}
          <div className="w-11 flex-shrink-0" aria-hidden="true" />
        </div>

        {/* ── Reading Mode Switcher ───────────────────────────────────
          A pill-style segmented control with 3 tabs.
          Sits below the title row, inside the sticky header.
        ─────────────────────────────────────────────────────────────── */}
        <div className="px-3 pb-2.5 max-w-lg mx-auto">
          <div
            role="tablist"
            aria-label="Mode tampilan"
            className="flex bg-muted rounded-xl p-1 gap-1"
          >
            {READING_MODES.map(({ value, icon: Icon, label, ariaLabel }) => {
              const isActive = readingMode === value;
              return (
                <button
                  key={value}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={ariaLabel}
                  onClick={() => setReadingMode(value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5",
                    "py-1.5 px-2 rounded-lg text-xs font-medium",
                    "transition-all duration-200 min-h-[36px] touch-no-highlight",
                    isActive
                      ? "bg-background text-[oklch(0.6_0.14_196)] shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Surah info banner ────────────────────────────────────────── */}
      <div className="bg-[oklch(0.95_0.03_196)] dark:bg-[oklch(0.2_0.04_196)] py-3 px-4 text-center">
        <p className="text-xs text-[oklch(0.5_0.14_196)] dark:text-[oklch(0.7_0.1_196)]">
          {surah.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"} ·{" "}
          Surah ke-{surah.number}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {surah.englishNameTranslation}
        </p>
      </div>

      {/* ── Bismillah header (skip for surah 1 & 9) ─────────────────── */}
      {!NO_BISMILLAH_SURAHS.has(surah.number) && readingMode !== "translation" && (
        <div className="py-6 px-4 text-center border-b border-border bg-background">
          <p
            className={cn(
              "arabic-text text-foreground",
              readingMode === "arabic" ? "arabic-text-lg" : "arabic-text-md"
            )}
            dir="rtl"
            lang="ar"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
          </p>
        </div>
      )}

      {/* ── Ayah List ────────────────────────────────────────────────── */}
      <div ref={listRef}>
        {readingMode === "arabic" ? (
          /* Mushaf-style continuous reading (Arabic) */
          <div className="px-4 py-8 bg-background leading-loose">
            <p
              className={cn(
                "arabic-text text-foreground leading-[2.5] text-justify",
                settings.fontSize === "sm" ? "arabic-text-md" : "arabic-text-lg"
              )}
              dir="rtl"
              lang="ar"
            >
              {surah.ayahs.map((ayah) => (
                <span
                  key={ayah.number}
                  data-ayah={ayah.number}
                  className="inline"
                >
                  {ayah.arabic}{" "}
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border text-sm font-medium text-muted-foreground mx-1.5 align-middle bg-muted/30">
                    {ayah.number}
                  </span>{" "}
                </span>
              ))}
            </p>
          </div>
        ) : readingMode === "translation" ? (
          /* Novel-style continuous reading (Translation) */
          <div className="px-5 py-8 bg-background">
            <p className="text-foreground leading-loose text-justify text-[15px]">
              {surah.ayahs.map((ayah) => (
                <span
                  key={ayah.number}
                  data-ayah={ayah.number}
                  className="inline"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-border text-[11px] font-semibold text-muted-foreground mr-1.5 align-middle bg-muted/30">
                    {ayah.number}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: ayah.translation }} />{" "}
                </span>
              ))}
            </p>
          </div>
        ) : (
          /* Card-style reading (Default mode) */
          surah.ayahs.map((ayah) => (
            <AyahCard
              key={ayah.number}
              ayah={ayah}
              surahNumber={surah.number}
              fontSize={settings.fontSize}
              readingMode={readingMode}
              isBookmarked={isBookmarked(surah.number, ayah.number)}
              onBookmark={handleBookmark}
              onUnbookmark={handleUnbookmark}
            />
          ))
        )}
      </div>

      {/* ── Scroll-to-top FAB ────────────────────────────────────────── */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className={cn(
            "fixed bottom-24 right-4 z-40",
            "w-12 h-12 rounded-full shadow-lg",
            "flex items-center justify-center",
            "bg-[oklch(0.6_0.14_196)] text-white",
            "hover:bg-[oklch(0.55_0.16_196)] active:scale-95",
            "transition-all duration-200 touch-no-highlight"
          )}
        >
          <ChevronUp className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
