"use client";

import { motion } from "framer-motion";

export type FilterTab = "all" | "must" | "optional";

interface Props {
  value: FilterTab;
  onChange: (v: FilterTab) => void;
  mustCount: number;
  optionalCount: number;
}

const TABS: { key: FilterTab; label: string; dot?: string }[] = [
  { key: "all", label: "すべて" },
  { key: "must", label: "課題（Must）", dot: "bg-indigo-500" },
  { key: "optional", label: "オプション（Optional）", dot: "bg-emerald-400" },
];

export default function FilterTabs({ value, onChange, mustCount, optionalCount }: Props) {
  const count = (k: FilterTab) => {
    if (k === "must") return mustCount;
    if (k === "optional") return optionalCount;
    return mustCount + optionalCount;
  };

  return (
    <div className="flex items-center gap-1 rounded-2xl bg-white/70 p-1 ring-1 ring-slate-200/80 shadow-sm backdrop-blur-sm">
      {TABS.map((tab) => {
        const active = tab.key === value;
        return (
          <motion.button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-bg"
                className="absolute inset-0 rounded-xl bg-white shadow-sm"
                style={{ zIndex: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.dot && (
                <span className={`h-2 w-2 rounded-full ${tab.dot} shrink-0`} />
              )}
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
              }`}>
                {count(tab.key)}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
