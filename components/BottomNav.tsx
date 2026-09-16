"use client";
/**
 * components/BottomNav.tsx
 * Fixed mobile bottom navigation — Home, Search, Bookmark, Settings.
 * Always visible (no auto-hide) — simpler and more reliable for a reading app.
 */

import { type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  matchMode: "exact" | "prefix";
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",         label: "Beranda",    icon: Home,     matchMode: "exact"  },
  { href: "/search",   label: "Cari",       icon: Search,   matchMode: "prefix" },
  { href: "/bookmark", label: "Bookmark",   icon: Bookmark, matchMode: "prefix" },
  { href: "/settings", label: "Pengaturan", icon: Settings, matchMode: "prefix" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on surah reader pages — navbar would block ayah content
  if (pathname.startsWith("/surah/")) return null;

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
        "bottom-nav-safe touch-no-highlight"
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
                "flex flex-col items-center justify-center flex-1 gap-0.5",
                "min-h-[44px] min-w-[44px]",
                "rounded-xl transition-colors duration-200",
                active
                  ? "text-[oklch(0.6_0.14_196)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
