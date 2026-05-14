"use client";
/**
 * lib/use-settings.ts
 * ─────────────────────────────────────────────────────────────────────
 * Custom hook for managing user preferences (font size, translation,
 * theme). All settings are persisted to localStorage immediately on
 * change, and re-hydrated on mount.
 *
 * Usage:
 *   const { settings, setFontSize, setShowTranslation, setTheme } = useSettings();
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import type { UserSettings, FontSize, Theme, ReadingMode } from "@/types/quran";

/** localStorage key — keep single point of truth */
const STORAGE_KEY = "quran_app_settings";

/** Default values applied on first visit */
const DEFAULT_SETTINGS: UserSettings = {
  fontSize: "md",
  showTranslation: true,
  theme: "light",
  readingMode: "default",
};

/**
 * Reads settings from localStorage. Returns defaults if nothing is stored
 * or if JSON parsing fails (e.g., corrupted value).
 */
function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Persists settings object to localStorage.
 */
function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Silently ignore (e.g., private browsing storage quota exceeded)
  }
}

// ─────────────────────────────────────────────────────────────────────

export function useSettings() {
  // Initialise with defaults to avoid SSR mismatch; real values loaded on mount
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  /** Hydrate from localStorage after first render */
  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  /** Apply theme class to <html> element whenever theme changes */
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const isDark =
      settings.theme === "dark" ||
      (settings.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
  }, [settings.theme, mounted]);

  // ─── Setters (each persists the updated value immediately) ─────────

  /** Update Arabic font size preference */
  const setFontSize = useCallback((fontSize: FontSize) => {
    setSettings((prev) => {
      const next = { ...prev, fontSize };
      saveSettings(next);
      return next;
    });
  }, []);

  /** Toggle Indonesian translation visibility */
  const setShowTranslation = useCallback((showTranslation: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, showTranslation };
      saveSettings(next);
      return next;
    });
  }, []);

  /** Change colour theme */
  const setTheme = useCallback((theme: Theme) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      saveSettings(next);
      return next;
    });
  }, []);

  /** Change the default reading mode (persisted across sessions) */
  const setReadingMode = useCallback((readingMode: ReadingMode) => {
    setSettings((prev) => {
      const next = { ...prev, readingMode };
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    settings,
    mounted,          // Expose so components can avoid SSR hydration flicker
    setFontSize,
    setShowTranslation,
    setTheme,
    setReadingMode,
  };
}
