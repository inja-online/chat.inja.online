"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative h-9 w-9 overflow-hidden rounded-md border border-border bg-background">
        <div className="flex h-full w-full items-center justify-center">
          <Sun className="h-4 w-4" />
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 overflow-hidden rounded-md border border-border bg-background transition-all duration-300 ease-out hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "active:scale-95"
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative h-full w-full">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          )}
        >
          <Moon className="h-4 w-4" />
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
            isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        >
          <Sun className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}
