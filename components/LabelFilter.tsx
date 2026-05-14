"use client";

import { motion } from "framer-motion";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import type { CategoryKey, Task } from "@/lib/types";

export type LabelFilterValue = CategoryKey | "all";

interface Props {
  value: LabelFilterValue;
  onChange: (v: LabelFilterValue) => void;
  tasks: Task[];
}

function incompleteCountByCategory(tasks: Task[]) {
  const open = tasks.filter((t) => !t.completed);
  const map: Record<CategoryKey, number> = {
    university: 0,
    work: 0,
    health: 0,
    personal: 0,
    lifestyle: 0,
    hobby: 0,
  };
  for (const t of open) {
    map[t.category]++;
  }
  return { total: open.length, byKey: map };
}

export default function LabelFilter({ value, onChange, tasks }: Props) {
  const { total, byKey } = incompleteCountByCategory(tasks);

  const chips: { key: LabelFilterValue; label: string; emoji?: string; count: number; dot?: string }[] = [
    { key: "all", label: "すべて", count: total },
    ...CATEGORY_KEYS.map((k) => {
      const c = CATEGORIES[k];
      return {
        key: k,
        label: c.name,
        emoji: c.emoji,
        count: byKey[k],
        dot: c.dot,
      };
    }),
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">ラベル</span>
      <div className="flex flex-1 flex-wrap items-center gap-1 rounded-2xl bg-white/50 p-1 ring-1 ring-slate-200/70 backdrop-blur-sm">
        {chips.map((item) => {
          const active = item.key === value;
          return (
            <motion.button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className={`relative flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition-colors ${
                active ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="label-filter-pill"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm"
                  style={{ zIndex: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                {item.key !== "all" && item.dot && (
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
                )}
                {item.emoji && <span className="shrink-0 leading-none">{item.emoji}</span>}
                <span className="max-w-[7rem] truncate sm:max-w-none">{item.label}</span>
                <span
                  className={`rounded-full px-1 py-0.5 text-[10px] tabular-nums ${
                    active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {item.count}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
