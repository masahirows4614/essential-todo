"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useAuth } from "./AuthProvider";
import { useTasks } from "@/contexts/TaskContext";

const AVATAR_COLORS = [
  "#4361EE", "#7C5CE5", "#e17055", "#00b894",
  "#0984e3", "#fd79a8", "#fdcb6e", "#6c5ce7",
  "#a29bfe", "#55efc4", "#fab1a0", "#74b9ff",
];

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ label, value, icon, color }: {
  label: string; value: number | string; icon: string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-extrabold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[11px] text-slate-400 font-medium text-center leading-tight">{label}</p>
    </motion.div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const { tasks, projects } = useTasks();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor ?? "#4361EE");

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const must = tasks.filter((t) => t.type === "must").length;
    const mustDone = tasks.filter((t) => t.type === "must" && t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, must, mustDone, rate, projects: projects.length };
  }, [tasks, projects]);

  async function handleSaveName() {
    if (!nameInput.trim()) return;
    setSaving(true);
    await updateProfile({ name: nameInput.trim() });
    setSaving(false);
    setEditingName(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleColorChange(color: string) {
    setSelectedColor(color);
    await updateProfile({ avatarColor: color });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400">ログインしてください</p>
      </div>
    );
  }

  const initial = user.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="h-full overflow-y-auto bg-app">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">

        {/* ── Header ────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">マイページ</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-800">プロフィール</h1>
        </div>

        {/* ── Avatar + Name card ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden"
        >
          {/* Gradient top strip */}
          <div
            className="h-20 w-full"
            style={{ background: `linear-gradient(135deg, ${selectedColor}cc 0%, ${selectedColor}55 100%)` }}
          />

          <div className="px-6 pb-6 -mt-10">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shadow-lg ring-4 ring-white"
              style={{ backgroundColor: selectedColor }}
            >
              {initial}
            </motion.div>

            {/* Name */}
            <div className="mt-4 flex items-center gap-3">
              {editingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-105 transition disabled:opacity-60"
                  >
                    {saving ? "…" : "保存"}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameInput(user.name); }}
                    className="rounded-xl px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-100 transition"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setEditingName(true)}
                    className="ml-auto rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    ✏️ 名前を変更
                  </button>
                </>
              )}
            </div>

            {/* Saved toast */}
            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 text-xs font-medium text-emerald-500"
                >
                  ✓ 保存しました
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Avatar color picker ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100"
        >
          <p className="mb-3 text-sm font-semibold text-slate-600">アバターカラー</p>
          <div className="flex flex-wrap gap-3">
            {AVATAR_COLORS.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleColorChange(color)}
                className="w-8 h-8 rounded-full transition"
                style={{
                  backgroundColor: color,
                  boxShadow: selectedColor === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : "none",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Stats ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">統計</p>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="完了タスク" value={stats.completed} icon="✅" color="#00b894" />
            <StatCard label="達成率" value={`${stats.rate}%`} icon="📊" color="#4361EE" />
            <StatCard label="プロジェクト" value={stats.projects} icon="📁" color="#7C5CE5" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatCard label="総タスク数" value={stats.total} icon="📋" color="#0984e3" />
            <StatCard label="必須タスク完了" value={`${stats.mustDone}/${stats.must}`} icon="🎯" color="#e17055" />
          </div>
        </motion.div>

        {/* ── Progress bar ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-slate-600">全体の進捗</p>
            <span className="text-sm font-bold text-indigo-600 tabular-nums">{stats.rate}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.rate}%` }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ background: "linear-gradient(90deg, #4361EE 0%, #7C5CE5 100%)" }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {stats.completed}件完了 / {stats.total}件中
          </p>
        </motion.div>

        {/* ── Account info ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-100 space-y-3"
        >
          <p className="text-sm font-semibold text-slate-600">アカウント情報</p>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-xs text-slate-400">メールアドレス</span>
            <span className="text-sm font-medium text-slate-700">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-slate-400">ユーザーID</span>
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px]">{user.id}</span>
          </div>
        </motion.div>

        {/* ── Sign out ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={signOut}
            className="w-full rounded-2xl bg-rose-50 py-3.5 text-sm font-semibold text-rose-500 hover:bg-rose-100 transition ring-1 ring-rose-100"
          >
            ログアウト
          </button>
        </motion.div>

        <div className="h-4" />
      </div>
    </div>
  );
}
