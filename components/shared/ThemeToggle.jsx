"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
        theme === "dark"
          ? "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
          : "border-black/10 bg-black/5 text-slate-600 hover:bg-black/10 hover:text-black"
      } ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
