"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * components/shared/SplashScreen.tsx
 * ─────────────────────────────────────────────────────────────────────
 * A premium first-load experience that covers the entire screen.
 * Features a progress bar that goes from 0 to 100%.
 * Uses sessionStorage to ensure it only shows once per session.
 * ─────────────────────────────────────────────────────────────────────
 */

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if we've already shown the splash in this session
    const hasShown = sessionStorage.getItem("quran-splash-shown");
    
    if (!hasShown) {
      setShouldRender(true);
      setIsVisible(true);
      
      // Artificial progress bar logic
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 15; // Random jumps for "real" feeling
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          
          // Wait a bit at 100% then hide
          setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem("quran-splash-shown", "true");
            // Remove from DOM after fade out
            setTimeout(() => setShouldRender(false), 500);
          }, 400);
        }
        setProgress(Math.floor(currentProgress));
      }, 150);

      return () => clearInterval(interval);
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out",
        "bg-[#0d9488]", // Matching the Teal-600 color
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center w-full max-w-[280px] animate-in fade-in zoom-in duration-700">
        
        {/* Modern Quran Icon */}
        <div className="relative w-32 h-32 mb-8 animate-bounce-slow">
          <Image
            src="/quran-icon.png"
            alt="Al-Quran"
            fill
            priority
            className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
          />
        </div>

        {/* Brand Header */}
        <div className="text-center mb-10">
          <h1 className="arabic-title text-4xl text-white mb-2" dir="rtl" lang="ar">
            القرآن الكريم
          </h1>
          <p className="text-[10px] font-bold text-white/50 tracking-[0.3em] uppercase">
            Digital Al-Quran App
          </p>
        </div>

        {/* Progress Section */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
              Loading Data
            </span>
            <span className="text-sm font-bold text-white tabular-nums">
              {progress}%
            </span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-white transition-all duration-200 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer text */}
        <p className="absolute bottom-12 text-[10px] font-medium text-white/30 tracking-widest uppercase">
          Membangun Berkah...
        </p>
      </div>

      {/* Glow decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/10 blur-[120px] rounded-full -z-10 animate-pulse" />
    </div>
  );
}
