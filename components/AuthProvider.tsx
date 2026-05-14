"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

interface AuthContextValue {
  user: User | null;
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

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Supabase の User オブジェクト → アプリの User 型に変換
function sessionToUser(supaUser: {
  id: string;
  email?: string;
  user_metadata: Record<string, string>;
}): User {
  return {
    id: supaUser.id,
    name:
      supaUser.user_metadata?.name ??
      supaUser.email?.split("@")[0] ??
      "User",
    email: supaUser.email ?? "",
    avatarColor: supaUser.user_metadata?.avatarColor ?? "#4361EE",
  };
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // undefined = 初期化中, null = 未ログイン, User = ログイン済み
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const supabase = createClient();

  useEffect(() => {
    // 初回: 現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? sessionToUser(session.user) : null);
    });

    // 以降: ログイン/ログアウトイベントを監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? sessionToUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim() || email.split("@")[0],
            avatarColor: randomColor(),
          },
        },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error)
        return { ok: false, error: "メールアドレスかパスワードが違います" };
      return { ok: true };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ user: user ?? null, signUp, signIn, signOut }),
    [user, signUp, signIn, signOut],
  );

  // セッション確認中はスピナーを表示
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-app">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
