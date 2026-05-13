/**
 * app/surah/[id]/loading.tsx — Surah Reader Skeleton
 * ─────────────────────────────────────────────────────────────────────
 * Shown while the surah server component streams data.
 * Matches the reader layout to prevent content shift.
 * ─────────────────────────────────────────────────────────────────────
 */

import { Skeleton } from "@/components/ui/skeleton";
import { AyahCardSkeleton } from "@/components/AyahCard";

export default function SurahLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar skeleton */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center px-2 h-14 max-w-lg mx-auto gap-2">
          <Skeleton className="w-9 h-9 rounded-xl skeleton-pulse" />
          <div className="flex-1 flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-32 skeleton-pulse" />
            <Skeleton className="h-3 w-20 skeleton-pulse" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl skeleton-pulse" />
        </div>
      </div>

      {/* Info banner skeleton */}
      <div className="bg-muted/50 py-3 px-4 flex flex-col items-center gap-1.5">
        <Skeleton className="h-3 w-36 skeleton-pulse" />
        <Skeleton className="h-3 w-24 skeleton-pulse" />
      </div>

      {/* Bismillah skeleton */}
      <div className="py-6 px-4 border-b border-border flex flex-col items-center gap-2">
        <Skeleton className="h-8 w-56 skeleton-pulse" />
        <Skeleton className="h-3 w-48 skeleton-pulse" />
      </div>

      {/* 6 ayah card skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <AyahCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
