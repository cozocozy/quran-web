"use client";
/**
 * app/settings/page.tsx — Settings Page
 * ─────────────────────────────────────────────────────────────────────
 * User preferences — all persisted to localStorage via useSettings hook.
 *
 * Controls:
 *  1. Arabic font size: Small / Medium / Large (segmented control)
 *  2. Show/hide Indonesian translation (Switch)
 *  3. Theme: Light / Dark / System (segmented control)
 *
 * Live preview: the Arabic text sample updates in real-time as
 * the user adjusts font size.
 * ─────────────────────────────────────────────────────────────────────
 */

import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/use-settings";
import { Switch } from "@/components/ui/switch";
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
  const { settings, setFontSize, setShowTranslation, setTheme } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      {/* Removed Top Bar to focus on bottom navigation */}

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* ── Arabic Font Size ────────────────────────────────────────── */}
        <section aria-labelledby="font-size-heading">
          <h2
            id="font-size-heading"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3"
          >
            Ukuran Font Arab
          </h2>

          {/* Segmented control */}
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
            {settings.showTranslation && (
              <p className="text-sm text-muted-foreground mt-2 border-l-2 border-[oklch(0.6_0.14_196)]/30 pl-3">
                Katakanlah: Dialah Allah, Yang Maha Esa.
              </p>
            )}
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
