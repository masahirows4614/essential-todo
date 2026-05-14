"use client";

import type { AppUser } from "./types";

const USER_KEY = "ef:user";

const AVATAR_COLORS = [
  "#4361EE", "#7C5CE5", "#e17055", "#00b894",
  "#0984e3", "#fd79a8", "#fdcb6e", "#6c5ce7",
];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function getUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch { return null; }
}

export function signUp(name: string, email: string): AppUser {
  const user: AppUser = {
    id: `u_${Math.random().toString(36).slice(2)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    avatarColor: randomColor(),
    createdAt: Date.now(),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/** ローカルに保存済みのメールと一致すれば成功 */
export function signIn(email: string): AppUser | null {
  const user = getUser();
  if (!user) return null;
  return user.email === email.trim().toLowerCase() ? user : null;
}

export function updateUser(patch: Partial<Omit<AppUser, "id" | "createdAt">>): AppUser | null {
  const current = getUser();
  if (!current) return null;
  const updated = { ...current, ...patch };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

export function signOut() {
  localStorage.removeItem(USER_KEY);
}
