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
}

export default function TaskCard({ task, onToggle, onDelete, onProgressChange }: Props) {
  const cat = CATEGORIES[task.category];
  const reduce = useReducedMotion();
  const stale = useMemo(() => isStale(task), [task]);
  const age = useMemo(() => daysOld(task), [task]);
  const [hovered, setHovered] = useState(false);

  const isMust = task.type === "must";

  const spring = {
    type: "spring" as const,
    stiffness: 360,
    damping: 20,
    mass: 0.8,
  };

  const priorityLabel: Record<string, { label: string; cls: string }> = {
    urgent: { label: "最優先", cls: "bg-white/30 text-white" },
    high: { label: "優先", cls: "bg-white/20 text-white/90" },
    normal: { label: "", cls: "" },
    low: { label: "", cls: "" },
  };
  const pri = priorityLabel[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.9 }}
      transition={spring}
      whileHover={reduce ? undefined : { scale: 1.03, y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      drag={reduce ? false : "y"}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.18}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 22 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative overflow-hidden ${
        isMust ? "card-must min-w-[200px]" : "card-optional min-w-[180px]"
      } ${task.completed ? "opacity-60" : ""}`}
      style={{ padding: "1.25rem" }}
    >
      {/* Completion shimmer overlay */}
      <motion.div
        aria-hidden
        initial={false}
        animate={
          task.completed
            ? { opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.6] }
            : { opacity: 0, scale: 0.8 }
        }
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="pointer-events-none absolute -inset-2 rounded-3xl"
        style={{
          background: isMust
            ? "radial-gradient(circle, rgba(165,243,252,0.5) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(110,231,183,0.45) 0%, transparent 65%)",
        }}
      />

      {/* ── Must card ─────────────────────── */}
      {isMust && (
        <>
          {/* Top row: priority badge + checkbox */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {pri.label && (
                <span className={`chip ${pri.cls} text-[11px]`}>{pri.label}</span>
              )}
              {stale && (
                <span className="chip bg-white/20 text-white/80 text-[11px]">
                  🪶 本当に必要?
                </span>
              )}
            </div>
            <CheckCircle
              checked={task.completed}
              onToggle={() => onToggle(task.id)}
              dark={false}
              reduce={reduce}
            />
          </div>

          {/* Title */}
          <motion.h3
            layout="position"
            className={`mt-3 text-lg font-bold leading-snug text-white ${
              task.completed ? "line-through opacity-70" : ""
            }`}
          >
            {task.title}
          </motion.h3>

          {/* Deadline */}
          {task.deadline && (
            <div className="mt-2 flex items-center gap-1.5 text-white/75 text-xs">
              <ClockIcon />
              <span>締切: {task.deadline}</span>
            </div>
          )}

          {/* Category chip */}
          <span className={`chip mt-2 ${cat.chipDark} text-[11px]`}>
            {cat.emoji} {cat.name}
          </span>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-white/70">
              <span>進捗</span>
              <span className="tabular-nums">{task.progress}%</span>
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
            {/* Quick progress buttons on hover */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: hovered && onProgressChange ? 1 : 0, height: hovered && onProgressChange ? "auto" : 0 }}
              className="overflow-hidden"
            >
              <input
                type="range"
                min={0} max={100} step={10}
                value={task.progress}
                onChange={(e) => onProgressChange?.(task.id, Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 w-full cursor-pointer accent-white"
              />
            </motion.div>
          </div>
        </>
      )}

      {/* ── Optional card ─────────────────── */}
      {!isMust && (
        <>
          {/* Category + stale chip */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className={`chip ${cat.chip} text-[11px]`}>
                {cat.emoji} {cat.name}
              </span>
              {stale && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="chip bg-fuchsia-100 text-fuchsia-700 text-[11px]"
                  title={`${age}日間オープン — これ、本当に必要？`}
                >
                  🪶 {age}日経過
                </motion.span>
              )}
            </div>
            <CheckCircle
              checked={task.completed}
              onToggle={() => onToggle(task.id)}
              dark={true}
              reduce={reduce}
            />
          </div>

          {/* Title */}
          <motion.h3
            layout="position"
            className={`mt-2.5 text-base font-semibold leading-snug text-slate-800 ${
              task.completed ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </motion.h3>

          {task.notes && (
            <p className="mt-1 text-xs text-slate-400 leading-snug">{task.notes}</p>
          )}
        </>
      )}

      {/* Delete button */}
      <motion.button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label="削除"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`absolute right-2 top-2 rounded-full p-1.5 transition ${
          isMust
            ? "text-white/60 hover:bg-white/20 hover:text-white"
            : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
        }`}
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      </motion.button>
    </motion.div>
  );
}

function CheckCircle({
  checked,
  onToggle,
  dark,
  reduce,
}: {
  checked: boolean;
  onToggle: () => void;
  dark: boolean;
  reduce: boolean | null;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={reduce ? undefined : { scale: 0.82 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
      aria-pressed={checked}
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ring-2 transition-colors ${
        checked
          ? dark
            ? "bg-emerald-400 ring-emerald-400"
            : "bg-white/40 ring-white/50"
          : dark
          ? "bg-transparent ring-slate-200 hover:ring-indigo-300"
          : "bg-white/10 ring-white/30 hover:ring-white/60"
      }`}
    >
      <motion.svg
        viewBox="0 0 14 14"
        width="14"
        height="14"
        fill="none"
        stroke={dark ? "white" : "white"}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={checked ? { opacity: 1, scale: [0, 1.4, 1] } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <path d="M2.5 7l3.5 3.5 5.5-6" />
      </motion.svg>
    </motion.button>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5l2 1.5" strokeLinecap="round" />
    </svg>
  );
}
