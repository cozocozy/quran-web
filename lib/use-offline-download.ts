"use client";
/**
 * lib/use-offline-download.ts
 * ─────────────────────────────────────────────────────────────────────
 * Hook untuk mengelola download manual data Quran ke IndexedDB.
 *
 * Strategi anti-rate-limit:
 *  - Download dikelompokkan per batch (BATCH_SIZE surah)
 *  - Delay antar request: REQUEST_DELAY ms
 *  - Delay antar batch: BATCH_DELAY ms
 *  - Jika gagal (termasuk 429), retry dengan exponential backoff
 *  - Surah yang sudah di-cache di-skip otomatis (resume-friendly)
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveSurah,
  getCachedSurahCount,
  getCachedSurahNumbers,
  clearOfflineData,
} from "./offline-storage";
import { getSurahWithTranslation } from "./quran-api";

// ─── Config ──────────────────────────────────────────────────────────

/** Jumlah surah per batch sebelum jeda panjang */
const BATCH_SIZE = 3;
/** Delay antar setiap request (ms) — 1.5 detik = ~40 req/menit */
const REQUEST_DELAY = 1500;
/** Jeda antar batch (ms) — beri napas server */
const BATCH_DELAY = 6000;
/** Maksimum retry per surah sebelum di-skip */
const MAX_RETRIES = 5;

// ─── Types ────────────────────────────────────────────────────────────

export type DownloadStatus = "idle" | "downloading" | "done" | "error";

export interface OfflineDownloadState {
  status: DownloadStatus;
  /** Jumlah surah yang sudah berhasil di-download dalam sesi ini */
  downloaded: number;
  /** Total target (selalu 114) */
  total: number;
  /** Jumlah surah yang ada di IndexedDB */
  cachedCount: number;
  /** Apakah semua 114 surah sudah tersedia offline? */
  isFullyAvailable: boolean;
  /** Pesan error jika status === 'error' */
  errorMessage: string | null;
}

export interface UseOfflineDownload {
  state: OfflineDownloadState;
  startDownload: () => Promise<void>;
  cancelDownload: () => void;
  deleteOfflineData: () => Promise<void>;
}

const TOTAL_SURAHS = 114;

// ─────────────────────────────────────────────────────────────────────

export function useOfflineDownload(): UseOfflineDownload {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [downloaded, setDownloaded] = useState(0);
  const [cachedCount, setCachedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** Ref untuk cancel signal */
  const cancelledRef = useRef(false);

  /** Load jumlah cache saat mount */
  useEffect(() => {
    getCachedSurahCount()
      .then(setCachedCount)
      .catch(() => setCachedCount(0));
  }, []);

  // ─── Start download ───────────────────────────────────────────────

  const startDownload = useCallback(async () => {
    if (status === "downloading") return;

    cancelledRef.current = false;
    setStatus("downloading");
    setErrorMessage(null);

    try {
      // Ambil surah yang sudah di-cache agar bisa di-skip (resume)
      const alreadyCached = new Set(await getCachedSurahNumbers());
      let sessionCount = alreadyCached.size;
      setDownloaded(sessionCount);

      for (let surahNum = 1; surahNum <= TOTAL_SURAHS; surahNum++) {
        if (cancelledRef.current) {
          setStatus("idle");
          setCachedCount(await getCachedSurahCount());
          return;
        }

        // Skip surah yang sudah ada di IndexedDB
        if (alreadyCached.has(surahNum)) continue;

        // Download dengan retry + exponential backoff
        let success = false;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          if (cancelledRef.current) break;
          try {
            const surah = await getSurahWithTranslation(surahNum);
            await saveSurah(surah);
            sessionCount++;
            setDownloaded(sessionCount);
            success = true;
            break;
          } catch (err) {
            const backoff = REQUEST_DELAY * 2 ** attempt; // 600, 1200, 2400ms
            console.warn(
              `[Offline] Surah ${surahNum} gagal (attempt ${attempt + 1}/${MAX_RETRIES}), retry dalam ${backoff}ms…`,
              err
            );
            await sleep(backoff);
          }
        }

        if (!success) {
          console.warn(`[Offline] Surah ${surahNum} di-skip setelah ${MAX_RETRIES}x retry.`);
        }

        // Jeda antar request
        await sleep(REQUEST_DELAY);

        // Jeda lebih panjang setelah setiap batch
        const positionInBatch = surahNum % BATCH_SIZE;
        if (positionInBatch === 0 && surahNum < TOTAL_SURAHS) {
          await sleep(BATCH_DELAY);
        }
      }

      const finalCount = await getCachedSurahCount();
      setCachedCount(finalCount);
      setStatus(finalCount >= TOTAL_SURAHS ? "done" : "error");
      if (finalCount < TOTAL_SURAHS) {
        setErrorMessage(
          `${TOTAL_SURAHS - finalCount} surah gagal diunduh. Tekan "Lanjutkan" untuk retry.`
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Download gagal, coba lagi."
      );
      setStatus("error");
    }
  }, [status]);

  // ─── Cancel ───────────────────────────────────────────────────────

  const cancelDownload = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  // ─── Delete ───────────────────────────────────────────────────────

  const deleteOfflineData = useCallback(async () => {
    await clearOfflineData();
    setCachedCount(0);
    setDownloaded(0);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────

  const isFullyAvailable = cachedCount >= TOTAL_SURAHS;

  return {
    state: {
      status,
      downloaded,
      total: TOTAL_SURAHS,
      cachedCount,
      isFullyAvailable,
      errorMessage,
    },
    startDownload,
    cancelDownload,
    deleteOfflineData,
  };
}

// ─── Helper ───────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
