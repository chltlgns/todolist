"use client";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("theme") as "system" | "dark" | "navy" | null;
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove("dark", "navy");

    if (savedTheme === "dark") {
      root.classList.add("dark");
    } else if (savedTheme === "navy") {
      root.classList.add("navy");
    }
    // "system" or null = light theme (no class needed)
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
