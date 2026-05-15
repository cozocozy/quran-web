"use client";
/**
 * app/settings/page.tsx — Settings Page
 * ─────────────────────────────────────────────────────────────────────
 * User preferences — all persisted to localStorage via useSettings hook.
 *
 * Controls:
 *  1. Arabic font size: Small / Medium / Large
 *  2. Show/hide Indonesian translation (Switch)
 *  3. Theme: Light / Dark / System
 *  4. Offline Mode: Download / Delete data Quran
 * ─────────────────────────────────────────────────────────────────────
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/use-settings";
import { useOfflineDownload } from "@/lib/use-offline-download";
import { Separator } from "@/components/ui/separator";
import type { FontSize, Theme } from "@/types/quran";

// ─────────────────────────────────────────────────────────────────────

/** Font size options for the segmented control */
const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Kecil" },
  { value: "md", label: "Sedang" },
  { value: "lg", label: "Besar" },
];

/** Theme options */
const THEME_OPTIONS: { value: Theme; label: string; emoji: string }[] = [
  { value: "light", label: "Terang", emoji: "☀️" },
  { value: "dark", label: "Gelap", emoji: "🌙" },
  { value: "system", label: "Sistem", emoji: "⚙️" },
];

/** Map font size value to CSS class for live preview */
const PREVIEW_CLASS: Record<FontSize, string> = {
  sm: "arabic-text-sm",
  md: "arabic-text-md",
  lg: "arabic-text-lg",
};

// ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, setFontSize, setTheme } = useSettings();
  const { state, startDownload, cancelDownload, deleteOfflineData } =
    useOfflineDownload();

  const progressPercent =
    state.status === "downloading" && state.total > 0
      ? Math.round((state.downloaded / state.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* ── Arabic Font Size ────────────────────────────────────────── */}
        <section aria-labelledby="font-size-heading">
          <h2
            id="font-size-heading"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3"
          >
            Ukuran Font Arab
          </h2>

          <div
            role="radiogroup"
            aria-label="Ukuran font Arab"
            className="flex bg-muted rounded-xl p-1 gap-1"
          >
            {FONT_SIZE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                role="radio"
                aria-checked={settings.fontSize === value}
                onClick={() => setFontSize(value)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  "min-h-[44px] touch-no-highlight",
                  settings.fontSize === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Live Arabic text preview */}
          <div className="mt-4 p-4 rounded-xl border border-border bg-background">
            <p className="text-[10px] text-muted-foreground mb-2">Preview:</p>
            <p
              className={cn(
                "arabic-text text-foreground",
                PREVIEW_CLASS[settings.fontSize]
              )}
              dir="rtl"
              lang="ar"
            >
              قُلْ هُوَ اللَّهُ أَحَدٌ
            </p>
            <p className="text-sm text-muted-foreground mt-2 border-l-2 border-[oklch(0.6_0.14_196)]/30 pl-3">
              Katakanlah: Dialah Allah, Yang Maha Esa.
            </p>
          </div>
        </section>

        <Separator />


        {/* ── Theme ────────────────────────────────────────────────────── */}
        <section aria-labelledby="theme-heading">
          <h2
            id="theme-heading"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3"
          >
            Tema Tampilan
          </h2>

          <div
            role="radiogroup"
            aria-label="Tema tampilan"
            className="flex bg-muted rounded-xl p-1 gap-1"
          >
            {THEME_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                role="radio"
                aria-checked={settings.theme === value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium rounded-lg",
                  "transition-all duration-200 min-h-[44px] touch-no-highlight",
                  settings.theme === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base" aria-hidden="true">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Offline Mode ─────────────────────────────────────────────── */}
        <section aria-labelledby="offline-heading">
          <h2
            id="offline-heading"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3"
          >
            Mode Offline
          </h2>

          {/* Status card */}
          <div className="rounded-xl border border-border bg-background p-4 space-y-4">

            {/* Status badge */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Data Al-Quran Offline
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {state.isFullyAvailable
                    ? `${state.cachedCount} surah tersedia offline`
                    : state.cachedCount > 0
                    ? `${state.cachedCount}/114 surah tersimpan`
                    : "Belum ada data offline"}
                </p>
              </div>

              {/* Status indicator dot */}
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    state.isFullyAvailable
                      ? "bg-green-500"
                      : state.status === "downloading"
                      ? "bg-amber-400 animate-pulse"
                      : "bg-muted-foreground/40"
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {state.isFullyAvailable
                    ? "Siap"
                    : state.status === "downloading"
                    ? "Mengunduh..."
                    : "Belum siap"}
                </span>
              </div>
            </div>

            {/* Progress bar (saat downloading) */}
            {state.status === "downloading" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Surah {state.downloaded} / {state.total}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[oklch(0.6_0.14_196)] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                  ⏱️ Download dilambatkan agar tidak terkena limit API. Proses ~3–5 menit. Jangan tutup halaman ini.
                </p>
              </div>
            )}

            {/* Error message */}
            {state.status === "error" && state.errorMessage && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                ⚠️ {state.errorMessage}
              </p>
            )}

            {/* Done message */}
            {state.status === "done" && (
              <div className="flex flex-col items-center justify-center py-5 px-4 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-950/20 dark:to-transparent rounded-xl border border-green-100 dark:border-green-900/30">
                <div className="relative w-20 h-20 mb-4 rounded-2xl overflow-hidden shadow-lg bg-white">
                  <Image
                    src="/quran-icon.png"
                    alt="Al-Quran Offline"
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 80px) 100vw, 80px"
                  />
                </div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400 text-center">
                  Alhamdulillah, Siap Offline!
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-500/80 mt-1.5 text-center max-w-[200px] leading-relaxed">
                  Semua {state.cachedCount} surah telah tersimpan dan bisa dibaca tanpa koneksi internet.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              {state.status === "downloading" ? (
                <button
                  onClick={cancelDownload}
                  id="cancel-download-btn"
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400",
                    "border border-red-200 dark:border-red-800",
                    "active:scale-[0.98]"
                  )}
                >
                  Batalkan
                </button>
              ) : (
                <button
                  onClick={startDownload}
                  id="start-download-btn"
                  disabled={state.isFullyAvailable}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    "active:scale-[0.98]",
                    state.isFullyAvailable
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-[oklch(0.6_0.14_196)] text-white hover:bg-[oklch(0.55_0.14_196)] shadow-sm"
                  )}
                >
                  {state.isFullyAvailable
                    ? "✅ Sudah Diunduh"
                    : state.cachedCount > 0
                    ? `Lanjutkan (${state.cachedCount}/114)`
                    : "📥 Unduh untuk Offline"}
                </button>
              )}

              {/* Tombol hapus — hanya muncul jika ada data */}
              {state.cachedCount > 0 && state.status !== "downloading" && (
                <button
                  onClick={deleteOfflineData}
                  id="delete-offline-btn"
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    "bg-muted text-muted-foreground hover:text-red-500 hover:bg-red-50",
                    "dark:hover:bg-red-950/30 active:scale-[0.98]"
                  )}
                  aria-label="Hapus data offline"
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Info */}
            {!state.isFullyAvailable && state.status === "idle" && (
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unduh seluruh Al-Quran (~5–10 MB) agar bisa dibaca tanpa koneksi internet.
                Proses membutuhkan beberapa menit.
              </p>
            )}
          </div>
        </section>

        <Separator />

        {/* ── About ─────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Tentang
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Data Quran</span>:{" "}
              <a
                href="https://api.alquran.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[oklch(0.6_0.14_196)] underline-offset-2 hover:underline"
              >
                Al-Quran Cloud API
              </a>
            </p>
            <p>
              <span className="font-medium text-foreground">Murottal</span>: Sheikh
              Mishary Rashid Al-Afasy via Islamic Network CDN
            </p>
            <p>
              <span className="font-medium text-foreground">Font Arab</span>: Amiri
              Quran (Google Fonts)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}



