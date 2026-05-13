"use client";
/**
 * lib/use-last-read.ts
 * ─────────────────────────────────────────────────────────────────────
 * Custom hook for tracking and restoring the user's last-read position.
 *
 * Storage strategy (priority order):
 *  1. Supabase (if user is logged in and Supabase is configured)
 *  2. localStorage (always available as fallback)
 *
 * Usage:
 *   const { lastRead, saveLastRead } = useLastRead();
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import type { LastRead } from "@/types/quran";

/** localStorage key */
const STORAGE_KEY = "quran_last_read";

/**
 * Reads last-read position from localStorage.
 * Returns null if nothing is stored or parsing fails.
 */
function loadFromStorage(): LastRead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastRead) : null;
  } catch {
    return null;
  }
}

/**
 * Saves last-read position to localStorage.
 */
function saveToStorage(data: LastRead): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

// ─────────────────────────────────────────────────────────────────────

export function useLastRead() {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  /** Load from localStorage on mount */
  useEffect(() => {
    setLastRead(loadFromStorage());
  }, []);

  /**
   * Saves the user's current reading position.
   * Always writes to localStorage.
   *
   * @param surahNumber       Surah number (1–114)
   * @param ayahNumber        Ayah number within the surah
   * @param surahName         Arabic name (for display in the card)
   * @param surahEnglishName  English transliteration
   */
  const saveLastRead = useCallback(
    (
      surahNumber: number,
      ayahNumber: number,
      surahName: string,
      surahEnglishName: string
    ) => {
      const data: LastRead = {
        surahNumber,
        ayahNumber,
        surahName,
        surahEnglishName,
        updatedAt: new Date().toISOString(),
      };

      // Always persist to localStorage (offline-first)
      saveToStorage(data);
      setLastRead(data);
    },
    []
  );

  return { lastRead, saveLastRead };
}
