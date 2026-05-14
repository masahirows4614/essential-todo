"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import type { Project, Task } from "@/lib/types";
import { uid } from "@/lib/storage";
import { CATEGORIES } from "@/lib/categories";
import AddTaskForm from "./AddTaskForm";
import Link from "next/link";

const PROJECT_COLORS = [
  "#4361EE", "#7C5CE5", "#e17055", "#00b894", "#0984e3",
  "#fd79a8", "#fdcb6e", "#6c5ce7", "#00cec9", "#a29bfe",
];
const PROJECT_EMOJIS = ["📁", "🚀", "💡", "🎯", "🌿", "📚", "💼", "🎨", "🔬", "🏗️"];

interface ProjectForm {
  name: string; emoji: string; color: string; description: string;
}
const DEFAULT_FORM: ProjectForm = { name: "", emoji: "📁", color: PROJECT_COLORS[0], description: "" };

function ProjectNode({ project, tasks, onDelete, onUpdate, onEditTask }: {
  project: Project;
  tasks: Task[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Project>) => void;
  onEditTask: (task: Task) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProjectForm>({
    name: project.name, emoji: project.emoji, color: project.color, description: project.description || "",
  });

  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === project.id), [tasks, project.id]);
  const doneCount = projectTasks.filter((t) => t.completed).length;
  const progress = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

  function saveEdit() {
    if (!editForm.name.trim()) return;
    onUpdate(project.id, { name: editForm.name.trim(), emoji: editForm.emoji, color: editForm.color, description: editForm.description.trim() || undefined });
    setEditing(false);
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden"
    >
      {!editing ? (
        <div className="flex items-center gap-3 p-4 cursor-pointer select-none group"
          style={{ borderLeft: `4px solid ${project.color}` }}
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: project.color + "22" }}>
            {project.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 truncate">{project.name}</h3>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: project.color + "22", color: project.color }}>
                {projectTasks.filter((t) => !t.completed).length} 残り
              </span>
            </div>
            {project.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{project.description}</p>}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: project.color }}
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                />
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">{progress}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="rounded-full p-1.5 text-slate-300 hover:bg-indigo-50 hover:text-indigo-400 transition opacity-0 group-hover:opacity-100">
              <svg viewBox="0 0 14 14" width="11" height="11" fill="currentColor">
                <path d="M10.3 1.7a1 1 0 0 1 1.4 1.4L4.4 10.4 2 11l.6-2.4L10.3 1.7z" />
              </svg>
            </button>
            <motion.span animate={{ rotate: expanded ? 0 : -90 }} transition={{ type: "spring", stiffness: 380, damping: 22 }} className="text-slate-300">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              className="rounded-full p-1.5 text-slate-200 hover:bg-rose-50 hover:text-rose-400 transition">
              <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 4h10M5 4V3h4v1M6 7v4M8 7v4M3 4l.8 8h6.4L11 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3" style={{ borderLeft: `4px solid ${editForm.color}` }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">プロジェクトを編集</span>
            <button type="button" onClick={() => setEditing(false)} className="text-slate-300 hover:text-slate-500">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
          </div>
          <input autoFocus value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300" placeholder="プロジェクト名" />
          <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300" placeholder="説明（任意）" />
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_EMOJIS.map((em) => (
              <button key={em} type="button" onClick={() => setEditForm((f) => ({ ...f, emoji: em }))}
                className={`h-8 w-8 rounded-xl text-base transition ${editForm.emoji === em ? "bg-indigo-100 ring-2 ring-indigo-400" : "bg-slate-50 hover:bg-slate-100"}`}>{em}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PROJECT_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setEditForm((f) => ({ ...f, color: c }))}
                className={`h-6 w-6 rounded-full transition ${editForm.color === c ? "ring-2 ring-offset-1 ring-slate-400 scale-125" : "hover:scale-110"}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-xl py-2 text-xs font-semibold text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50">キャンセル</button>
            <button type="button" onClick={saveEdit} className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2 text-xs font-semibold text-white">保存する</button>
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && !editing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }} className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1.5">
              {projectTasks.length === 0 ? (
                <p className="text-xs text-slate-300 py-3 text-center">タスクがありません</p>
              ) : (
                projectTasks.map((task) => {
                  const cat = CATEGORIES[task.category];
                  return (
                    <div key={task.id} onClick={() => onEditTask(task)}
                      className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition hover:ring-1 hover:ring-slate-200 ${task.completed ? "opacity-50" : ""}`}
                      style={{ backgroundColor: project.color + "0d" }}
                    >
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: task.completed ? "#94a3b8" : project.color }} />
                      <p className={`flex-1 text-xs font-medium text-slate-700 truncate ${task.completed ? "line-through" : ""}`}>{task.title}</p>
                      {task.deadline && <span className="text-[10px] text-slate-400 shrink-0">{task.deadline}</span>}
                      <span className="text-[10px] text-slate-400">{cat.emoji}</span>
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"
                        className="text-slate-300 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <path d="M8.3 1.7a1 1 0 0 1 1.4 1.4L3.4 9.4 1 10l.6-2.4L8.3 1.7z" />
                      </svg>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProjectTree() {
  const { tasks, projects, addProject, deleteProject, updateProject, updateTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [assigningTask, setAssigningTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<ProjectForm>(DEFAULT_FORM);

  const unassignedTasks = useMemo(() => tasks.filter((t) => !t.projectId && !t.completed), [tasks]);

  function createProject() {
    if (!form.name.trim()) return;
    addProject({ id: uid(), name: form.name.trim(), emoji: form.emoji, color: form.color, description: form.description.trim() || undefined, taskIds: [], createdAt: Date.now() });
    setForm(DEFAULT_FORM);
    setShowForm(false);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-7 pb-4 sm:px-8 lg:px-10 lg:pt-10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">プロジェクト<span className="ml-2 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">ツリー</span></h1>
            <p className="mt-0.5 text-xs text-slate-400">タスクをプロジェクトで整理しよう</p>
          </div>
          <motion.button type="button" onClick={() => setShowForm(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="white" strokeWidth="2.2"><path d="M10 4v12M4 10h12" strokeLinecap="round" /></svg>
            新規プロジェクト
          </motion.button>
        </div>
      </div>

      <div className="px-5 pb-24 sm:px-8 lg:px-10 space-y-4">
        <AnimatePresence initial={false}>
          {projects.map((p) => (
            <ProjectNode key={p.id} project={p} tasks={tasks} onDelete={deleteProject} onUpdate={updateProject} onEditTask={setEditingTask} />
          ))}
        </AnimatePresence>
        {projects.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-16 text-center">
            <div className="mb-3 text-4xl">📁</div>
            <p className="text-sm font-semibold text-slate-500">プロジェクトがありません</p>
            <p className="mt-1 text-xs text-slate-400">タスクをまとめてプロジェクトを作成しよう</p>
          </motion.div>
        )}
        {unassignedTasks.length > 0 && projects.length > 0 && (
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">未アサイン</h2>
            <div className="rounded-3xl bg-white ring-1 ring-slate-100 divide-y divide-slate-50">
              {unassignedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                  <p className="flex-1 text-sm text-slate-600 truncate">{task.title}</p>
                  <button type="button" onClick={() => setAssigningTask(task.id)}
                    className="shrink-0 rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 ring-1 ring-slate-100 transition">
                    割り当て
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New project modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg rounded-t-3xl bg-white px-5 pb-10 pt-5 shadow-2xl lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:rounded-3xl lg:pb-6">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 lg:hidden" />
              <h2 className="mb-4 text-base font-bold text-slate-800">新規プロジェクト</h2>
              <div className="flex flex-col gap-3">
                <input autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="プロジェクト名"
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300" />
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="説明（任意）"
                  className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300" />
                <div className="flex flex-wrap gap-2">{PROJECT_EMOJIS.map((em) => (
                  <button key={em} type="button" onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                    className={`h-9 w-9 rounded-xl text-lg transition ${form.emoji === em ? "bg-indigo-100 ring-2 ring-indigo-400" : "bg-slate-50 hover:bg-slate-100"}`}>{em}</button>
                ))}</div>
                <div className="flex flex-wrap gap-2">{PROJECT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`h-7 w-7 rounded-full transition ${form.color === c ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }} />
                ))}</div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50">キャンセル</button>
                  <motion.button type="button" onClick={createProject} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-md">作成する</motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Assign task modal */}
      <AnimatePresence>
        {assigningTask && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAssigningTask(null)} className="fixed inset-0 z-40 bg-slate-900/30" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
              <p className="mb-3 text-sm font-semibold text-slate-700">プロジェクトを選択</p>
              <div className="space-y-1.5">
                {projects.map((p) => (
                  <button key={p.id} type="button" onClick={() => { updateTask(assigningTask, { projectId: p.id }); setAssigningTask(null); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 transition">
                    <span className="text-base">{p.emoji}</span>
                    <span className="font-medium text-slate-700">{p.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Task edit modal */}
      {editingTask && (
        <AddTaskForm open={!!editingTask} onClose={() => setEditingTask(null)} onAdd={() => {}}
          onUpdate={(updated) => { updateTask(updated.id, updated); setEditingTask(null); }}
          editingTask={editingTask}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="glass-card border-t border-slate-200/60 px-2 pb-5 pt-2">
          <div className="flex items-center justify-around">
            <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400"><span className="text-xl leading-none">🏠</span>フロー</Link>
            <Link href="/weekly" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400"><span className="text-xl leading-none">📅</span>週間</Link>
            <button type="button" onClick={() => setShowForm(true)} className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
            </button>
            <Link href="/projects" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-indigo-600"><span className="text-xl leading-none">📁</span>プロジェクト</Link>
            <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400"><span className="text-xl leading-none">⚙️</span>設定</Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
