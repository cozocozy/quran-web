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

import { INDONESIAN_SURAH_NAMES } from "./surah-names";

// Lazy import offline storage (client-side only)
async function getOfflineStorage() {
  if (typeof window === "undefined") return null;
  try {
    return await import("./offline-storage");
  } catch {
    return null;
  }
}

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
/**
 * Internal fetch wrapper with retry logic.
 * Useful for build time where we might hit rate limits.
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  retries = 5
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        cache: "force-cache",
        ...options,
      });

      if (!res.ok) {
        if (res.status === 429 && i < retries - 1) {
          // Rate limited — tunggu 15 detik sebelum retry
          const waitMs = 15000;
          console.warn(`[API] Rate limited (429), tunggu ${waitMs / 1000}s... (attempt ${i + 1}/${retries})`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        throw new Error(`API error: ${res.status} — ${url}`);
      }

      const json = await res.json();
      if (json.code !== 200) throw new Error(`API error code ${json.code}`);
      
      return json.data as T;
    } catch (error) {
      if (i === retries - 1) throw error;
      // Untuk error selain 429, tunggu lebih pendek
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  throw new Error("API Fetch failed after retries");
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
    // Replace default englishName with standard Indonesian transliteration
    englishName: INDONESIAN_SURAH_NAMES[s.number] || s.englishName,
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
 *
 * Offline-first strategy:
 *  1. Jika ada cache di IndexedDB → pakai cache (works offline)
 *  2. Jika tidak ada / online → fetch dari API lalu simpan ke cache
 *
 * @param surahNumber  Surah number 1–114
 * @returns Structured surah object with paired ayahs
 */
export async function getSurahWithTranslation(
  surahNumber: number
): Promise<SurahWithTranslation> {
  // ── 1. Cek cache IndexedDB dulu (client-side only) ─────────────────
  if (typeof window !== "undefined") {
    try {
      const offline = await getOfflineStorage();
      if (offline) {
        const cached = await offline.getCachedSurah(surahNumber);
        if (cached) return cached;
      }
    } catch {
      // Jika IndexedDB error, lanjut ke network
    }
  }

  // ── 2. Fetch dari API ──────────────────────────────────────────────
  const editions = `${EDITIONS.arabic},${EDITIONS.indonesian}`;
  const data = await apiFetch<SurahEdition[]>(
    `/surah/${surahNumber}/editions/${editions}`
  );

  // Ensure we get the correct edition regardless of array order
  const arabicEdition = data.find((e) => e.edition.identifier === EDITIONS.arabic) || data[0];
  const indonesianEdition = data.find((e) => e.edition.identifier === EDITIONS.indonesian) || data[1];

  // The exact Bismillah prefix used by Al-Quran Cloud (quran-uthmani edition)
  const BISMILLAH_PREFIX = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ";

  // Zip the two ayah arrays by index (same surah → same length)
  const ayahs: AyahWithTranslation[] = arabicEdition.ayahs.map((arabicAyah, i) => {
    let arabicText = arabicAyah.text;

    // The API prepends Bismillah to the first ayah of every surah (except 1 and 9).
    // We already show Bismillah as a separate header, so we strip it here to avoid duplication.
    if (arabicEdition.number !== 1 && arabicEdition.number !== 9 && arabicAyah.numberInSurah === 1) {
      if (arabicText.startsWith(BISMILLAH_PREFIX)) {
        arabicText = arabicText.substring(BISMILLAH_PREFIX.length);
      } else if (arabicText.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ")) {
        arabicText = arabicText.substring("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ".length);
      }
    }

    return {
      number: arabicAyah.numberInSurah,
      numberInQuran: arabicAyah.number,
      arabic: arabicText,
      translation: indonesianEdition.ayahs[i]?.text ?? "",
      sajda: arabicAyah.sajda,
      page: arabicAyah.page,
      juz: arabicAyah.juz,
    };
  });

  return {
    number: arabicEdition.number,
    name: arabicEdition.name,
    // Replace default englishName with standard Indonesian transliteration
    englishName: INDONESIAN_SURAH_NAMES[arabicEdition.number] || arabicEdition.englishName,
    englishNameTranslation: arabicEdition.englishNameTranslation,
    revelationType: arabicEdition.revelationType,
    numberOfAyahs: arabicEdition.numberOfAyahs,
    ayahs,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Full Quran Bulk Download
// ─────────────────────────────────────────────────────────────────────

/**
 * Mengambil keseluruhan Quran (114 surah) dalam satu request.
 * Digunakan untuk fitur Download Offline agar terhindar dari rate-limit
 * karena mengambil surah satu per satu.
 */
export async function getFullQuranOffline(): Promise<SurahWithTranslation[]> {
  // Ambil seluruh quran versi bahasa arab dan terjemahannya (2 request)
  const [arabicRes, indoRes] = await Promise.all([
    apiFetch<{ surahs: SurahEdition[] }>(`/quran/${EDITIONS.arabic}`),
    apiFetch<{ surahs: SurahEdition[] }>(`/quran/${EDITIONS.indonesian}`),
  ]);

  const arabicSurahs = arabicRes.surahs;
  const indoSurahs = indoRes.surahs;

  const BISMILLAH_PREFIX = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ";

  return arabicSurahs.map((arabicSurah, surahIndex) => {
    const indonesianSurah = indoSurahs[surahIndex];

    const ayahs: AyahWithTranslation[] = arabicSurah.ayahs.map((arabicAyah, i) => {
      let arabicText = arabicAyah.text;

      // Hapus Bismillah di awal ayat pertama (kecuali Al-Fatihah dan At-Taubah)
      if (arabicSurah.number !== 1 && arabicSurah.number !== 9 && arabicAyah.numberInSurah === 1) {
        if (arabicText.startsWith(BISMILLAH_PREFIX)) {
          arabicText = arabicText.substring(BISMILLAH_PREFIX.length);
        } else if (arabicText.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ")) {
          arabicText = arabicText.substring("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ".length);
        }
      }

      return {
        number: arabicAyah.numberInSurah,
        numberInQuran: arabicAyah.number,
        arabic: arabicText,
        translation: indonesianSurah.ayahs[i]?.text ?? "",
        sajda: arabicAyah.sajda,
        page: arabicAyah.page,
        juz: arabicAyah.juz,
      };
    });

    return {
      number: arabicSurah.number,
      name: arabicSurah.name,
      englishName: INDONESIAN_SURAH_NAMES[arabicSurah.number] || arabicSurah.englishName,
      englishNameTranslation: arabicSurah.englishNameTranslation,
      revelationType: arabicSurah.revelationType,
      numberOfAyahs: arabicSurah.numberOfAyahs,
      ayahs,
    };
  });
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
