import type { Task } from "./types";

export const STALE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

export function isStale(task: Task, now: number = Date.now()): boolean {
  if (task.completed) return false;
  if (task.type === "must") return false;
  return now - task.createdAt > STALE_THRESHOLD_MS;
}

export function daysOld(task: Task, now: number = Date.now()): number {
  return Math.floor((now - task.createdAt) / (24 * 60 * 60 * 1000));
}
