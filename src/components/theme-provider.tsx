"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const STORAGE_KEY = "killo-theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

function resolveInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  } catch {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setTheme(resolveInitialTheme()));
    return () => cancelAnimationFrame(id);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — ignore */
      }
      const root = document.documentElement;
      root.classList.add("theme-switching");
      root.classList.toggle("dark", next === "dark");
      window.setTimeout(() => root.classList.remove("theme-switching"), 700);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
