"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import FilterTabs, { type FilterTab } from "./FilterTabs";
import LabelFilter, { type LabelFilterValue } from "./LabelFilter";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";
import AxisIndicator from "./AxisIndicator";
import Link from "next/link";

const today = new Date().toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

function greet() {
  const h = new Date().getHours();
  if (h < 10) return "おはよう";
  if (h < 18) return "こんにちは";
  return "お疲れさま";
}

export default function Dashboard() {
  const {
    tasks,
    settings,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    updateProgress,
    hydrated,
  } = useTasks();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [labelFilter, setLabelFilter] = useState<LabelFilterValue>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<null | (typeof tasks)[0]>(
    null,
  );

  const showCompleted = settings.showCompleted;

  const mustTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.type === "must" && (showCompleted || !t.completed))
        .filter((t) => filter === "all" || filter === "must")
        .filter((t) => labelFilter === "all" || t.category === labelFilter)
        .sort((a, b) => {
          const pr: Record<string, number> = {
            urgent: 0,
            high: 1,
            normal: 2,
            low: 3,
          };
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return pr[a.priority] - pr[b.priority];
        }),
    [tasks, filter, labelFilter, showCompleted],
  );

  const optionalTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.type === "optional" && (showCompleted || !t.completed))
        .filter((t) => filter === "all" || filter === "optional")
        .filter((t) => labelFilter === "all" || t.category === labelFilter)
        .sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1)),
    [tasks, filter, labelFilter, showCompleted],
  );

  const counts = useMemo(() => {
    const inc = tasks.filter((t) => !t.completed);
    return {
      must: inc.filter((t) => t.type === "must").length,
      optional: inc.filter((t) => t.type === "optional").length,
    };
  }, [tasks]);

  const axisProgress = useMemo(() => {
    const must = tasks.filter((t) => t.type === "must");
    if (!must.length) return 0;
    return Math.round(
      (must.filter((t) => t.completed).length / must.length) * 100,
    );
  }, [tasks]);

  const allCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-20 glass-card px-4 pt-5 pb-3 backdrop-blur-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
              >
                <path d="M12 3C8 3 5 7 5 10s1 4 3 6" strokeLinecap="round" />
                <path d="M12 3c4 0 7 4 7 7s-1 4-3 6" strokeLinecap="round" />
                <path
                  d="M8 16c1.5 2 2.5 3 4 3s2.5-1 4-3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">
              Essential Flow
            </span>
          </div>
          <AxisIndicator progress={axisProgress} compact />
        </div>
      </div>

      {/* Page header */}
      <div className="px-5 pt-7 pb-4 sm:px-8 lg:px-10 lg:pt-10">
        <p className="text-sm text-slate-400 font-medium">{greet()} 👋</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
          今日のフローを
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            デザインしよう。
          </span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">{today}</p>
      </div>

      {/* Toolbar */}
      <div className="px-5 sm:px-8 lg:px-10 flex flex-col gap-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            value={filter}
            onChange={setFilter}
            mustCount={counts.must}
            optionalCount={counts.optional}
          />
          <div className="flex items-center gap-2">
            {allCount === 0 && hydrated && (
              <span className="text-xs text-emerald-500 font-semibold">
                全完了！🎉
              </span>
            )}
            <motion.button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setFormOpen(true);
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:brightness-105"
            >
              <svg
                viewBox="0 0 20 20"
                width="14"
                height="14"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
              >
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
              タスクを追加
            </motion.button>
          </div>
        </div>
        <LabelFilter
          value={labelFilter}
          onChange={setLabelFilter}
          tasks={tasks}
        />
      </div>

      {/* Task sections */}
      <div className="px-5 pb-28 sm:px-8 lg:px-10 space-y-8">
        {/* Must */}
        {(filter === "all" || filter === "must") && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <h2 className="text-sm font-bold text-slate-700">課題（Must）</h2>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                {mustTasks.filter((t) => !t.completed).length}
              </span>
            </div>

            {hydrated && mustTasks.length === 0 ? (
              <EmptyState
                icon="📋"
                title="課題はありません"
                sub="素晴らしい！今日は自由な時間を楽しもう。"
              />
            ) : (
              <motion.div
                layout
                className="flex gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-4"
                style={{ scrollSnapType: "x mandatory" }}
              >
                <AnimatePresence initial={false}>
                  {mustTasks.map((t) => (
                    <motion.div
                      key={t.id}
                      layout
                      className="shrink-0 w-[240px] lg:w-auto"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <TaskCard
                        task={t}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onProgressChange={updateProgress}
                        onEdit={() => {
                          setEditingTask(t);
                          setFormOpen(true);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setFormOpen(true);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="shrink-0 w-[200px] lg:w-auto flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 py-8 text-slate-300 hover:text-indigo-400 lg:min-h-[170px] transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-medium">課題を追加</span>
                </motion.button>
              </motion.div>
            )}
          </section>
        )}

        {/* Optional */}
        {(filter === "all" || filter === "optional") && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h2 className="text-sm font-bold text-slate-700">
                オプション（Optional）
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                {optionalTasks.filter((t) => !t.completed).length}
              </span>
            </div>

            {hydrated && optionalTasks.length === 0 ? (
              <EmptyState
                icon="🍃"
                title="オプションタスクはありません"
                sub="「やってもいいこと」を、気が向いたら追加しよう。"
              />
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                <AnimatePresence initial={false}>
                  {optionalTasks.map((t) => (
                    <motion.div key={t.id} layout>
                      <TaskCard
                        task={t}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onEdit={() => {
                          setEditingTask(t);
                          setFormOpen(true);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <motion.button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setFormOpen(true);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="card-optional flex min-h-[100px] flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-100 bg-slate-50/50 text-slate-300 hover:border-emerald-200 hover:text-emerald-400 transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-medium">
                    気になることを追加
                  </span>
                </motion.button>
              </motion.div>
            )}
          </section>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="glass-card border-t border-slate-200/60 px-2 pb-5 pt-2">
          <div className="flex items-center justify-around">
            <Link
              href="/"
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-indigo-600"
            >
              <span className="text-xl leading-none">🏠</span>フロー
            </Link>
            <Link
              href="/weekly"
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400"
            >
              <span className="text-xl leading-none">📅</span>週間
            </Link>
            <motion.button
              type="button"
              onClick={() => setFormOpen(true)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-300/50"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="white"
                strokeWidth="2.4"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </motion.button>
            <Link
              href="/projects"
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400"
            >
              <span className="text-xl leading-none">📁</span>プロジェクト
            </Link>
            <Link
              href="/settings"
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400"
            >
              <span className="text-xl leading-none">⚙️</span>設定
            </Link>
          </div>
        </div>
      </nav>

      <AddTaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onAdd={(task) => {
          addTask(task);
          setEditingTask(null);
        }}
        onUpdate={(updated) => {
          updateTask(updated.id, {
            title: updated.title,
            notes: updated.notes,
            type: updated.type,
            category: updated.category,
            priority: updated.priority,
            progress: updated.progress,
            deadline: updated.deadline,
          });
          setEditingTask(null);
          setFormOpen(false);
        }}
        editingTask={editingTask}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-14 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </div>
  );
}
