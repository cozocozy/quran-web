"use client";
/**
 * components/AudioPlayer.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Minimal inline audio player for a single ayah's recitation.
 * Uses Sheikh Mishary Rashid Al-Afasy via the Islamic Network CDN.
 *
 * Design:
 * - Play/pause toggle with visual feedback
 * - Shows loading state while audio bufffers
 * - Auto-pauses when another ayah starts playing (via custom event)
 * - Uses the HTML5 <audio> API directly — no heavy library needed
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAudioUrl } from "@/lib/quran-api";

/** Custom event name broadcast when an ayah starts playing */
const AUDIO_START_EVENT = "quran-audio-start";

interface AudioPlayerProps {
  /** Global ayah number (1–6236), used to build the CDN URL */
  globalAyahNumber: number;
  /** Unique identifier for this player instance (e.g. "2:255") */
  ayahKey: string;
}

// ─────────────────────────────────────────────────────────────────────

export default function AudioPlayer({ globalAyahNumber, ayahKey }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /** Build CDN URL once per mount */
  const audioUrl = getAudioUrl(globalAyahNumber);

  // ── Auto-pause when another ayah starts playing ────────────────────

  useEffect(() => {
    /**
     * Listens for the global "quran-audio-start" event.
     * Pauses this player if a different ayah started playing.
     */
    function handleOtherAudioStart(e: Event) {
      const event = e as CustomEvent<{ ayahKey: string }>;
      if (event.detail.ayahKey !== ayahKey && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    }

    window.addEventListener(AUDIO_START_EVENT, handleOtherAudioStart);
    return () => window.removeEventListener(AUDIO_START_EVENT, handleOtherAudioStart);
  }, [ayahKey, isPlaying]);

  // ── Cleanup on unmount ─────────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  // ── Toggle play/pause ──────────────────────────────────────────────

  const handleToggle = useCallback(async () => {
    // Lazily create the audio element on first interaction
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);

      // Wire up state events on the audio element
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
      });
      audioRef.current.addEventListener("waiting", () => {
        setIsLoading(true);
      });
      audioRef.current.addEventListener("canplay", () => {
        setIsLoading(false);
      });
    }

    if (isPlaying) {
      // Pause current playback
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Broadcast that this ayah is starting — other players will pause
      window.dispatchEvent(
        new CustomEvent(AUDIO_START_EVENT, { detail: { ayahKey } })
      );

      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        // Browser blocked autoplay — user gesture was already present, so
        // this should not happen, but we handle it gracefully
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isPlaying, audioUrl, ayahKey]);

  // ─────────────────────────────────────────────────────────────────

  return (
    <button
      onClick={handleToggle}
      aria-label={isPlaying ? "Pause murottal" : "Putar murottal"}
      className={cn(
        // Minimum 40px tap target
        "flex items-center justify-center w-10 h-10 rounded-full",
        "transition-all duration-200",
        isPlaying
          ? "bg-[oklch(0.6_0.14_196)] text-white shadow-md shadow-teal-500/30"
          : "bg-muted text-muted-foreground hover:bg-[oklch(0.95_0.03_196)] hover:text-[oklch(0.6_0.14_196)]",
        "touch-no-highlight"
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />
      )}
    </button>
  );
}
