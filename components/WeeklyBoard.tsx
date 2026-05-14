"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import type { Task } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import AddTaskForm from "./AddTaskForm";
import Link from "next/link";

function getWeekDates(startOn: 0 | 1 = 1): Date[] {
  const today = new Date();
  const dow = today.getDay();
  const diff = (dow - startOn + 7) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDayLabel(d: Date) {
  const dow = DAY_LABELS[d.getDay()];
  return { day: d.getDate(), dow, month: d.getMonth() + 1 };
}

interface MiniCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  dragging: boolean;
}

function MiniCard({ task, onToggle, onDelete, dragging }: MiniCardProps) {
  const cat = CATEGORIES[task.category];
  const reduce = useReducedMotion();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      whileHover={reduce ? undefined : { scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={`group relative rounded-2xl p-3 shadow-sm ring-1 transition select-none cursor-grab active:cursor-grabbing ${
        task.type === "must"
          ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white ring-indigo-300/60"
          : "bg-white text-slate-800 ring-slate-100"
      } ${task.completed ? "opacity-50" : ""} ${dragging ? "shadow-lg rotate-2 scale-105 z-50" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded-full ring-1.5 flex items-center justify-center transition ${
            task.completed
              ? task.type === "must" ? "bg-white/40 ring-white/50" : "bg-emerald-400 ring-emerald-400"
              : task.type === "must" ? "ring-white/40 hover:ring-white/70" : "ring-slate-200 hover:ring-indigo-300"
          }`}
        >
          {task.completed && (
            <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="white" strokeWidth="2">
              <path d="M2 5l2 2.5 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-semibold leading-tight truncate ${task.completed ? "line-through opacity-60" : ""}`}>
            {task.title}
          </p>
          <span className={`mt-1 inline-block text-[10px] ${task.type === "must" ? "text-white/70" : "text-slate-400"}`}>
            {cat.emoji}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className={`opacity-0 group-hover:opacity-100 rounded-full p-0.5 transition ${
            task.type === "must" ? "text-white/60 hover:bg-white/20" : "text-slate-300 hover:bg-slate-100"
          }`}
        >
          <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
            <path d="M3.22 2.78a.75.75 0 0 0-1.06 1.06L4.94 6 2.16 8.78a.75.75 0 1 0 1.06 1.06L6 7.06l2.78 2.78a.75.75 0 1 0 1.06-1.06L7.06 6l2.78-2.78a.75.75 0 0 0-1.06-1.06L6 4.94 3.22 2.78Z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default function WeeklyBoard() {
  const { tasks, settings, toggleTask, deleteTask, moveTaskToDate, addTask } = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const weekDates = useMemo(() => getWeekDates(settings.weekStartsOn), [settings.weekStartsOn]);
  const todayStr = new Date().toISOString().split("T")[0];

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    weekDates.forEach((d) => { map[toDateStr(d)] = []; });
    map["unscheduled"] = [];

    tasks.forEach((t) => {
      const key = t.scheduledDate && map[t.scheduledDate] !== undefined ? t.scheduledDate : "unscheduled";
      map[key].push(t);
    });

    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => {
        const pr: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
        return pr[a.priority] - pr[b.priority];
      });
    });
    return map;
  }, [tasks, weekDates]);

  const overdueCount = useMemo(
    () => tasks.filter((t) => !t.completed && t.scheduledDate && t.scheduledDate < todayStr).length,
    [tasks, todayStr],
  );

  function moveOverdueToToday() {
    tasks
      .filter((t) => !t.completed && t.scheduledDate && t.scheduledDate < todayStr)
      .forEach((t) => moveTaskToDate(t.id, todayStr));
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragEnd(id: string, x: number, y: number) {
    setDragId(null);
    setOverDate(null);

    const elements = document.elementsFromPoint(x, y);
    for (const el of elements) {
      const date = (el as HTMLElement).dataset?.date;
      if (date) {
        moveTaskToDate(id, date);
        return;
      }
    }
  }

  function openAddForm(date?: string) {
    setFormDate(date);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 sm:px-8 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              ウィークリー
              <span className="ml-2 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                ボード
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">カードをドラッグして日付を移動</p>
          </div>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <motion.button
                type="button"
                onClick={moveOverdueToToday}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-200 transition"
              >
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M8 3v6l3 3" strokeLinecap="round" />
                  <circle cx="8" cy="8" r="6" />
                </svg>
                {overdueCount}件を今日に移動
              </motion.button>
            )}
            <motion.button
              type="button"
              onClick={() => openAddForm(todayStr)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:brightness-105"
            >
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
              追加
            </motion.button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div ref={boardRef} className="flex-1 overflow-x-auto overflow-y-hidden px-5 pb-6 sm:px-8">
        <div className="flex gap-3 h-full min-w-max">
          {weekDates.map((date) => {
            const dateStr = toDateStr(date);
            const { day, dow, month } = formatDayLabel(date);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const colTasks = tasksByDate[dateStr] ?? [];
            const isOver = overDate === dateStr;

            return (
              <div
                key={dateStr}
                data-date={dateStr}
                onDragOver={(e) => { e.preventDefault(); setOverDate(dateStr); }}
                onDragLeave={() => setOverDate(null)}
                onDrop={() => setOverDate(null)}
                className={`week-col w-48 flex-shrink-0 flex flex-col ${isToday ? "is-today" : ""} ${isOver ? "is-over" : ""}`}
              >
                {/* Column header */}
                <div
                  className={`flex-shrink-0 px-3 pt-3 pb-2 rounded-t-3xl ${
                    isToday
                      ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10"
                      : isPast
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isToday ? "text-indigo-500" : "text-slate-400"
                      }`}>
                        {month}/{day}
                      </span>
                      <div className={`text-sm font-bold ${isToday ? "text-indigo-600" : "text-slate-600"}`}>
                        {dow}曜日
                        {isToday && (
                          <span className="ml-1.5 rounded-full bg-indigo-500 px-1.5 py-0.5 text-[9px] text-white font-semibold">今日</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold ${
                      colTasks.filter((t) => !t.completed).length > 0 ? "text-indigo-500" : "text-slate-300"
                    }`}>
                      {colTasks.filter((t) => !t.completed).length}
                    </span>
                  </div>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5 min-h-0">
                  <AnimatePresence initial={false}>
                    {colTasks.map((task) => (
                      <motion.div key={task.id} layout>
                        <div
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          onDragEnd={(e: React.DragEvent) => handleDragEnd(task.id, e.clientX, e.clientY)}
                        >
                          <MiniCard
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            dragging={dragId === task.id}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add button */}
                <button
                  type="button"
                  onClick={() => openAddForm(dateStr)}
                  className="flex-shrink-0 mx-2 mb-2 rounded-2xl py-1.5 text-xs text-slate-300 hover:bg-white/80 hover:text-indigo-400 transition flex items-center justify-center gap-1"
                >
                  <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 2v10M2 7h10" strokeLinecap="round" />
                  </svg>
                  追加
                </button>
              </div>
            );
          })}

          {/* Unscheduled column */}
          <div
            data-date="unscheduled"
            onDragOver={(e) => { e.preventDefault(); setOverDate("unscheduled"); }}
            onDragLeave={() => setOverDate(null)}
            onDrop={() => setOverDate(null)}
            className={`week-col w-48 flex-shrink-0 flex flex-col border-dashed ${overDate === "unscheduled" ? "is-over" : ""}`}
          >
            <div className="flex-shrink-0 px-3 pt-3 pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">未設定</span>
              <div className="text-sm font-bold text-slate-500 mt-0.5">未スケジュール</div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1.5 min-h-0">
              <AnimatePresence initial={false}>
                {(tasksByDate["unscheduled"] ?? []).map((task) => (
                  <motion.div key={task.id} layout>
                    <div
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={(e: React.DragEvent) => handleDragEnd(task.id, e.clientX, e.clientY)}
                    >
                      <MiniCard task={task} onToggle={toggleTask} onDelete={deleteTask} dragging={dragId === task.id} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="glass-card border-t border-slate-200/60 px-2 pb-5 pt-2">
          <div className="flex items-center justify-around">
            <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400">
              <span className="text-xl leading-none">🏠</span>フロー
            </Link>
            <Link href="/weekly" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-indigo-600">
              <span className="text-xl leading-none">📅</span>週間
            </Link>
            <motion.button
              type="button"
              onClick={() => openAddForm(todayStr)}
              whileTap={{ scale: 0.93 }}
              className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </motion.button>
            <Link href="/projects" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400">
              <span className="text-xl leading-none">📁</span>プロジェクト
            </Link>
            <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400">
              <span className="text-xl leading-none">⚙️</span>設定
            </Link>
          </div>
        </div>
      </nav>

      <AddTaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setFormDate(undefined); }}
        onAdd={addTask}
        defaultScheduledDate={formDate}
      />
    </div>
  );
}
