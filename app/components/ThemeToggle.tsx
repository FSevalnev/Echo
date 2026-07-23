"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Sync with whatever the inline script in layout.tsx already applied
  // on first paint, so the icon matches the actual theme.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-10 w-10 place-items-center rounded-full border border-gray-300 text-lg transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
