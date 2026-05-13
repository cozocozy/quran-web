/**
 * lib/quran-api.ts
 * ─────────────────────────────────────────────────────────────────────
 * Typed fetch helpers for the Al-Quran Cloud API (https://api.alquran.cloud/v1)
 *
 * Design decisions:
 * - All surah-list and full-surah data is fetched server-side with
 *   `cache: 'force-cache'` so Next.js caches it at build time (ISR).
 * - Functions throw on non-OK responses so callers can handle errors.
 * - No external fetch library — lean bundle.
 * ─────────────────────────────────────────────────────────────────────
 */

import type {
  Surah,
  SurahListItem,
  SurahWithTranslation,
  AyahWithTranslation,
  SurahEdition,
} from "@/types/quran";

/** Base URL for Al-Quran Cloud API v1 */
const BASE_URL = "https://api.alquran.cloud/v1";

/** Edition identifiers we use throughout the app */
const EDITIONS = {
  arabic: "quran-uthmani",       // Standard Uthmani Arabic text
  indonesian: "id.indonesian",   // Indonesian translation
} as const;

// ─────────────────────────────────────────────────────────────────────
// Helper: fetch with standardised error handling
// ─────────────────────────────────────────────────────────────────────

/**
 * Internal fetch wrapper.
 * Throws a descriptive error when the API returns a non-OK status.
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    cache: "force-cache",   // Aggressive caching — Quran text never changes
    ...options,
  });

  if (!res.ok) {
    throw new Error(
      `Al-Quran API error: ${res.status} ${res.statusText} — ${url}`
    );
  }

  const json = await res.json();

  // The API wraps all responses in { code, status, data }
  if (json.code !== 200) {
    throw new Error(`API responded with code ${json.code}: ${json.status}`);
  }

  return json.data as T;
}

// ─────────────────────────────────────────────────────────────────────
// Surah List
// ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the list of all 114 surahs (metadata only, no ayah text).
 * Cached indefinitely at the CDN/ISR level.
 *
 * @returns Array of SurahListItem sorted by surah number (1–114)
 */
export async function getSurahList(): Promise<SurahListItem[]> {
  const data = await apiFetch<Surah[]>("/surah");
  // API already returns them in order, but we map to keep our type lean
  return data.map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishNameTranslation: s.englishNameTranslation,
    numberOfAyahs: s.numberOfAyahs,
    revelationType: s.revelationType,
  }));
}

// ─────────────────────────────────────────────────────────────────────
// Full Surah with Translation
// ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a complete surah with both Arabic text and Indonesian translation.
 * The API returns an array of two edition objects — we zip them into
 * a paired `AyahWithTranslation[]` for easy rendering.
 *
 * @param surahNumber  Surah number 1–114
 * @returns Structured surah object with paired ayahs
 */
export async function getSurahWithTranslation(
  surahNumber: number
): Promise<SurahWithTranslation> {
  const editions = `${EDITIONS.arabic},${EDITIONS.indonesian}`;
  const data = await apiFetch<SurahEdition[]>(
    `/surah/${surahNumber}/editions/${editions}`
  );

  // data[0] = Arabic (quran-uthmani), data[1] = Indonesian translation
  const arabicEdition = data[0];
  const indonesianEdition = data[1];

  // Zip the two ayah arrays by index (same surah → same length)
  const ayahs: AyahWithTranslation[] = arabicEdition.ayahs.map((arabicAyah, i) => ({
    number: arabicAyah.number,
    numberInQuran: arabicAyah.numberInQuran,
    arabic: arabicAyah.text,
    translation: indonesianEdition.ayahs[i]?.text ?? "",
    sajda: arabicAyah.sajda,
    page: arabicAyah.page,
    juz: arabicAyah.juz,
  }));

  return {
    number: arabicEdition.number,
    name: arabicEdition.name,
    englishName: arabicEdition.englishName,
    englishNameTranslation: arabicEdition.englishNameTranslation,
    revelationType: arabicEdition.revelationType,
    numberOfAyahs: arabicEdition.numberOfAyahs,
    ayahs,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Client-side Search
// ─────────────────────────────────────────────────────────────────────

/**
 * Filters a pre-fetched surah list by a search query.
 * Matches against the Arabic name, English transliteration, and translation.
 * Designed to run client-side (no API call) for instant results.
 *
 * @param surahs  Full list of 114 surahs (already fetched)
 * @param query   Search string from the user
 * @returns Filtered array of matching surahs
 */
export function filterSurahs(
  surahs: SurahListItem[],
  query: string
): SurahListItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return surahs;

  return surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.name.includes(query) ||               // Arabic — case-sensitive
      String(s.number).includes(q)            // Search by surah number
  );
}

// ─────────────────────────────────────────────────────────────────────
// Audio URL Helper
// ─────────────────────────────────────────────────────────────────────

/**
 * Returns the CDN URL for a single ayah's recitation audio.
 * Uses Sheikh Mishary Rashid Al-Afasy (128kbps MP3).
 *
 * @param globalAyahNumber  The ayah's sequential number (1–6236)
 */
export function getAudioUrl(globalAyahNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
}
