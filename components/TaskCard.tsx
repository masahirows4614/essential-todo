"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { Task } from "@/lib/types";
import { daysOld, isStale } from "@/lib/essentialism";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onProgressChange?: (id: string, progress: number) => void;
  onEdit?: () => void;
}

// ── 優先度ごとの設定 ────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  urgent: {
    gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    glow: "rgba(239,68,68,0.35)",
    badge: "bg-white/25 text-white",
    label: "🔴 最優先",
    minH: "min-h-[180px]",
    titleSize: "text-xl",
  },
  high: {
    gradient: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
    glow: "rgba(249,115,22,0.3)",
    badge: "bg-white/20 text-white",
    label: "🟠 高優先",
    minH: "min-h-[160px]",
    titleSize: "text-lg",
  },
  normal: {
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    glow: "rgba(99,102,241,0.25)",
    badge: "bg-white/15 text-white/90",
    label: "",
    minH: "min-h-[140px]",
    titleSize: "text-base",
  },
  low: {
    gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    glow: "rgba(16,185,129,0.2)",
    badge: "bg-white/15 text-white/85",
    label: "",
    minH: "min-h-[120px]",
    titleSize: "text-sm",
  },
} as const;

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onProgressChange,
  onEdit,
}: Props) {
  const cat = CATEGORIES[task.category];
  const reduce = useReducedMotion();
  const stale = useMemo(() => isStale(task), [task]);
  const age = useMemo(() => daysOld(task), [task]);
  const [showActions, setShowActions] = useState(false);

  const isMust = task.type === "must";
  const cfg = PRIORITY_CONFIG[task.priority ?? "normal"];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.93 }}
      animate={{ opacity: task.completed ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.88 }}
      transition={{ type: "spring", stiffness: 340, damping: 22, mass: 0.7 }}
      whileHover={reduce ? undefined : { scale: 1.025, y: -3 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      onTouchStart={() => setShowActions((v) => !v)}
      className={`relative overflow-hidden rounded-3xl p-4 shadow-lg cursor-pointer select-none ${
        isMust ? cfg.minH : "min-h-[100px]"
      }`}
      style={
        isMust
          ? {
              background: cfg.gradient,
              boxShadow: `0 8px 32px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.08)`,
            }
          : {
              background: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
            }
      }
    >
      {/* ── Must Card ─────────────────────────────── */}
      {isMust && (
        <div className="flex flex-col h-full gap-2">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {cfg.label && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.badge}`}>
                  {cfg.label}
                </span>
              )}
              {stale && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/85">
                  🪶 {age}日経過
                </span>
              )}
            </div>
            <CheckCircle checked={task.completed} onToggle={() => onToggle(task.id)} reduce={reduce} />
          </div>

          {/* Title */}
          <h3 className={`font-bold leading-snug text-white ${cfg.titleSize} ${task.completed ? "line-through opacity-70" : ""}`}>
            {task.title}
          </h3>

          {task.notes && (
            <p className="text-xs text-white/70 leading-snug line-clamp-2">{task.notes}</p>
          )}

          <div className="flex-1" />

          {/* Deadline */}
          {task.deadline && (
            <div className="flex items-center gap-1 text-white/75 text-[11px]">
              <svg viewBox="0 0 14 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="7" cy="7" r="5" /><path d="M7 4.5V7l1.5 1.5" strokeLinecap="round" />
              </svg>
              <span>{task.deadline}</span>
            </div>
          )}

          {/* Category */}
          <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.badge}`}>
            {cat.emoji} {cat.name}
          </span>

          {/* Progress */}
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-white/65">
              <span>進捗</span>
              <span className="tabular-nums font-bold">{task.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white/80"
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: showActions && onProgressChange ? "auto" : 0, opacity: showActions && onProgressChange ? 1 : 0 }}
              className="overflow-hidden"
            >
              <input
                type="range" min={0} max={100} step={5}
                value={task.progress}
                onChange={(e) => onProgressChange?.(task.id, Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="mt-1.5 w-full accent-white cursor-pointer"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Optional Card ──────────────────────────── */}
      {!isMust && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.chip}`}>
                {cat.emoji} {cat.name}
              </span>
              {stale && (
                <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-medium text-fuchsia-700">
                  🪶 {age}日経過
                </span>
              )}
            </div>
            <CheckCircle checked={task.completed} onToggle={() => onToggle(task.id)} reduce={reduce} dark />
          </div>

          <h3 className={`text-sm font-semibold leading-snug text-slate-800 ${task.completed ? "line-through opacity-60" : ""}`}>
            {task.title}
          </h3>

          {task.notes && (
            <p className="text-xs text-slate-400 leading-snug line-clamp-2">{task.notes}</p>
          )}

          {task.deadline && (
            <div className="flex items-center gap-1 text-slate-400 text-[11px]">
              <svg viewBox="0 0 14 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="7" cy="7" r="5" /><path d="M7 4.5V7l1.5 1.5" strokeLinecap="round" />
              </svg>
              <span>{task.deadline}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Action buttons ─── */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: showActions ? 1 : 0, y: showActions ? 0 : 4 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-2.5 right-2.5 flex gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          aria-label="編集"
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold shadow-sm transition ${
            isMust
              ? "bg-white/25 text-white hover:bg-white/40"
              : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
        >
          ✏️ 編集
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          aria-label="削除"
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold shadow-sm transition ${
            isMust
              ? "bg-white/20 text-white/80 hover:bg-white/35"
              : "bg-rose-50 text-rose-400 hover:bg-rose-100"
          }`}
        >
          🗑️ 削除
        </button>
      </motion.div>
    </motion.div>
  );
}

function CheckCircle({
  checked,
  onToggle,
  reduce,
  dark = false,
}: {
  checked: boolean;
  onToggle: () => void;
  reduce: boolean | null;
  dark?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      whileTap={reduce ? undefined : { scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      aria-pressed={checked}
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ring-2 transition-colors ${
        checked
          ? dark ? "bg-emerald-400 ring-emerald-400" : "bg-white/50 ring-white/60"
          : dark ? "bg-transparent ring-slate-200 hover:ring-indigo-300" : "bg-white/15 ring-white/40 hover:ring-white/70"
      }`}
    >
      <motion.svg
        viewBox="0 0 14 14" width="13" height="13"
        fill="none" stroke="white" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={false}
        animate={checked ? { opacity: 1, scale: [0, 1.3, 1] } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <path d="M2.5 7l3.5 3.5 5.5-6" />
      </motion.svg>
    </motion.button>
  );
}
