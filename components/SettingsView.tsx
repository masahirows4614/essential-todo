"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

const MOOD_PRESETS = [
  { emoji: "🌊", text: "いい感じ！この調子でいこう ✨" },
  { emoji: "🔥", text: "今日はめちゃくちゃ集中できてる！" },
  { emoji: "😴", text: "ちょっと眠い…でも頑張る" },
  { emoji: "🌿", text: "穏やかな一日。丁寧に進もう" },
  { emoji: "⚡", text: "エネルギー全開！何でもできる" },
  { emoji: "🌧️", text: "今日はゆっくりペースで" },
];

export default function SettingsView() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings, tasks } = useTasks();
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.reload();
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const mustDone = tasks.filter((t) => t.type === "must" && t.completed).length;
  const mustTotal = tasks.filter((t) => t.type === "must").length;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 sm:px-8 lg:px-10 lg:pt-10">
        <h1 className="text-2xl font-bold text-slate-800">
          設定
          <span className="ml-2 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">& プロフィール</span>
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">アプリの設定を管理しよう</p>
      </div>

      <div className="px-5 pb-24 sm:px-8 lg:px-10 space-y-4">
        {/* Profile */}
        <Section title="プロフィール" emoji="👤">
          {user ? (
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-md"
                style={{ backgroundColor: user.avatarColor ?? "#4361EE" }}
              >
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="shrink-0 rounded-xl py-2 px-3 text-xs font-semibold text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50 transition"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/signin" className="flex-1 rounded-2xl py-3 text-center text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 transition">
                サインイン
              </Link>
              <Link href="/signup" className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-center text-sm font-semibold text-white hover:brightness-105 transition">
                新規登録
              </Link>
            </div>
          )}
        </Section>

        {/* Stats */}
        <Section title="今週の統計" emoji="📊">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="完了タスク" value={completedCount} total={totalCount} color="#4361EE" />
            <StatCard label="課題完了率" value={mustDone} total={mustTotal} color="#7C5CE5" />
          </div>
        </Section>

        {/* App settings */}
        <Section title="アプリ設定" emoji="⚙️">
          <div className="space-y-4">
            {/* Stale threshold */}
            <div>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">タスク経過アラート</p>
                  <p className="text-xs text-slate-400 mt-0.5">何日経ったら「本当に必要?」を表示するか</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ staleThresholdDays: Math.max(1, settings.staleThresholdDays - 1) })}
                    className="h-7 w-7 rounded-full ring-1 ring-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-indigo-600">{settings.staleThresholdDays}日</span>
                  <button
                    type="button"
                    onClick={() => updateSettings({ staleThresholdDays: Math.min(14, settings.staleThresholdDays + 1) })}
                    className="h-7 w-7 rounded-full ring-1 ring-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition"
                  >
                    ＋
                  </button>
                </div>
              </label>
            </div>

            {/* Week starts on */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">週の開始日</p>
              <div className="grid grid-cols-2 gap-2">
                {([{ label: "月曜日から", value: 1 }, { label: "日曜日から", value: 0 }] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateSettings({ weekStartsOn: opt.value })}
                    className={`rounded-2xl py-2.5 text-sm font-medium transition ${
                      settings.weekStartsOn === opt.value
                        ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-indigo-600 ring-1 ring-indigo-200"
                        : "bg-slate-50 text-slate-500 ring-1 ring-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Show completed */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-700">完了済みタスクを表示</p>
                <p className="text-xs text-slate-400 mt-0.5">デフォルトで完了タスクを見せる</p>
              </div>
              <div
                onClick={() => updateSettings({ showCompleted: !settings.showCompleted })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.showCompleted ? "bg-indigo-500" : "bg-slate-200"}`}
              >
                <motion.div
                  animate={{ x: settings.showCompleted ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                />
              </div>
            </label>
          </div>
        </Section>

        {/* Mood */}
        <Section title="今週のムード" emoji="🌊">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {MOOD_PRESETS.map((preset) => (
              <motion.button
                key={preset.emoji}
                type="button"
                onClick={() => updateSettings({ moodEmoji: preset.emoji, moodText: preset.text })}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition ${
                  settings.moodEmoji === preset.emoji
                    ? "bg-gradient-to-br from-indigo-50 to-violet-50 ring-2 ring-indigo-300"
                    : "bg-slate-50 ring-1 ring-slate-100 hover:bg-indigo-50"
                }`}
              >
                <span className="text-2xl">{preset.emoji}</span>
                <span className="text-[10px] text-slate-500 leading-snug">{preset.text.split("　")[0]}</span>
              </motion.button>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <input
              type="text"
              value={settings.moodEmoji}
              onChange={(e) => updateSettings({ moodEmoji: e.target.value })}
              placeholder="絵文字"
              className="w-20 rounded-xl bg-slate-50 px-3 py-2 text-center text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300"
              maxLength={2}
            />
            <input
              type="text"
              value={settings.moodText}
              onChange={(e) => updateSettings({ moodText: e.target.value })}
              placeholder="カスタムメッセージ…"
              className="rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300"
            />
          </div>
        </Section>

        {/* Data */}
        <Section title="データ管理" emoji="🗂️">
          <div className="space-y-2">
            <p className="text-xs text-slate-400">すべてのデータはブラウザのlocalStorageに保存されています</p>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full rounded-2xl py-3 text-sm font-semibold text-rose-500 ring-1 ring-rose-200 hover:bg-rose-50 transition"
              >
                すべてのデータをリセット
              </button>
            ) : (
              <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
                <p className="text-sm font-semibold text-rose-700 mb-3">本当にリセットしますか？この操作は元に戻せません。</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-xl py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 bg-white hover:bg-slate-50 transition"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 rounded-xl bg-rose-500 py-2 text-xs font-semibold text-white hover:bg-rose-600 transition"
                  >
                    リセットする
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>

        <p className="text-center text-[11px] text-slate-300 pb-4">Essential Flow v0.2.0</p>
      </div>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="glass-card border-t border-slate-200/60 px-2 pb-5 pt-2">
          <div className="flex items-center justify-around">
            <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400">
              <span className="text-xl leading-none">🏠</span>フロー
            </Link>
            <Link href="/weekly" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400">
              <span className="text-xl leading-none">📅</span>週間
            </Link>
            <Link href="/" className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </Link>
            <Link href="/projects" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-slate-400">
              <span className="text-xl leading-none">📁</span>プロジェクト
            </Link>
            <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-indigo-600">
              <span className="text-xl leading-none">⚙️</span>設定
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{emoji}</span>
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function StatCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}<span className="text-sm text-slate-300 font-normal">/{total}</span></p>
      <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  );
}
