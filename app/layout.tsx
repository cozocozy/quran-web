/**
 * app/layout.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Root layout for the Al-Quran app.
 *
 * Responsibilities:
 *  - Load Amiri Quran (Arabic) + Inter (UI) via next/font/google
 *  - Inject font CSS variables into <html> so they're available globally
 *  - Set viewport meta for mobile-first rendering
 *  - Render the fixed BottomNav below all page content
 *  - Provide page-level padding so content isn't hidden under the bottom nav
 * ─────────────────────────────────────────────────────────────────────
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ThemeProvider from "@/components/ThemeProvider";

// ─── Fonts ────────────────────────────────────────────────────────────

/**
 * Inter — used for all UI text (labels, navigation, body copy).
 * Variable font reduces HTTP requests.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",    // maps to Tailwind's font-sans
});

// ─── Metadata ─────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "Al-Quran — Baca & Dengarkan Al-Quran",
    template: "%s | Al-Quran",
  },
  description:
    "Baca Al-Quran lengkap dengan terjemahan Bahasa Indonesia. Bookmark ayah favorit, lacak bacaan terakhir, dan dengarkan murottal.",
  keywords: ["al-quran", "quran online", "quran indonesia", "terjemahan quran"],
  authors: [{ name: "Al-Quran Web App" }],
  robots: "index, follow",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Al-Quran — Baca & Dengarkan Al-Quran",
    description: "Baca Al-Quran lengkap dengan terjemahan Bahasa Indonesia.",
  },
};

/** Mobile-optimised viewport: disables user-scaling to prevent layout breaks */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,         // Allow pinch-zoom for accessibility
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/*
          Scheherazade New — highly legible traditional Naskh typeface.
          Sangat cocok dan nyaman dibaca untuk orang tua.
          Loaded directly via <link> to avoid next/font limitations with
          non-Latin subsets and to allow font-display: swap control.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Scheherazade+New:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Fixed bottom navigation — rendered on all pages */}
        <ThemeProvider>
          <main className="min-h-screen pb-[80px]">
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
