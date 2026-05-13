"use client";
/**
 * components/SearchBar.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Reusable search input with:
 * - Auto-focus on mount (controlled by prop)
 * - 300ms debounce to avoid firing on every keystroke
 * - Clear (×) button when value is non-empty
 * - Visual keyboard shortcut hint on desktop
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  /** Callback fired after the debounce delay with the current query */
  onSearch: (query: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** If true, the input is focused on mount */
  autoFocus?: boolean;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Optional additional class names for the wrapper */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────

export default function SearchBar({
  onSearch,
  placeholder = "Cari nama surah atau ayat...",
  autoFocus = false,
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Auto-focus on mount if requested */
  useEffect(() => {
    if (autoFocus) {
      // Small delay so the keyboard doesn't pop up during page transition
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  /**
   * Handles input change:
   * 1. Updates controlled value immediately (UI stays responsive)
   * 2. Debounces the onSearch callback to reduce API calls / filtering work
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Clear any pending debounce timer
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  /** Clears the input and fires onSearch with empty string immediately */
  const handleClear = useCallback(() => {
    setValue("");
    onSearch("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    inputRef.current?.focus();
  }, [onSearch]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-center",
        "rounded-xl border border-border bg-muted/50",
        "focus-within:border-[oklch(0.6_0.14_196)] focus-within:ring-2 focus-within:ring-[oklch(0.6_0.14_196)]/20",
        "transition-all duration-200",
        className
      )}
    >
      {/* Search icon */}
      <Search
        className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />

      {/* Input field */}
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className={cn(
          "w-full bg-transparent",
          "pl-10 pr-10 py-3",           // Space for search icon left, clear button right
          "text-sm text-foreground placeholder:text-muted-foreground",
          "outline-none border-none",
          "touch-no-highlight"
        )}
      />

      {/* Clear button — only visible when there's a value */}
      {value && (
        <button
          onClick={handleClear}
          aria-label="Hapus pencarian"
          className={cn(
            "absolute right-2",
            "w-7 h-7 flex items-center justify-center rounded-full",
            "bg-muted-foreground/20 hover:bg-muted-foreground/30",
            "text-muted-foreground transition-colors duration-150",
            "touch-no-highlight"
          )}
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
