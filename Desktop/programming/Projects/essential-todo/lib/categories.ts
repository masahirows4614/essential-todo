import type { CategoryKey } from "./types";

export interface CategoryConfig {
  key: CategoryKey;
  name: string;
  emoji: string;
  dot: string;       // tailwind bg-* for the dot
  chip: string;      // tailwind classes for the chip on light bg
  chipDark: string;  // chip on gradient (Must) cards
}

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  university: {
    key: "university",
    name: "大学・課題",
    emoji: "📚",
    dot: "bg-indigo-400",
    chip: "bg-indigo-100 text-indigo-700",
    chipDark: "bg-white/20 text-white",
  },
  work: {
    key: "work",
    name: "仕事",
    emoji: "💼",
    dot: "bg-sky-400",
    chip: "bg-sky-100 text-sky-700",
    chipDark: "bg-white/20 text-white",
  },
  health: {
    key: "health",
    name: "健康",
    emoji: "🏃",
    dot: "bg-emerald-400",
    chip: "bg-emerald-100 text-emerald-700",
    chipDark: "bg-white/20 text-white",
  },
  personal: {
    key: "personal",
    name: "自分の時間",
    emoji: "🌿",
    dot: "bg-pink-400",
    chip: "bg-pink-100 text-pink-700",
    chipDark: "bg-white/20 text-white",
  },
  lifestyle: {
    key: "lifestyle",
    name: "暮らし",
    emoji: "🏠",
    dot: "bg-orange-400",
    chip: "bg-orange-100 text-orange-700",
    chipDark: "bg-white/20 text-white",
  },
  hobby: {
    key: "hobby",
    name: "趣味",
    emoji: "🎨",
    dot: "bg-violet-400",
    chip: "bg-violet-100 text-violet-700",
    chipDark: "bg-white/20 text-white",
  },
};

export const CATEGORY_KEYS: CategoryKey[] = [
  "university", "work", "health", "personal", "lifestyle", "hobby",
];
