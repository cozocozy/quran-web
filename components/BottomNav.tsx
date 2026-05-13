"use client";
/**
 * components/BottomNav.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Fixed mobile bottom navigation bar with 4 tabs:
 * Home → Search → Bookmark → Settings
 *
 * Design notes:
 * - Fixed to viewport bottom, sits above iOS home indicator via safe-area
 * - Active tab gets teal accent color + label
 * - All tap targets are ≥44px (WCAG 2.5.5)
 * - Uses Next.js usePathname() for active state — client component
 * ─────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/** Navigation tab definition */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Match rule: 'exact' checks full path, 'prefix' checks startsWith */
  matchMode: "exact" | "prefix";
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Beranda",
    icon: Home,
    matchMode: "exact",
  },
  {
    href: "/search",
    label: "Cari",
    icon: Search,
    matchMode: "prefix",
  },
  {
    href: "/bookmark",
    label: "Bookmark",
    icon: Bookmark,
    matchMode: "prefix",
  },
  {
    href: "/settings",
    label: "Pengaturan",
    icon: Settings,
    matchMode: "prefix",
  },
];

// ─────────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();

  /**
   * Determines if a nav item is the currently active route.
   * Exact mode: must match the full pathname.
   * Prefix mode: pathname must start with the href (handles sub-routes).
   */
  function isActive(item: NavItem): boolean {
    if (item.matchMode === "exact") return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "bottom-nav-safe",           // custom CSS class for safe-area-inset-bottom
        "touch-no-highlight"
      )}
    >
      <div className="flex items-stretch h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                // Full-width flex column — fills the 44px+ tap target
                "flex flex-col items-center justify-center flex-1 gap-0.5",
                "min-h-[44px] min-w-[44px]",
                "rounded-xl transition-colors duration-200",
                active
                  ? "text-[oklch(0.6_0.14_196)]"   // teal accent
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="w-5 h-5 transition-transform duration-200 group-active:scale-90"
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
