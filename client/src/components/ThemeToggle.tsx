"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const ls = localStorage.getItem("theme");
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = ls ? ls === "dark" : prefersDark;
      setIsDark(initial);
    } catch {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (isDark === null) return;
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    (root as HTMLElement & { style: CSSStyleDeclaration }).style.colorScheme = isDark
      ? "dark"
      : "light";
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  if (isDark === null) return null;

  return (
    <Button
      variant="outline"
      onClick={() => setIsDark((v) => !v)}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? "Switch to Light" : "Switch to Dark"}
    </Button>
  );
}


