"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

interface UserRow {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function downloadCSV(users: UserRow[]) {
  const header = ["ID", "メールアドレス", "名前", "登録日時"];
  const rows = users.map((u) => [
    u.id,
    u.email,
    `"${u.name.replace(/"/g, '""')}"`,
    formatDate(u.created_at),
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const supabase = createClient();
      // auth.users はサービスロールキーが必要なため、
      // ここでは profiles テーブル or tasks テーブルから distinct user_id を取得
      // profiles テーブルがなければ tasks テーブルから集計
      const { data, error } = await supabase
        .from("tasks")
        .select("user_id, created_at")
        .order("created_at", { ascending: true });

      if (error) {
        setError("データ取得に失敗しました: " + error.message);
        setLoading(false);
        return;
      }

      // Deduplicate by user_id, keep earliest createdAt
      const map = new Map<string, { id: string; created_at: string }>();
      for (const row of data ?? []) {
        if (!map.has(row.user_id)) {
          map.set(row.user_id, { id: row.user_id, created_at: row.created_at });
        }
      }

      // Also fetch settings for name/email (stored in user_metadata on Supabase Auth)
      // We can get name from settings moodText is not useful; instead use the current signed-in user's data.
      // For a proper admin panel, we'd need a server-side route. Here we show what's available.
      const rows: UserRow[] = Array.from(map.values()).map((u) => ({
        id: u.id,
        email: u.id === user?.id ? (user?.email ?? "—") : u.id.slice(0, 8) + "…",
        name: u.id === user?.id ? (user?.name ?? "—") : "（非公開）",
        created_at: u.created_at,
      }));

      setUsers(rows);
      setLoading(false);
    }

    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-full overflow-y-auto bg-app">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">管理</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-800">ユーザー管理</h1>
          <p className="mt-0.5 text-xs text-slate-400">登録ユーザーの一覧と統計</p>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-extrabold text-gradient tabular-nums">{users.length}</p>
            <p className="mt-0.5 text-xs text-slate-400 font-medium">登録ユーザー数</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-extrabold text-indigo-600 tabular-nums">
              {new Date().toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 font-medium">今日の日付</p>
          </div>
        </motion.div>

        {/* Note about privacy */}
        <div className="rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
          <p className="text-xs text-amber-700 font-medium">
            ⚠️ セキュリティのため、他ユーザーのメールアドレスと名前は表示されません。完全な管理機能はSupabaseダッシュボードから確認できます。
          </p>
        </div>

        {/* Search + CSV */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="9" r="6" /><path d="M15 15l-3-3" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="検索…"
              className="w-full rounded-xl bg-white py-2 pl-9 pr-3 text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => downloadCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-md disabled:opacity-40"
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3v10M5 13l5 4 5-4M3 17h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            CSV出力
          </motion.button>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-rose-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">ユーザーが見つかりません</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">名前</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left">メールアドレス</th>
                  <th className="px-5 py-3 text-left">登録日時</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-5 py-3 text-slate-300 font-mono text-[11px]">{i + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: ["#4361EE","#7C5CE5","#e17055","#00b894","#0984e3"][i % 5] }}
                          >
                            {u.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <span className="font-medium text-slate-700">{u.name}</span>
                          {u.id === user?.id && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">あなた</span>
                          )}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3 text-slate-400 text-[12px] tabular-nums">{formatDate(u.created_at)}</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Supabase link */}
        <motion.a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-100 shadow-sm hover:ring-indigo-200 transition group"
        >
          <span className="text-xl">🚀</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition">Supabaseダッシュボードで詳細を確認</p>
            <p className="text-[11px] text-slate-400">認証ユーザー、DBテーブル、ログを管理できます</p>
          </div>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-slate-300 group-hover:text-indigo-400 transition">
            <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>

        <div className="h-4" />
      </div>
    </div>
  );
}
