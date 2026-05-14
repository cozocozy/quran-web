"use client";

import { useSettings } from "@/lib/use-settings";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Calling useSettings will mount the useEffect that handles the "dark" class toggling
  useSettings();
  
  return <>{children}</>;
}
