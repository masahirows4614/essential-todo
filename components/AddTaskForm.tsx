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

export default function AddTaskForm({
  open,
  onClose,
  onAdd,
  onUpdate,
  editingTask = null,
  centered = true,
}: Props) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<TaskType>("must");
  const [category, setCategory] = useState<CategoryKey>("university");
  const [priority, setPriority] = useState<Priority>("high");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [scheduledDate, setScheduledDate] = useState<string | undefined>(
    undefined,
  );

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
      setDeadline(editingTask.deadline || "");
      setProgress(editingTask.progress ?? 0);
      setScheduledDate(editingTask.scheduledDate ?? undefined);
    } else {
      // If a default scheduled date is provided (e.g. from WeeklyBoard), use it
      setScheduledDate(undefined as string | undefined);
      resetForm();
    }
  }, [editingTask]);

  function resetForm() {
    setTitle("");
    setNotes("");
    setType("must");
    setCategory("university");
    setPriority("high");
    setDeadline("");
    setProgress(0);
    setScheduledDate(undefined);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    if (editingTask && onUpdate) {
      onUpdate({
        ...editingTask,
        title: t,
        notes: notes.trim() || undefined,
        type,
        category,
        priority: type === "optional" ? "normal" : priority,
        progress: type === "must" ? progress : 0,
        deadline: deadline.trim() || undefined,
        scheduledDate: scheduledDate,
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
        deadline: deadline.trim() || undefined,
        scheduledDate: scheduledDate,
        createdAt: Date.now(),
      });
    }

    resetForm();
    onClose();
  }

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

          <div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              key="sheet"
              initial={
                centered
                  ? { opacity: 0, scale: 0.96 }
                  : { y: "100%", opacity: 0 }
              }
              animate={
                centered ? { opacity: 1, scale: 1 } : { y: 0, opacity: 1 }
              }
              exit={
                centered
                  ? { opacity: 0, scale: 0.96 }
                  : { y: "100%", opacity: 0 }
              }
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              drag={centered ? ("xy" as any) : false}
              dragConstraints={containerRef}
              dragElastic={0.12}
              className={`mx-auto max-w-xl rounded-2xl bg-white px-5 pb-6 pt-5 shadow-2xl ${
                centered ? "" : "rounded-t-3xl"
              }`}
              style={
                centered
                  ? ({ touchAction: "none" } as React.CSSProperties)
                  : undefined
              }
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800">
                    {editingTask ? "タスクを編集" : "タスクを追加"}
                  </h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      width="18"
                      height="18"
                      fill="currentColor"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>

                <div className="mb-3">
                  <input
                    ref={inputRef}
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTitle(e.target.value)
                    }
                    placeholder="タイトル"
                    className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-indigo-300 transition"
                  />
                </div>

                <div className="mb-3">
                  <textarea
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNotes(e.target.value)
                    }
                    placeholder="メモ (任意)"
                    className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-indigo-300 transition min-h-[64px]"
                  />
                </div>

                <div className="mb-3 flex items-center gap-3">
                  <select
                    value={type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setType(e.target.value as TaskType)
                    }
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >
                    <option value="must">Must（課題）</option>
                    <option value="optional">Optional（気になること）</option>
                  </select>

                  <select
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setCategory(e.target.value as CategoryKey)
                    }
                    className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >
                    {CATEGORY_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {CATEGORIES[k].name}
                      </option>
                    ))}
                  </select>
                </div>

                {type === "must" && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        締切
                      </label>
                      <input
                        value={deadline}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setDeadline(e.target.value)
                        }
                        placeholder="例: 今日 23:59"
                        className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-indigo-300 transition"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        優先度
                      </label>
                      <select
                        value={priority}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setPriority(e.target.value as Priority)
                        }
                        className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm"
                      >
                        <option value="low">低</option>
                        <option value="normal">普通</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                  </div>
                )}

                {type === "must" && (
                  <div className="mb-3">
                    <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      進捗
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setProgress(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                  >
                    {editingTask ? "更新する" : "追加する"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
