"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { DEFAULT_TASKS, DEFAULT_PROJECTS, DEFAULT_SETTINGS, uid } from "@/lib/storage";
import type { AppSettings, Project, Task } from "@/lib/types";

// ─── Context 型定義（既存と同じ） ────────────────────────────────────
interface TaskContextValue {
  tasks: Task[];
  projects: Project[];
  settings: AppSettings;
  hydrated: boolean;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  moveTaskToDate: (id: string, date: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}

// ─── DB 行 ↔ アプリ型 の変換ヘルパー ─────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTask(r: any): Task {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes ?? undefined,
    type: r.type,
    category: r.category,
    priority: r.priority,
    completed: r.completed,
    progress: r.progress,
    deadline: r.deadline ?? undefined,
    deadlineDate: r.deadline_date ?? undefined,
    deadlineTime: r.deadline_time ?? undefined,
    deadlineTs: r.deadline_ts ?? undefined,
    scheduledDate: r.scheduled_date ?? undefined,
    projectId: r.project_id ?? undefined,
    createdAt: r.created_at,
    completedAt: r.completed_at ?? undefined,
  };
}

function taskToRow(t: Task, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    title: t.title,
    notes: t.notes ?? null,
    type: t.type,
    category: t.category,
    priority: t.priority,
    completed: t.completed,
    progress: t.progress,
    deadline: t.deadline ?? null,
    deadline_date: t.deadlineDate ?? null,
    deadline_time: t.deadlineTime ?? null,
    deadline_ts: t.deadlineTs ?? null,
    scheduled_date: t.scheduledDate ?? null,
    project_id: t.projectId ?? null,
    created_at: t.createdAt,
    completed_at: t.completedAt ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProject(r: any): Project {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    emoji: r.emoji,
    color: r.color,
    taskIds: r.task_ids ?? [],
    createdAt: r.created_at,
  };
}

function projectToRow(p: Project, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    description: p.description ?? null,
    emoji: p.emoji,
    color: p.color,
    task_ids: p.taskIds,
    created_at: p.createdAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSettings(r: any): AppSettings {
  return {
    staleThresholdDays: r.stale_threshold_days,
    weekStartsOn: r.week_starts_on,
    showCompleted: r.show_completed,
    moodEmoji: r.mood_emoji,
    moodText: r.mood_text,
  };
}

function settingsToRow(s: AppSettings, userId: string) {
  return {
    user_id: userId,
    stale_threshold_days: s.staleThresholdDays,
    week_starts_on: s.weekStartsOn,
    show_completed: s.showCompleted,
    mood_emoji: s.moodEmoji,
    mood_text: s.moodText,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // ユーザーが変わったらデータを再ロード
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setProjects([]);
      setSettings(DEFAULT_SETTINGS);
      setHydrated(false);
      prevUserIdRef.current = null;
      return;
    }

    if (prevUserIdRef.current === user.id) return;
    prevUserIdRef.current = user.id;

    const load = async () => {
      setHydrated(false);

      const [tasksRes, projectsRes, settingsRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      const loadedTasks: Task[] = (tasksRes.data ?? []).map(rowToTask);
      const loadedProjects: Project[] = (projectsRes.data ?? []).map(rowToProject);
      const loadedSettings: AppSettings = settingsRes.data
        ? rowToSettings(settingsRes.data)
        : DEFAULT_SETTINGS;

      // 新規ユーザー: タスクが空なら DEFAULT_TASKS を挿入
      if (loadedTasks.length === 0) {
        const seeded = DEFAULT_TASKS.map((t) => ({ ...t, id: uid() }));
        await supabase.from("tasks").insert(seeded.map((t) => taskToRow(t, user.id)));
        setTasks(seeded);
      } else {
        setTasks(loadedTasks);
      }

      setProjects(loadedProjects);
      setSettings(loadedSettings);
      setHydrated(true);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ─── Task 操作（楽観的更新: まずstateを更新 → バックグラウンドでDB同期） ──
  const addTask = useCallback(
    (task: Task) => {
      setTasks((prev) => [task, ...prev]);
      if (user) supabase.from("tasks").insert(taskToRow(task, user.id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      if (user) {
        const updated = { ...patch };
        // camelCase → snake_case の部分マッピング
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: Record<string, any> = {};
        if ("title" in updated) row.title = updated.title;
        if ("notes" in updated) row.notes = updated.notes ?? null;
        if ("type" in updated) row.type = updated.type;
        if ("category" in updated) row.category = updated.category;
        if ("priority" in updated) row.priority = updated.priority;
        if ("completed" in updated) row.completed = updated.completed;
        if ("progress" in updated) row.progress = updated.progress;
        if ("deadline" in updated) row.deadline = updated.deadline ?? null;
        if ("deadlineDate" in updated) row.deadline_date = updated.deadlineDate ?? null;
        if ("deadlineTime" in updated) row.deadline_time = updated.deadlineTime ?? null;
        if ("deadlineTs" in updated) row.deadline_ts = updated.deadlineTs ?? null;
        if ("scheduledDate" in updated) row.scheduled_date = updated.scheduledDate ?? null;
        if ("projectId" in updated) row.project_id = updated.projectId ?? null;
        if ("completedAt" in updated) row.completed_at = updated.completedAt ?? null;
        supabase.from("tasks").update(row).eq("id", id);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setProjects((prev) =>
        prev.map((p) => ({ ...p, taskIds: p.taskIds.filter((tid) => tid !== id) })),
      );
      if (user) supabase.from("tasks").delete().eq("id", id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const completed = !t.completed;
          const completedAt = completed ? Date.now() : undefined;
          if (user) {
            supabase
              .from("tasks")
              .update({ completed, completed_at: completedAt ?? null })
              .eq("id", id);
          }
          return { ...t, completed, completedAt };
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const updateProgress = useCallback(
    (id: string, progress: number) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress } : t)));
      if (user) supabase.from("tasks").update({ progress }).eq("id", id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const moveTaskToDate = useCallback(
    (id: string, date: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, scheduledDate: date } : t)),
      );
      if (user)
        supabase.from("tasks").update({ scheduled_date: date }).eq("id", id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  // ─── Project 操作 ─────────────────────────────────────────────────
  const addProject = useCallback(
    (project: Project) => {
      setProjects((prev) => [project, ...prev]);
      if (user) supabase.from("projects").insert(projectToRow(project, user.id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: Record<string, any> = {};
        if ("name" in patch) row.name = patch.name;
        if ("description" in patch) row.description = patch.description ?? null;
        if ("emoji" in patch) row.emoji = patch.emoji;
        if ("color" in patch) row.color = patch.color;
        if ("taskIds" in patch) row.task_ids = patch.taskIds;
        supabase.from("projects").update(row).eq("id", id);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) =>
        prev.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)),
      );
      if (user) supabase.from("projects").delete().eq("id", id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  // ─── Settings 操作 ────────────────────────────────────────────────
  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (user) {
          supabase
            .from("settings")
            .upsert(settingsToRow(next, user.id), { onConflict: "user_id" });
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      projects,
      settings,
      hydrated,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      updateProgress,
      moveTaskToDate,
      addProject,
      updateProject,
      deleteProject,
      updateSettings,
    }),
    [
      tasks, projects, settings, hydrated,
      addTask, updateTask, deleteTask, toggleTask, updateProgress, moveTaskToDate,
      addProject, updateProject, deleteProject, updateSettings,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
