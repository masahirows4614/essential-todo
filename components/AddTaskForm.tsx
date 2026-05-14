"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/categories";
import type { CategoryKey, Priority, Task, TaskType } from "@/lib/types";
import { uid } from "@/lib/storage";
import DeadlinePicker from "./DeadlinePicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (task: Task) => void;
  defaultType?: TaskType;
  defaultScheduledDate?: string;
}

function formatDeadline(date: string, time: string) {
  const d = new Date(date + "T" + time);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tmrStr = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
  const prefix = date === todayStr ? "今日" : date === tmrStr ? "明日" : date.replace(/-/g, "/");
  return `${prefix} ${time}`;
}

export default function AddTaskForm({ open, onClose, onAdd, defaultType = "must", defaultScheduledDate }: Props) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<TaskType>(defaultType);
  const [category, setCategory] = useState<CategoryKey>("university");
  const [priority, setPriority] = useState<Priority>("high");
  const [deadlineDate, setDeadlineDate] = useState<string | undefined>();
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, defaultType]);

  useEffect(() => {
    if (type === "must" && priority === "low") setPriority("normal");
  }, [type, priority]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    const deadlineTs = deadlineDate
      ? new Date(`${deadlineDate}T${deadlineTime}`).getTime()
      : undefined;

    onAdd({
      id: uid(),
      title: t,
      notes: notes.trim() || undefined,
      type,
      category,
      priority: type === "optional" ? "normal" : priority,
      completed: false,
      progress: type === "must" ? progress : 0,
      deadline: deadlineDate ? formatDeadline(deadlineDate, deadlineTime) : undefined,
      deadlineDate,
      deadlineTime: deadlineDate ? deadlineTime : undefined,
      deadlineTs,
      scheduledDate: defaultScheduledDate ?? (type === "must" ? new Date().toISOString().split("T")[0] : undefined),
      createdAt: Date.now(),
    });
    resetForm();
    onClose();
  }

  function resetForm() {
    setTitle(""); setNotes(""); setType(defaultType); setCategory("university");
    setPriority("high"); setDeadlineDate(undefined); setDeadlineTime("23:59"); setProgress(0);
  }

  function handleClose() { resetForm(); onClose(); }

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
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-xl rounded-t-3xl bg-white px-5 pb-10 pt-5 shadow-2xl lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:rounded-3xl lg:pb-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 lg:hidden" />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">タスクを追加</h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Type */}
              <div className="grid grid-cols-2 gap-2">
                {(["must", "optional"] as TaskType[]).map((t) => (
                  <motion.button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    whileTap={{ scale: 0.96 }}
                    className={`rounded-2xl py-2.5 text-sm font-semibold transition ${
                      type === t
                        ? t === "must"
                          ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md"
                          : "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-300"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {t === "must" ? "● 課題（Must）" : "● オプション（Optional）"}
                  </motion.button>
                ))}
              </div>

              {/* Title */}
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タスク名を入力…"
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition"
                required
              />

              {/* Notes */}
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="メモ（任意）"
                className="w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition"
              />

              {/* Category */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">カテゴリ</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_KEYS.map((k) => {
                    const cfg = CATEGORIES[k];
                    return (
                      <motion.button
                        key={k}
                        type="button"
                        onClick={() => setCategory(k)}
                        whileTap={{ scale: 0.93 }}
                        className={`chip text-xs transition ${cfg.chip} ${
                          category === k ? "ring-2 ring-offset-1 ring-indigo-400" : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        {cfg.emoji} {cfg.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Must-only fields */}
              {type === "must" && (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">締切</label>
                    <DeadlinePicker
                      value={deadlineDate}
                      timeValue={deadlineTime}
                      onChange={(date, time) => { setDeadlineDate(date); setDeadlineTime(time); }}
                      onClear={() => { setDeadlineDate(undefined); setDeadlineTime("23:59"); }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      進捗 {progress}%
                    </label>
                    <input
                      type="range"
                      min={0} max={100} step={10}
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="w-full mt-1 accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400 uppercase tracking-wider">優先度</label>
                    <div className="flex gap-2">
                      {(["urgent", "high", "normal"] as Priority[]).map((p) => {
                        const labels: Record<string, string> = { urgent: "最優先", high: "優先", normal: "通常" };
                        return (
                          <motion.button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            whileTap={{ scale: 0.94 }}
                            className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition ${
                              priority === p
                                ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            {labels[p]}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  キャンセル
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105"
                >
                  追加する
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
