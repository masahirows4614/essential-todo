// ─── Task ───────────────────────────────────────────────────────────────
export type TaskType = "must" | "optional";

export type CategoryKey =
  | "university" | "work" | "health"
  | "personal"   | "lifestyle" | "hobby";

export type Priority = "urgent" | "high" | "normal" | "low";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  type: TaskType;
  category: CategoryKey;
  priority: Priority;
  completed: boolean;
  progress: number;          // 0–100
  deadline?: string;         // 表示用テキスト e.g. "今日 23:59"
  deadlineDate?: string;     // YYYY-MM-DD (カレンダー選択値)
  deadlineTime?: string;     // HH:MM
  deadlineTs?: number;       // ms timestamp
  scheduledDate?: string;    // YYYY-MM-DD (ウィークリーボード配置)
  projectId?: string;
  createdAt: number;
  completedAt?: number;
}

// ─── Project ────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  color: string;             // hex
  taskIds: string[];
  createdAt: number;
}

// ─── User / Auth ─────────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: number;
}

// ─── Settings ────────────────────────────────────────────────────────────
export interface AppSettings {
  staleThresholdDays: number;  // default 3
  weekStartsOn: 0 | 1;         // 0=日曜, 1=月曜
  showCompleted: boolean;
  moodEmoji: string;
  moodText: string;
}
