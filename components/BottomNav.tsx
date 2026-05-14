"use client";
/**
 * components/BottomNav.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Fixed mobile bottom navigation bar with 4 tabs:
 * Home → Search → Bookmark → Settings
 *
 * Auto-hide behaviour (Opsi 4):
 * - Scroll down  → hide navbar (translateY(100%))
 * - Scroll up    → show navbar
 * - Landscape    → always hide (more vertical space for reading)
 * - Page change  → always show
 * ─────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  matchMode: "exact" | "prefix";
}

// ─── Nav Items ────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { href: "/",         label: "Beranda",    icon: Home,     matchMode: "exact"  },
  { href: "/search",   label: "Cari",       icon: Search,   matchMode: "prefix" },
  { href: "/bookmark", label: "Bookmark",   icon: Bookmark, matchMode: "prefix" },
  { href: "/settings", label: "Pengaturan", icon: Settings, matchMode: "prefix" },
];

// ─────────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();

  // ── Visibility state ───────────────────────────────────────────────
  const [visible, setVisible]       = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const lastScrollY = useRef(0);
  const ticking    = useRef(false);

  // ── Scroll-direction detection ─────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta    = currentY - lastScrollY.current;

        if (currentY <= 60) {
          // Near the top → always show
          setVisible(true);
        } else if (delta > 10) {
          // Scrolling down → hide
          setVisible(false);
        } else if (delta < -5) {
          // Scrolling up → show
          setVisible(true);
        }

        lastScrollY.current = currentY;
        ticking.current     = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Landscape detection ────────────────────────────────────────────
  useEffect(() => {
    function checkOrientation() {
      setIsLandscape(window.matchMedia("(orientation: landscape)").matches);
    }
    checkOrientation();

    const mq = window.matchMedia("(orientation: landscape)");
    mq.addEventListener("change", checkOrientation);
    return () => mq.removeEventListener("change", checkOrientation);
  }, []);

  // ── Reset on page navigation ───────────────────────────────────────
  useEffect(() => {
    setVisible(true);
    lastScrollY.current = 0;
  }, [pathname]);

  // ── Active route helper ────────────────────────────────────────────
  function isActive(item: NavItem): boolean {
    if (item.matchMode === "exact") return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const hidden = !visible || isLandscape;

  // ─────────────────────────────────────────────────────────────────

  return (
    <nav
      aria-label="Navigasi utama"
      aria-hidden={hidden}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "bottom-nav-safe",
        "touch-no-highlight",
        // Smooth slide up/down
        "transition-transform duration-300 ease-in-out",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="flex items-stretch h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon   = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              tabIndex={hidden ? -1 : undefined}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5",
                "min-h-[44px] min-w-[44px]",
                "rounded-xl transition-colors duration-200",
                active
                  ? "text-[oklch(0.6_0.14_196)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  active ? "opacity-100" : "opacity-70"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
