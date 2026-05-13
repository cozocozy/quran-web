/**
 * app/loading.tsx — Home Page Skeleton
 * ─────────────────────────────────────────────────────────────────────
 * Shown by Next.js while the server component (page.tsx) is streaming.
 * Mirrors the exact layout of the home page to prevent content shift.
 * ─────────────────────────────────────────────────────────────────────
 */

import { Skeleton } from "@/components/ui/skeleton";
import { SurahListItemSkeleton } from "@/components/SurahListItem";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar skeleton ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <Skeleton className="h-6 w-24 skeleton-pulse" />
          <div className="flex gap-1">
            <Skeleton className="w-9 h-9 rounded-xl skeleton-pulse" />
            <Skeleton className="w-9 h-9 rounded-xl skeleton-pulse" />
          </div>
        </div>
      </div>

      {/* ── Last read card skeleton ──────────────────────────────────── */}
      <div className="mx-4 mt-4 rounded-2xl bg-muted p-5 skeleton-pulse h-28" />

      {/* ── Section header skeleton ──────────────────────────────────── */}
      <div className="px-4 mt-6 mb-3 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 skeleton-pulse" />
        <Skeleton className="h-3 w-12 skeleton-pulse" />
      </div>

      {/* ── 12 surah row skeletons ───────────────────────────────────── */}
      <div className="border-t border-border">
        {Array.from({ length: 12 }).map((_, i) => (
          <SurahListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
