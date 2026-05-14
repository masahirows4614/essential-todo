"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  useLocalStorage,
  uid,
  TASKS_KEY,
  PROJECTS_KEY,
  SETTINGS_KEY,
  DEFAULT_TASKS,
  DEFAULT_PROJECTS,
  DEFAULT_SETTINGS,
} from "@/lib/storage";
import type { AppSettings, Project, Task } from "@/lib/types";

interface TaskContextValue {
  tasks: Task[];
  projects: Project[];
  settings: AppSettings;
  hydrated: boolean;
  // Task ops
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  moveTaskToDate: (id: string, date: string) => void;
  // Project ops
  addProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Settings ops
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks, tasksHydrated] = useLocalStorage<Task[]>(TASKS_KEY, DEFAULT_TASKS);
  const [projects, setProjects] = useLocalStorage<Project[]>(PROJECTS_KEY, DEFAULT_PROJECTS);
  const [settings, setSettings] = useLocalStorage<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, [setTasks]);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setProjects((prev) =>
      prev.map((p) => ({ ...p, taskIds: p.taskIds.filter((tid) => tid !== id) })),
    );
  }, [setTasks, setProjects]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : undefined,
            }
          : t,
      ),
    );
  }, [setTasks]);

  const updateProgress = useCallback((id: string, progress: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress } : t)));
  }, [setTasks]);

  const moveTaskToDate = useCallback((id: string, date: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, scheduledDate: date } : t)),
    );
  }, [setTasks]);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev]);
  }, [setProjects]);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) =>
      prev.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t)),
    );
  }, [setProjects, setTasks]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, [setSettings]);

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      projects,
      settings,
      hydrated: tasksHydrated,
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
      tasks, projects, settings, tasksHydrated,
      addTask, updateTask, deleteTask, toggleTask, updateProgress, moveTaskToDate,
      addProject, updateProject, deleteProject, updateSettings,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
