/**
 * types/quran.ts
 * ─────────────────────────────────────────────────────────────────────
 * TypeScript interfaces for the Al-Quran Cloud API (https://api.alquran.cloud/v1)
 * All types are derived from the actual API response shapes.
 * ─────────────────────────────────────────────────────────────────────
 */

// ─── Edition (API response shape for a specific text edition) ──────────────
export interface Edition {
  identifier: string;      // e.g. "quran-uthmani" or "id.indonesian"
  language: string;        // e.g. "ar" | "id"
  name: string;            // Human-readable edition name
  englishName: string;
  format: string;          // "text" | "audio"
  type: string;            // "quran" | "translation" | "tafsir"
  direction: "rtl" | "ltr" | null;
}

// ─── Surah metadata (used in list and full surah responses) ───────────────
export interface Surah {
  number: number;          // 1–114
  name: string;            // Arabic name e.g. "سُورَةُ ٱلْفَاتِحَةِ"
  englishName: string;     // Transliterated name e.g. "Al-Faatiha"
  englishNameTranslation: string; // e.g. "The Opening"
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

// ─── A single Ayah within a surah response ────────────────────────────────
export interface Ayah {
  number: number;          // Global sequential number (1–6236)
  text: string;            // The ayah text in the edition's language
  numberInSurah: number;   // Ayah number within the surah
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

// ─── Full surah data returned by the multi-edition endpoint ──────────────
export interface SurahEdition {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
  edition: Edition;
  ayahs: Ayah[];
}

// ─── Paired Arabic + Translation for a single ayah ────────────────────────
export interface AyahWithTranslation {
  number: number;          // Ayah number in the surah
  numberInQuran: number;   // Global number used for audio CDN
  arabic: string;          // Arabic text (from quran-uthmani edition)
  translation: string;     // Indonesian translation text
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
  page: number;
  juz: number;
}

// ─── Full structured surah with paired ayahs ─────────────────────────────
export interface SurahWithTranslation {
  number: number;
  name: string;            // Arabic script name
  englishName: string;     // Transliterated (e.g. "Al-Baqarah")
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
  ayahs: AyahWithTranslation[];
}

// ─── Lightweight surah item used in the home list ────────────────────────
export interface SurahListItem {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

// ─── Bookmark stored in localStorage or Supabase ─────────────────────────
export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;          // For display without re-fetching
  arabicText: string;         // First line of the ayah
  savedAt: string;            // ISO timestamp
}

// ─── Last-read position ───────────────────────────────────────────────────
export interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahEnglishName: string;
  updatedAt: string;          // ISO timestamp
}

// ─── User preferences stored in localStorage ─────────────────────────────
export type FontSize = "sm" | "md" | "lg";
export type Theme = "light" | "dark" | "system";

/**
 * ReadingMode — controls which content is shown in the Surah Reader.
 * - "default"     : Arabic text + Indonesian translation (standard view)
 * - "arabic"      : Arabic only, larger font, focused tilawah experience
 * - "translation" : Indonesian translation only, focused tadabbur
 */
export type ReadingMode = "default" | "arabic" | "translation";

export interface UserSettings {
  fontSize: FontSize;
  showTranslation: boolean;
  theme: Theme;
  /** Persistent reading mode preference — overridden per-session in SurahReader */
  readingMode: ReadingMode;
}
