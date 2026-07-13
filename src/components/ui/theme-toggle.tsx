"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "energy-theme";
const THEME_EVENT = "energy-theme-change";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#061522" : "#ffffff");
}

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const syncTheme = () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    applyTheme(
      saved === "light" || saved === "dark" ? saved : getSystemTheme(),
    );
    callback();
  };

  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", syncTheme);
  media.addEventListener("change", syncTheme);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", syncTheme);
    media.removeEventListener("change", syncTheme);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");

  const toggleTheme = () => {
    const nextTheme: Theme = getTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const label = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={label}
      aria-pressed={theme === "dark"}
      title={label}
      onClick={toggleTheme}
    >
      <Moon className="theme-icon theme-icon-moon" aria-hidden="true" />
      <Sun className="theme-icon theme-icon-sun" aria-hidden="true" />
    </button>
  );
}
