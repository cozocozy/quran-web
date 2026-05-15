/**
 * lib/use-offline-download.ts
 *
 * Hook untuk men-download dan menyimpan surah ke IndexedDB.
 * Menggunakan bulk download (getFullQuranOffline) agar lebih cepat dan terhindar
 * dari rate limit dibanding men-download surah satu per satu.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveSurah,
  getCachedSurahCount,
  getCachedSurahNumbers,
  clearOfflineData,
} from "./offline-storage";
import { getFullQuranOffline } from "./quran-api";

// --- Types ------------------------------------------------------------

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

// --- Hook -------------------------------------------------------------

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

  // --- Start download -------------------------------------------------

  const startDownload = useCallback(async () => {
    if (status === "downloading") return;

    cancelledRef.current = false;
    setStatus("downloading");
    setErrorMessage(null);

    try {
      // Ambil surah yang sudah di-cache agar bisa dicek 
      const alreadyCached = new Set(await getCachedSurahNumbers());
      let sessionCount = alreadyCached.size;
      setDownloaded(sessionCount);

      if (sessionCount === TOTAL_SURAHS) {
         setStatus("done");
         setCachedCount(TOTAL_SURAHS);
         return;
      }

      // Ambil seluruh Al-Quran dalam 2 request (menghindari rate limit)
      const allSurahs = await getFullQuranOffline();
      
      if (cancelledRef.current) {
        setStatus("idle");
        setCachedCount(await getCachedSurahCount());
        return;
      }

      // Simpan semua ke IndexedDB
      for (let i = 0; i < allSurahs.length; i++) {
        if (cancelledRef.current) break;

        const surah = allSurahs[i];
        if (alreadyCached.has(surah.number)) {
          continue;
        }

        await saveSurah(surah);
        sessionCount++;
        setDownloaded(sessionCount);
      }

      const finalCount = await getCachedSurahCount();
      setCachedCount(finalCount);
      setStatus(finalCount >= TOTAL_SURAHS ? "done" : "error");
      if (finalCount < TOTAL_SURAHS) {
        setErrorMessage(
          " surah gagal disimpan. Coba lagi."
        );
      }
    } catch (err) {
      console.error("[Offline] Gagal mengunduh full Quran:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Download gagal, coba lagi."
      );
      setStatus("error");
    }
  }, [status]);

  // --- Cancel ---------------------------------------------------------

  const cancelDownload = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  // --- Delete ---------------------------------------------------------

  const deleteOfflineData = useCallback(async () => {
    await clearOfflineData();
    setCachedCount(0);
    setDownloaded(0);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  // --- Derived --------------------------------------------------------

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
