"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useLocalStorage, uid } from "@/lib/storage";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarColor: string;
}

interface AuthContextValue {
  user: User | null;
  users: User[];
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const AVATAR_COLORS = [
  "#4361EE", "#7C5CE5", "#e17055", "#00b894",
  "#0984e3", "#fd79a8", "#fdcb6e", "#6c5ce7",
];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>("ef:users", []);
  const [user, setUser] = useLocalStorage<User | null>("ef:current-user", null);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const e = email.trim().toLowerCase();
      if (!e || !password)
        return { ok: false, error: "メールアドレスとパスワードは必須です" };
      if (users.find((u) => u.email === e))
        return { ok: false, error: "そのメールは既に使われています" };
      const newUser: User = {
        id: uid(),
        name: name.trim() || e.split("@")[0],
        email: e,
        password,
        avatarColor:
          AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      };
      setUsers((prev) => [newUser, ...prev]);
      setUser(newUser);
      return { ok: true };
    },
    [users, setUsers, setUser],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const e = email.trim().toLowerCase();
      const found = users.find((u) => u.email === e && u.password === password);
      if (!found)
        return { ok: false, error: "メールアドレスかパスワードが違います" };
      setUser(found);
      return { ok: true };
    },
    [users, setUser],
  );

  const signOut = useCallback(() => setUser(null), [setUser]);

  const value = useMemo(
    () => ({ user, users, signUp, signIn, signOut }),
    [user, users, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
