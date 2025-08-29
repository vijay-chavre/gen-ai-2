"use client";

import { useEffect, useState } from "react";

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
    <button
      type="button"
      onClick={() => setIsDark((v) => !v)}
      className="rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}


