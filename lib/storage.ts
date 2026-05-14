"use client";

import { useEffect, useRef, useState } from "react";
import type { AppSettings, Project, Task } from "./types";

// ─── Generic hook ──────────────────────────────────────────────────────
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      setValue(raw ? (JSON.parse(raw) as T) : initialRef.current);
    } catch { setValue(initialRef.current); }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* quota */ }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}

// ─── Keys ──────────────────────────────────────────────────────────────
export const TASKS_KEY    = "essential-todo:v3";
export const PROJECTS_KEY = "ef:projects";
export const SETTINGS_KEY = "ef:settings";

// ─── Default data ──────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];

export const DEFAULT_TASKS: Task[] = [
  {
    id: "seed-1",
    title: "レポート提出",
    notes: "統計学のレポート・7ページ以上",
    type: "must",
    category: "university",
    priority: "urgent",
    completed: false,
    progress: 80,
    deadline: "今日 23:59",
    deadlineDate: todayStr(),
    deadlineTime: "23:59",
    deadlineTs: Date.now() + 1000 * 60 * 60 * 6,
    scheduledDate: todayStr(),
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: "seed-2",
    title: "プログラミング課題",
    notes: "アルゴリズム演習 第5回",
    type: "must",
    category: "university",
    priority: "high",
    completed: false,
    progress: 60,
    deadline: "明日 18:00",
    deadlineTs: Date.now() + 1000 * 60 * 60 * 30,
    scheduledDate: todayStr(),
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "seed-3",
    title: "ゼミ資料の準備",
    notes: "発表スライド 10枚程度",
    type: "must",
    category: "university",
    priority: "normal",
    completed: false,
    progress: 40,
    deadline: "5/22（水）",
    deadlineTs: Date.now() + 1000 * 60 * 60 * 24 * 8,
    scheduledDate: todayStr(),
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: "seed-4",
    title: "読書（デザインの教科書）",
    notes: "ノンデザイナーズ・デザインブック",
    type: "optional",
    category: "personal",
    priority: "normal",
    completed: false,
    progress: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "seed-5",
    title: "ジムに行く",
    type: "optional",
    category: "health",
    priority: "normal",
    completed: false,
    progress: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: "seed-6",
    title: "部屋のレイアウトを変えてみる",
    type: "optional",
    category: "lifestyle",
    priority: "low",
    completed: false,
    progress: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  staleThresholdDays: 3,
  weekStartsOn: 1,
  showCompleted: false,
  moodEmoji: "🌊",
  moodText: "いい感じ！この調子でいこう ✨",
};

export const DEFAULT_PROJECTS: Project[] = [];

// ─── uid helper ────────────────────────────────────────────────────────
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
