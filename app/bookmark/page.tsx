"use client";
/**
 * app/bookmark/page.tsx — Bookmarks Page
 * ─────────────────────────────────────────────────────────────────────
 * Displays all bookmarked ayahs from localStorage (and Supabase when
 * the user is logged in). Each bookmark is tappable and navigates to
 * the exact ayah in the surah reader.
 * ─────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { Trash2, BookmarkX, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/lib/use-bookmarks";
import { Separator } from "@/components/ui/separator";

// ─────────────────────────────────────────────────────────────────────

export default function BookmarkPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-foreground">Bookmark</h1>
          {bookmarks.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {bookmarks.length} ayat
            </span>
          )}
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {bookmarks.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <BookmarkX className="w-16 h-16 text-muted-foreground/30 mb-4" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground mb-2">
            Belum ada bookmark
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Tap ikon bookmark{" "}
            <span className="text-amber-500">🔖</span> pada ayat mana saja
            untuk menyimpannya di sini.
          </p>
          <Link
            href="/"
            className="mt-6 px-5 py-2.5 rounded-xl bg-[oklch(0.6_0.14_196)] text-white text-sm font-medium hover:bg-[oklch(0.55_0.16_196)] transition-colors touch-no-highlight"
          >
            Mulai Membaca
          </Link>
        </div>
      ) : (
        /* Bookmark list */
        <section aria-label="Daftar bookmark">
          {bookmarks.map((bookmark, index) => (
            <div key={`${bookmark.surahNumber}:${bookmark.ayahNumber}`}>
              {/* Each bookmark is a tappable row that navigates to the ayah */}
              <div className="flex items-center px-4 py-4 hover:bg-muted/50 transition-colors group">
                {/* Navigate to the specific ayah */}
                <Link
                  href={`/surah/${bookmark.surahNumber}#ayah-${bookmark.ayahNumber}`}
                  className="flex-1 min-w-0 mr-3 touch-no-highlight"
                  aria-label={`Buka ${bookmark.surahName} ayat ${bookmark.ayahNumber}`}
                >
                  {/* Surah + ayah reference */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                        "bg-[oklch(0.95_0.03_196)] text-[oklch(0.6_0.14_196)]",
                        "dark:bg-[oklch(0.25_0.04_196)] dark:text-[oklch(0.7_0.1_196)]"
                      )}
                    >
                      {bookmark.surahName} {bookmark.surahNumber}:{bookmark.ayahNumber}
                    </span>
                  </div>

                  {/* Arabic text preview */}
                  {bookmark.arabicText && (
                    <p
                      className="arabic-text text-sm text-foreground line-clamp-2 mb-1"
                      dir="rtl"
                      lang="ar"
                    >
                      {bookmark.arabicText}
                    </p>
                  )}

                  {/* Timestamp */}
                  <p className="text-[10px] text-muted-foreground/60">
                    Disimpan {formatDate(bookmark.savedAt)}
                  </p>
                </Link>

                {/* Actions: navigate + delete */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Delete bookmark */}
                  <button
                    onClick={() =>
                      removeBookmark(bookmark.surahNumber, bookmark.ayahNumber)
                    }
                    aria-label={`Hapus bookmark ${bookmark.surahName} ${bookmark.surahNumber}:${bookmark.ayahNumber}`}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-lg",
                      "text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10",
                      "transition-colors duration-150 touch-no-highlight",
                      "opacity-0 group-hover:opacity-100"  // Only show on hover (desktop)
                    )}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <ChevronRight
                    className="w-4 h-4 text-muted-foreground/40"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Divider */}
              {index < bookmarks.length - 1 && (
                <Separator className="mx-4" />
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────

/**
 * Formats an ISO timestamp into a human-readable Indonesian date.
 * e.g. "13 Mei 2026"
 */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
