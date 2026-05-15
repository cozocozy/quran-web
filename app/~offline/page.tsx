"use client";
/**
 * app/~offline/page.tsx — Offline Fallback Page
 * ─────────────────────────────────────────────────────────────────────
 * Ditampilkan oleh Service Worker ketika user mencoba membuka halaman
 * yang belum pernah dikunjungi saat online (tidak ada di SW cache).
 *
 * Flow:
 *  1. User buka /surah/X offline, halaman belum di-cache SW
 *  2. SW intercept → serve /~offline sebagai fallback
 *  3. Halaman ini mencoba load dari IndexedDB (jika ada)
 *  4. Jika tidak ada → tampilkan UI "belum tersedia offline"
 * ─────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { WifiOff, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import SurahReaderClient from "@/app/surah/[id]/SurahReaderClient";

export default function OfflineFallbackPage() {
  const [surahNumber, setSurahNumber] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Periksa apakah user membuka halaman surah tertentu saat offline
    // Meskipun SW melayani halaman /~offline, URL di browser tetap sesuai request asli.
    const path = window.location.pathname;
    const match = path.match(/^\/surah\/(\d+)/);
    
    if (match) {
      setSurahNumber(Number(match[1]));
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">Memeriksa ketersediaan data offline...</p>
      </div>
    );
  }

  // Jika user mencoba mengakses /surah/X, serahkan pada SurahReaderClient 
  // untuk meload data surah tersebut dari IndexedDB lokal.
  if (surahNumber) {
    return <SurahReaderClient initialSurah={null} surahNumber={surahNumber} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-muted-foreground/60" />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-2">
        Tidak Ada Koneksi
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-8">
        Halaman ini belum tersedia offline. Buka saat online terlebih dahulu,
        atau unduh semua surah via menu Pengaturan.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[oklch(0.6_0.14_196)] text-white text-sm font-medium"
        >
          <BookOpen className="w-4 h-4" />
          Buka Daftar Surah
        </Link>
        <Link
          href="/settings"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-muted text-foreground text-sm font-medium"
        >
          📥 Download Semua Surah (Offline)
        </Link>
      </div>

      <p className="text-xs text-muted-foreground/60 mt-8">
        Tip: Unduh semua 114 surah di Pengaturan agar bisa dibaca tanpa internet.
      </p>
    </div>
  );
}
