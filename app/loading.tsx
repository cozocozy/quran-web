import Image from "next/image";

/**
 * app/loading.tsx — Premium Splash Screen
 * ─────────────────────────────────────────────────────────────────────
 * Shown during initial load or heavy transitions.
 * Features the modern Quran icon with floating and pulse animations.
 * ─────────────────────────────────────────────────────────────────────
 */

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6">
      {/* ── Branded Splash Content ──────────────────────────────────── */}
      <div className="flex flex-col items-center max-w-xs w-full animate-in fade-in zoom-in duration-500">
        
        {/* Animated Quran Icon */}
        <div className="relative w-32 h-32 mb-8 animate-bounce-slow">
          <Image
            src="/quran-icon.png"
            alt="Al-Quran Logo"
            fill
            priority
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Text branding */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="arabic-title text-3xl text-foreground opacity-90" dir="rtl" lang="ar">
            القرآن الكريم
          </h1>
          <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
            Al-Quran Web App
          </p>
        </div>

        {/* Minimal loading indicator */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[oklch(0.6_0.14_196)] to-transparent animate-shimmer" />
        </div>
        
        <p className="mt-4 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-[0.2em]">
          Menyiapkan bacaan...
        </p>
      </div>

      {/* ── Background decoration ────────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[oklch(0.6_0.14_196)]/10 blur-[100px] rounded-full -z-10 animate-pulse" />
    </div>
  );
}
