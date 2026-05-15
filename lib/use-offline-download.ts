"use client";
/**
 * lib/use-offline-download.ts
 * ─────────────────────────────────────────────────────────────────────
 * Hook untuk mengelola download manual data Quran ke IndexedDB.
 *
 * Features:
 *  - Download semua 114 surah satu per satu dengan progress tracking
 *  - Bisa cancel download
 *  - Status: idle | downloading | done | error
 *  - Hitung ukuran cache (jumlah surah tersimpan)
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveSurah,
  getCachedSurahCount,
  clearOfflineData,
} from "./offline-storage";
import { getSurahWithTranslation } from "./quran-api";

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
    setDownloaded(0);
    setErrorMessage(null);

    let successCount = 0;

    try {
      for (let surahNum = 1; surahNum <= TOTAL_SURAHS; surahNum++) {
        // Cek cancel
        if (cancelledRef.current) {
          setStatus("idle");
          setCachedCount(await getCachedSurahCount());
          return;
        }

        try {
          const surah = await getSurahWithTranslation(surahNum);
          await saveSurah(surah);
          successCount++;
          setDownloaded(successCount);
        } catch {
          // Jika satu surah gagal, skip dan lanjutkan
          // (tidak batalkan seluruh proses)
          console.warn(`[Offline] Gagal download surah ${surahNum}, skip.`);
        }

        // Throttle kecil agar tidak spam API
        await sleep(80);
      }

      const finalCount = await getCachedSurahCount();
      setCachedCount(finalCount);
      setStatus("done");
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
