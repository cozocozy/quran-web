"use client";
/**
 * components/SurahListItem.tsx
 * ─────────────────────────────────────────────────────────────────────
 * A single row in the surah list on the home page.
 *
 * Layout (mobile-first):
 *   [Number Badge] [Latin name / Translation / Ayah count]   [Arabic name] [›]
 *
 * The entire row is a Next.js Link with a minimum height of 64px
 * to satisfy mobile touch target guidelines.
 * ─────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { SurahListItem as SurahListItemType } from "@/types/quran";

// ─── Main Component ───────────────────────────────────────────────────

interface SurahListItemProps {
  surah: SurahListItemType;
  /** Optional: highlight matching text in Latin name */
  searchQuery?: string;
}

export default function SurahListItem({ surah, searchQuery }: SurahListItemProps) {
  return (
    <Link
      href={`/surah/${surah.number}`}
      className={cn(
        // Full-width tappable row
        "flex items-center gap-3 px-4 min-h-[64px] w-full",
        "border-b border-border last:border-b-0",
        "hover:bg-muted/50 active:bg-muted transition-colors duration-150",
        "touch-no-highlight"
      )}
    >
      {/* ── Left: Number badge ────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg",
          "flex items-center justify-center",
          "bg-[oklch(0.95_0.03_196)] dark:bg-[oklch(0.25_0.04_196)]",
          "text-[oklch(0.6_0.14_196)] text-sm font-semibold"
        )}
        aria-hidden="true"
      >
        {surah.number}
      </div>

      {/* ── Center: Latin name + translation + stats ──────────────────── */}
      <div className="flex-1 min-w-0 py-2">
        {/* Surah Latin name — highlight matched query */}
        <p className="text-base font-bold text-foreground leading-tight truncate">
          {searchQuery
            ? highlightMatch(surah.englishName, searchQuery)
            : surah.englishName}
        </p>
        {/* Removed translation as requested */}
        {/* Meta: revelation type + ayah count */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">
            {surah.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"}
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-[10px] text-muted-foreground/70">
            {surah.numberOfAyahs} ayat
          </span>
        </div>
      </div>

      {/* ── Right: Arabic name + chevron ──────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p
          className="arabic-title text-xl text-foreground"
          dir="rtl"
          lang="ar"
        >
          {surah.name}
        </p>
        <ChevronRight
          className="w-4 h-4 text-muted-foreground/50"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

// ─── Skeleton Variant ─────────────────────────────────────────────────

/**
 * SurahListItemSkeleton — placeholder shown while surah list loads.
 * Mimics the real item's layout to prevent content shift.
 */
export function SurahListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 min-h-[64px] border-b border-border">
      {/* Number badge */}
      <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0 skeleton-pulse" />
      {/* Text block */}
      <div className="flex-1 py-2 space-y-1.5">
        <Skeleton className="h-3.5 w-28 skeleton-pulse" />
        <Skeleton className="h-3 w-20 skeleton-pulse" />
        <Skeleton className="h-2.5 w-16 skeleton-pulse" />
      </div>
      {/* Arabic name */}
      <Skeleton className="h-5 w-20 skeleton-pulse" />
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────

/**
 * Wraps the matched portion of a string in a highlighted <mark> tag.
 * Case-insensitive.
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-[oklch(0.95_0.03_196)] text-[oklch(0.5_0.14_196)] rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/** Escapes special regex characters in a user-provided string */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
