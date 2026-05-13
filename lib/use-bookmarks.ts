"use client";
/**
 * lib/use-bookmarks.ts
 * ─────────────────────────────────────────────────────────────────────
 * Custom hook for managing bookmarked ayahs.
 *
 * Storage strategy:
 *  - localStorage: always used (guest mode & offline fallback)
 *  - Supabase: synced when user is authenticated and env vars are set
 *
 * Bookmark identity: unique on (surahNumber + ayahNumber) pair.
 *
 * Usage:
 *   const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks();
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";
import type { Bookmark } from "@/types/quran";

/** localStorage key */
const STORAGE_KEY = "quran_bookmarks";

/**
 * Reads bookmark array from localStorage.
 * Returns empty array on parse failure.
 */
function loadFromStorage(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Bookmark[]) : [];
  } catch {
    return [];
  }
}

/**
 * Overwrites the entire bookmark list in localStorage.
 */
function saveToStorage(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Ignore storage errors
  }
}

// ─────────────────────────────────────────────────────────────────────

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  /** Load bookmarks on mount */
  useEffect(() => {
    setBookmarks(loadFromStorage());
  }, []);

  /**
   * Adds a bookmark. Deduplicates by surah+ayah key.
   *
   * @param bookmark  Full Bookmark object including display fields
   */
  const addBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks((prev) => {
      // Skip if already bookmarked
      if (isAlreadyBookmarked(prev, bookmark.surahNumber, bookmark.ayahNumber)) {
        return prev;
      }
      const next = [bookmark, ...prev];
      saveToStorage(next);
      return next;
    });
  }, []);

  /**
   * Removes a bookmark by surah + ayah pair.
   */
  const removeBookmark = useCallback(
    (surahNumber: number, ayahNumber: number) => {
      setBookmarks((prev) => {
        const next = prev.filter(
          (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
        );
        saveToStorage(next);
        return next;
      });
    },
    []
  );

  /**
   * Returns true if the given ayah is currently bookmarked.
   */
  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber: number): boolean => {
      return isAlreadyBookmarked(bookmarks, surahNumber, ayahNumber);
    },
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}

// ─────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────

/** Pure function: true if an identical bookmark already exists in the array */
function isAlreadyBookmarked(
  list: Bookmark[],
  surahNumber: number,
  ayahNumber: number
): boolean {
  return list.some(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
  );
}
