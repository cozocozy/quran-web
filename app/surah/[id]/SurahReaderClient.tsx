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
 *  - Manage per-surah bookmark state (useBookmarks hook)
 *  - Apply font size from persistent settings
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useCallback, useState, type ComponentType } from "react";
import Link from "next/link";
import { ArrowLeft, AlignJustify, Globe, BookOpen } from "lucide-react";
import { cn, toArabicNumerals } from "@/lib/utils";
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
  initialSurah: SurahWithTranslation | null;
  surahNumber: number;
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
  icon: ComponentType<{ className?: string }>;
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

export default function SurahReaderClient({ initialSurah, surahNumber }: SurahReaderClientProps) {
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { saveLastRead } = useLastRead();
  const { settings } = useSettings();

  const [surah, setSurah] = useState<SurahWithTranslation | null>(initialSurah);
  const [isLoading, setIsLoading] = useState(!initialSurah);

  /**
   * readingMode is local per-session state — changing it doesn't write to
   * localStorage (that would affect all surahs). It initialises from the
   * persistent settings preference on mount.
   */
  const [readingMode, setReadingMode] = useState<ReadingMode>(
    settings.readingMode ?? "default"
  );
  const listRef = useRef<HTMLDivElement>(null);

  // ── Load from offline storage if initialSurah is null ──────────────
  useEffect(() => {
    if (!surah) {
      import("@/lib/offline-storage").then((offline) => {
        offline.getCachedSurah(surahNumber).then((cached) => {
          if (cached) setSurah(cached);
          setIsLoading(false);
        }).catch(() => setIsLoading(false));
      });
    }
  }, [surah, surahNumber]);

  // ── Scroll to top on mount ─────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // ── Sync initial mode from settings after hydration ────────────────
  useEffect(() => {
    setReadingMode(settings.readingMode ?? "default");
  }, [settings.readingMode]);


  // ── Last-read tracking via IntersectionObserver ────────────────────

  useEffect(() => {
    /**
     * Saves the most-visible ayah's position as last-read.
     * Throttled to once every 2 seconds to avoid localStorage thrashing.
     */
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!surah) return;
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
      if (!surah) return;
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
    (ayahNumber: number) => {
      if (!surah) return;
      removeBookmark(surah.number, ayahNumber);
    },
    [surah, removeBookmark]
  );

  // ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Memuat data Surah...</p>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Surah Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Gagal mengambil data. Pastikan koneksi internet aktif, atau unduh data di mode offline.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-[oklch(0.6_0.14_196)] text-white rounded-xl text-sm font-medium touch-no-highlight"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <header className="bg-background border-b border-border">
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
              className="arabic-title text-2xl text-foreground leading-tight"
              dir="rtl"
              lang="ar"
            >
              {surah.name}
            </p>
            <p className="text-xs font-bold text-foreground">
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
        <p className="text-xs font-bold text-[oklch(0.5_0.14_196)] dark:text-[oklch(0.7_0.1_196)]">
          {surah.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"} ·{" "}
          Surah ke-{surah.number}
        </p>
        {/* Removed translation as requested */}
      </div>

      {/* ── Bismillah header (skip for surah 1 & 9) ─────────────────── */}
      {!NO_BISMILLAH_SURAHS.has(surah.number) && readingMode !== "translation" && (
        <div className="py-6 px-4 text-center border-b border-border bg-background">
          <p
            className={cn(
              "arabic-text text-foreground !text-center",
              readingMode === "arabic" ? "arabic-text-lg" : "arabic-text-md"
            )}
            dir="rtl"
            lang="ar"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
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
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-base font-bold mx-1.5 align-middle shadow-sm bg-[#DFF5EC] text-[#1F7A5A] dark:bg-[#1E3A34] dark:text-[#7BE0B8] arabic-text leading-none pt-0.5">
                    {toArabicNumerals(ayah.number)}
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
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold mr-1.5 align-middle shadow-sm bg-[#DFF5EC] text-[#1F7A5A] dark:bg-[#1E3A34] dark:text-[#7BE0B8]">
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

    </div>
  );
}
