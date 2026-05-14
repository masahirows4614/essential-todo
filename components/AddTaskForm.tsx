"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import type { CategoryKey, Priority, Task, TaskType } from "@/lib/types";
import { uid } from "@/lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
  onUpdate?: (task: Task) => void;
  editingTask?: Task | null;
  centered?: boolean;
  defaultScheduledDate?: string | undefined;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "urgent", label: "🔴 最優先", color: "#ef4444" },
  { value: "high",   label: "🟠 高",     color: "#f97316" },
  { value: "normal", label: "🔵 普通",   color: "#6366f1" },
  { value: "low",    label: "🟢 低",     color: "#10b981" },
];

export default function AddTaskForm({
  open,
  onClose,
  onAdd,
  onUpdate,
  editingTask = null,
  centered = true,
  defaultScheduledDate,
}: Props) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<TaskType>("must");
  const [category, setCategory] = useState<CategoryKey>("university");
  const [priority, setPriority] = useState<Priority>("high");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [progress, setProgress] = useState(0);
  const [scheduledDate, setScheduledDate] = useState<string>("");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setNotes(editingTask.notes || "");
      setType(editingTask.type || "must");
      setCategory(editingTask.category || "university");
      setPriority(editingTask.priority || "high");
      setDeadlineDate(editingTask.deadlineDate || "");
      setDeadlineTime(editingTask.deadlineTime || "");
      setProgress(editingTask.progress ?? 0);
      setScheduledDate(editingTask.scheduledDate ?? defaultScheduledDate ?? "");
    } else {
      resetForm();
      setScheduledDate(defaultScheduledDate ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTask, open]);

  function resetForm() {
    setTitle("");
    setNotes("");
    setType("must");
    setCategory("university");
    setPriority("high");
    setDeadlineDate("");
    setDeadlineTime("");
    setProgress(0);
    setScheduledDate(defaultScheduledDate ?? "");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  // 締切テキスト生成（表示用）
  function buildDeadlineText(): string | undefined {
    if (!deadlineDate) return undefined;
    const d = new Date(deadlineDate + (deadlineTime ? `T${deadlineTime}` : "T00:00"));
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const isToday = d.toDateString() === today.toDateString();
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const prefix = isToday ? "今日" : isTomorrow ? "明日" : `${d.getMonth()+1}/${d.getDate()}`;
    const time = deadlineTime || "23:59";
    return `${prefix} ${time}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    const deadlineText = buildDeadlineText();
    const deadlineTs = deadlineDate
      ? new Date(deadlineDate + (deadlineTime ? `T${deadlineTime}` : "T23:59")).getTime()
      : undefined;

    if (editingTask && onUpdate) {
      onUpdate({
        ...editingTask,
        title: t,
        notes: notes.trim() || undefined,
        type,
        category,
        priority: type === "optional" ? "normal" : priority,
        progress: type === "must" ? progress : 0,
        deadline: deadlineText,
        deadlineDate: deadlineDate || undefined,
        deadlineTime: deadlineTime || undefined,
        deadlineTs,
        scheduledDate: scheduledDate || undefined,
      });
    } else {
      onAdd({
        id: uid(),
        title: t,
        notes: notes.trim() || undefined,
        type,
        category,
        priority: type === "optional" ? "normal" : priority,
        completed: false,
        progress: type === "must" ? progress : 0,
        deadline: deadlineText,
        deadlineDate: deadlineDate || undefined,
        deadlineTime: deadlineTime || undefined,
        deadlineTs,
        scheduledDate: scheduledDate || undefined,
        createdAt: Date.now(),
      });
    }

    resetForm();
    onClose();
  }

  // 今日の日付をデフォルト上限として取得
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          />

          <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              key="sheet"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="mx-auto w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
                    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="white" strokeWidth="2.2">
                      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-slate-800">
                    {editingTask ? "タスクを編集" : "新しいタスク"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
                {/* Title */}
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="タイトルを入力…"
                  className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition"
                />

                {/* Notes */}
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="メモ（任意）"
                  className="w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition resize-none min-h-[60px]"
                />

                {/* Type */}
                <div className="grid grid-cols-2 gap-2">
                  {(["must", "optional"] as TaskType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`rounded-2xl py-2.5 text-sm font-semibold transition ${
                        type === t
                          ? t === "must"
                            ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md"
                            : "bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-md"
                          : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t === "must" ? "📌 Must（やるべき）" : "✨ Optional（やりたい）"}
                    </button>
                  ))}
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">カテゴリ</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_KEYS.map((k) => {
                      const cat = CATEGORIES[k];
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setCategory(k)}
                          className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                            category === k
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {cat.emoji} {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority (Must only) */}
                {type === "must" && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">優先度</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPriority(opt.value)}
                          className={`rounded-xl py-2 text-xs font-semibold transition ${
                            priority === opt.value
                              ? "text-white shadow-sm"
                              : "bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                          }`}
                          style={priority === opt.value ? { backgroundColor: opt.color } : {}}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deadline - カレンダーピッカー */}
                {type === "must" && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">締切日時</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="2" y="3" width="12" height="11" rx="2" />
                          <path d="M2 7h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
                        </svg>
                        <input
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          min={todayStr}
                          className="w-full rounded-2xl bg-slate-50 pl-8 pr-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-indigo-300 transition"
                        />
                      </div>
                      <div className="relative w-28">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <circle cx="8" cy="8" r="6" />
                          <path d="M8 5v3.5l2 1.5" strokeLinecap="round" />
                        </svg>
                        <input
                          type="time"
                          value={deadlineTime}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          className="w-full rounded-2xl bg-slate-50 pl-8 pr-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-indigo-300 transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Scheduled date for weekly */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">ウィークリーに配置する日</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="2" y="3" width="12" height="11" rx="2" />
                      <path d="M2 7h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
                    </svg>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 pl-8 pr-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-indigo-300 transition"
                    />
                  </div>
                </div>

                {/* Progress (Must only) */}
                {type === "must" && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">進捗</label>
                      <span className="text-xs font-bold text-indigo-500">{progress}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1 pb-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50 transition"
                  >
                    キャンセル
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-2 flex-grow rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105 transition"
                  >
                    {editingTask ? "✏️ 更新する" : "✨ 追加する"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
