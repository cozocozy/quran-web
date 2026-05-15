/**
 * lib/offline-storage.ts
 * ─────────────────────────────────────────────────────────────────────
 * IndexedDB layer via Dexie.js for offline Quran data storage.
 *
 * Schema:
 *  - surahs: full surah data (Arabic + terjemah) per nomor surah
 *  - meta:   key-value store untuk status download
 * ─────────────────────────────────────────────────────────────────────
 */

import Dexie, { type Table } from "dexie";
import type { SurahWithTranslation } from "@/types/quran";

// ─── Types ────────────────────────────────────────────────────────────

export interface OfflineSurah {
  number: number; // primary key
  data: SurahWithTranslation;
  cachedAt: number; // timestamp ms
}

export interface OfflineMeta {
  key: string; // primary key
  value: string | number | boolean;
}

// ─── Database class ───────────────────────────────────────────────────

class QuranOfflineDB extends Dexie {
  surahs!: Table<OfflineSurah, number>;
  meta!: Table<OfflineMeta, string>;

  constructor() {
    super("QuranOfflineDB");
    this.version(1).stores({
      surahs: "number, cachedAt",
      meta: "key",
    });
  }
}

// Singleton — lazy init (client-side only)
let _db: QuranOfflineDB | null = null;

function getDB(): QuranOfflineDB {
  if (!_db) _db = new QuranOfflineDB();
  return _db;
}

// ─── Public API ───────────────────────────────────────────────────────

/** Simpan satu surah ke IndexedDB */
export async function saveSurah(surah: SurahWithTranslation): Promise<void> {
  const db = getDB();
  await db.surahs.put({
    number: surah.number,
    data: surah,
    cachedAt: Date.now(),
  });
}

/** Ambil satu surah dari IndexedDB. Returns null jika belum di-cache. */
export async function getCachedSurah(
  number: number
): Promise<SurahWithTranslation | null> {
  const db = getDB();
  const row = await db.surahs.get(number);
  return row?.data ?? null;
}

/** Jumlah surah yang sudah di-cache */
export async function getCachedSurahCount(): Promise<number> {
  const db = getDB();
  return db.surahs.count();
}

/** Daftar nomor surah yang sudah di-cache */
export async function getCachedSurahNumbers(): Promise<number[]> {
  const db = getDB();
  const rows = await db.surahs.orderBy("number").primaryKeys();
  return rows as number[];
}

/** Hapus semua data offline */
export async function clearOfflineData(): Promise<void> {
  const db = getDB();
  await db.transaction("rw", db.surahs, db.meta, async () => {
    await db.surahs.clear();
    await db.meta.clear();
  });
}

/** Apakah surah sudah di-cache? */
export async function isSurahCached(number: number): Promise<boolean> {
  const db = getDB();
  const count = await db.surahs.where("number").equals(number).count();
  return count > 0;
}
