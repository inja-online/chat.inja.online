"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useBindToKey } from "~/hooks/use-bind-to-key";
import { cn } from "~/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useBindToKey(
    [
      ["cmd", "t"],
      ["ctrl", "t"],
    ],
    () => {
      toggleTheme();
    }
  );

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

  const toggleTheme = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    const x = event?.clientX ?? 0;
    const y = event?.clientY ?? 0;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);
    document.documentElement.style.setProperty("--r", `${endRadius}px`);

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
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          )}
        >
          <Moon className="h-4 w-4" />
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
            isDark
              ? "-rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        >
          <Sun className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}
