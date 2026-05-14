"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  value?: string;       // YYYY-MM-DD
  timeValue?: string;   // HH:MM
  onChange: (date: string, time: string) => void;
  onClear?: () => void;
}

const DAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const MONTHS_JA = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function DeadlinePicker({ value, timeValue = "23:59", onChange, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(value ? parseInt(value.slice(0, 4)) : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.slice(5, 7)) - 1 : today.getMonth());
  const [time, setTime] = useState(timeValue);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfWeek(viewYear, viewMonth);
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  function select(day: number) {
    const dateStr = toDateStr(viewYear, viewMonth, day);
    onChange(dateStr, time);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const displayText = value
    ? `${value.replace(/-/g, "/")} ${time}`
    : "締切を設定";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition ring-1 ${
          value
            ? "bg-indigo-50 text-indigo-700 ring-indigo-200 font-medium"
            : "bg-slate-50 text-slate-400 ring-slate-200 hover:ring-indigo-200"
        }`}
      >
        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="3" width="14" height="11" rx="2" />
          <path d="M1 7h14M5 1v4M11 1v4" strokeLinecap="round" />
        </svg>
        {displayText}
        {value && onClear && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onClear?.(); }}
            onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onClear?.())}
            className="ml-1 rounded-full hover:bg-indigo-100 p-0.5"
          >
            <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
              <path d="M3.22 2.78a.75.75 0 0 0-1.06 1.06L4.94 6 2.16 8.78a.75.75 0 1 0 1.06 1.06L6 7.06l2.78 2.78a.75.75 0 1 0 1.06-1.06L7.06 6l2.78-2.78a.75.75 0 0 0-1.06-1.06L6 4.94 3.22 2.78Z" />
            </svg>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 p-4"
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500 transition">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="text-sm font-bold text-slate-700">
                {viewYear}年 {MONTHS_JA[viewMonth]}
              </span>
              <button type="button" onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-500 transition">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_JA.map((d, i) => (
                <div
                  key={d}
                  className={`text-center text-[10px] font-semibold py-1 ${
                    i === 0 ? "text-rose-400" : i === 6 ? "text-indigo-400" : "text-slate-400"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;
                const isPast = dateStr < todayStr;
                const dayOfWeek = (startDay + day - 1) % 7;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => select(day)}
                    disabled={isPast}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition ${
                      isSelected
                        ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md"
                        : isToday
                        ? "ring-1 ring-indigo-400 text-indigo-600 font-bold"
                        : isPast
                        ? "text-slate-200 cursor-not-allowed"
                        : dayOfWeek === 0
                        ? "text-rose-400 hover:bg-rose-50"
                        : dayOfWeek === 6
                        ? "text-indigo-400 hover:bg-indigo-50"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Time picker */}
            <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100">
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="#6366f1" strokeWidth="1.6">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3.5l2 1.5" strokeLinecap="round" />
              </svg>
              <span className="text-xs text-slate-500 font-medium">時刻</span>
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (value) onChange(value, e.target.value);
                }}
                className="ml-auto rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-indigo-300"
              />
            </div>

            {/* Quick shortcuts */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: "今日", days: 0 },
                { label: "明日", days: 1 },
                { label: "3日後", days: 3 },
                { label: "来週", days: 7 },
              ].map(({ label, days }) => {
                const d = new Date();
                d.setDate(d.getDate() + days);
                const dateStr = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { onChange(dateStr, time); setOpen(false); }}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
