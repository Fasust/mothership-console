"use client";

import { createContext, useContext, useEffect, useState } from "react";

const defaultTheme: Theme = "amber";
export type Theme = (typeof allThemes)[number];
export const allThemes = ["amber", "cyan", "green", "white", "pink"] as const;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Emergency mode overwrite is now handled at the component level
  // through the emergency-mode class which has higher CSS specificity

  useEffect(() => {
    // Load theme from localStorage on client
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    // Save theme to localStorage when it changes
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
