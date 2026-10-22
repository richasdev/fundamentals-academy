import { create } from "zustand";
export type Theme = "light" | "dark";
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem("fundamentals-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
const initial = initialTheme();
document.documentElement.dataset.theme = initial;
export const useAppearance = create<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>()((set) => ({
  theme: initial,
  setTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("fundamentals-theme", theme);
    } catch {}
    set({ theme });
  },
}));
