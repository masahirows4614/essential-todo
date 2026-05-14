"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import Link from "next/link";

// ─── 型定義 ─────────────────────────────────────────────────────────
interface Goal {
  id: string;
  text: string;
  emoji: string;
  color: string;
}

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  doneToday: boolean;
  streak: number;
  lastDate: string; // YYYY-MM-DD
}

interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  mood: string;
}

const GOAL_COLORS = ["#6366f1", "#f97316", "#10b981", "#ec4899", "#f59e0b", "#8b5cf6"];
const HABIT_COLORS = ["#4361EE", "#e17055", "#00b894", "#fd79a8", "#fdcb6e", "#6c5ce7"];
const MOODS = ["🌟", "😊", "😐", "😴", "🔥", "🌿"];

const todayStr = () => new Date().toISOString().split("T")[0];

function useLocalAxis<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [val, setVal] = useState<T>(init);
  useEffect(() => {
    try { const r = localStorage.getItem(key); if (r) setVal(JSON.parse(r) as T); } catch { /* noop */ }
  }, [key]);
  const save = (v: T | ((p: T) => T)) => {
    setVal((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };
  return [val, save];
}

// ─── セクション共通 ──────────────────────────────────────────────────
function Section({ title, emoji, children, action }: {
  title: string; emoji: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

// ─── ゴールカード ────────────────────────────────────────────────────
function GoalBoard() {
  const [goals, setGoals] = useLocalAxis<Goal[]>("axis:goals", []);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [color, setColor] = useState(GOAL_COLORS[0]);

  function addGoal() {
    if (!text.trim()) return;
    setGoals((prev) => [...prev, { id: Date.now().toString(), text: text.trim(), emoji, color }]);
    setText(""); setEmoji("🎯"); setColor(GOAL_COLORS[0]); setAdding(false);
  }

  return (
    <Section title="ビジョン & ゴール" emoji="🎯" action={
      <button onClick={() => setAdding(true)}
        className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition">
        ＋ 追加
      </button>
    }>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AnimatePresence>
          {goals.map((g) => (
            <motion.div key={g.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              className="group relative rounded-2xl p-4 text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${g.color}dd, ${g.color}88)` }}>
              <div className="text-2xl mb-2">{g.emoji}</div>
              <p className="text-sm font-semibold leading-snug">{g.text}</p>
              <button onClick={() => setGoals((prev) => prev.filter((x) => x.id !== g.id))}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 rounded-full p-1 bg-white/20 hover:bg-white/40 transition">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="white">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {goals.length === 0 && !adding && (
          <div className="col-span-full flex flex-col items-center py-6 text-slate-300">
            <span className="text-4xl mb-2">🌟</span>
            <p className="text-sm">夢や目標を書き出そう</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2.5 overflow-hidden">
            <input autoFocus value={text} onChange={(e) => setText(e.target.value)}
              placeholder="目標を入力…" onKeyDown={(e) => e.key === "Enter" && addGoal()}
              className="w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300" />
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 flex-wrap">
                {["🎯", "🚀", "💪", "🌈", "💡", "✨", "🏆", "❤️"].map((em) => (
                  <button key={em} onClick={() => setEmoji(em)}
                    className={`h-8 w-8 rounded-xl text-lg transition ${emoji === em ? "bg-indigo-100 ring-2 ring-indigo-400" : "bg-slate-50 hover:bg-slate-100"}`}>{em}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5">
              {GOAL_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition ${color === c ? "ring-2 ring-offset-1 ring-slate-400 scale-125" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 rounded-2xl py-2.5 text-sm text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50">キャンセル</button>
              <button onClick={addGoal} className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-semibold text-white">追加する</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

// ─── 習慣トラッカー ──────────────────────────────────────────────────
function HabitTracker() {
  const [habits, setHabits] = useLocalAxis<Habit[]>("axis:habits", []);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💧");
  const [color, setColor] = useState(HABIT_COLORS[0]);

  const today = todayStr();

  function toggleHabit(id: string) {
    setHabits((prev) => prev.map((h) => {
      if (h.id !== id) return h;
      const wasToday = h.lastDate === today;
      const newDone = !h.doneToday;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const newStreak = newDone
        ? (h.lastDate === yesterdayStr || h.lastDate === today ? h.streak + (wasToday ? 0 : 1) : 1)
        : Math.max(0, h.streak - 1);
      return { ...h, doneToday: newDone, streak: newStreak, lastDate: newDone ? today : h.lastDate };
    }));
  }

  // 日付変更時にdoneToday をリセット
  useEffect(() => {
    setHabits((prev) => prev.map((h) => ({
      ...h,
      doneToday: h.lastDate === today ? h.doneToday : false,
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  function addHabit() {
    if (!name.trim()) return;
    setHabits((prev) => [...prev, { id: Date.now().toString(), name: name.trim(), emoji, color, doneToday: false, streak: 0, lastDate: "" }]);
    setName(""); setEmoji("💧"); setColor(HABIT_COLORS[0]); setAdding(false);
  }

  const donePct = habits.length > 0 ? Math.round((habits.filter((h) => h.doneToday).length / habits.length) * 100) : 0;

  return (
    <Section title="習慣トラッカー" emoji="🔥" action={
      <button onClick={() => setAdding(true)}
        className="rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-100 transition">
        ＋ 追加
      </button>
    }>
      {habits.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">今日の達成率</span>
            <span className="text-sm font-bold text-indigo-600">{donePct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: 0 }} animate={{ width: `${donePct}%` }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {habits.map((h) => (
            <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 transition"
              style={{ backgroundColor: h.doneToday ? h.color + "15" : "#f8fafc" }}>
              <motion.button onClick={() => toggleHabit(h.id)}
                whileTap={{ scale: 0.85 }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg shadow-sm transition ${
                  h.doneToday ? "text-white" : "bg-white ring-1 ring-slate-200"
                }`}
                style={h.doneToday ? { background: `linear-gradient(135deg, ${h.color}, ${h.color}99)` } : {}}>
                {h.emoji}
              </motion.button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${h.doneToday ? "text-slate-700" : "text-slate-500"}`}>{h.name}</p>
                {h.streak > 0 && (
                  <p className="text-[11px] text-orange-400 font-medium">🔥 {h.streak}日連続</p>
                )}
              </div>
              <motion.div animate={h.doneToday ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
                {h.doneToday && <span className="text-lg">✅</span>}
              </motion.div>
              <button onClick={() => setHabits((prev) => prev.filter((x) => x.id !== h.id))}
                className="opacity-0 group-hover:opacity-100 rounded-full p-1 text-slate-200 hover:text-rose-400 transition">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {habits.length === 0 && !adding && (
          <div className="flex flex-col items-center py-6 text-slate-300">
            <span className="text-4xl mb-2">💪</span>
            <p className="text-sm">毎日の習慣を記録しよう</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2.5 overflow-hidden">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="習慣名（例: 水を飲む）"
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              className="w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-sm outline-none ring-1 ring-slate-200 focus:ring-indigo-300" />
            <div className="flex flex-wrap gap-1.5">
              {["💧", "🏃", "📚", "🧘", "🎵", "✍️", "🥗", "😴"].map((em) => (
                <button key={em} onClick={() => setEmoji(em)}
                  className={`h-8 w-8 rounded-xl text-lg transition ${emoji === em ? "bg-indigo-100 ring-2 ring-indigo-400" : "bg-slate-50 hover:bg-slate-100"}`}>{em}</button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {HABIT_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition ${color === c ? "ring-2 ring-offset-1 ring-slate-400 scale-125" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 rounded-2xl py-2.5 text-sm text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50">キャンセル</button>
              <button onClick={addHabit} className="flex-1 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-2.5 text-sm font-semibold text-white">追加する</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

// ─── 振り返り日記 ─────────────────────────────────────────────────────
function Journal() {
  const [entries, setEntries] = useLocalAxis<JournalEntry[]>("axis:journal", []);
  const [text, setText] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const today = todayStr();

  const todayEntry = entries.find((e) => e.date === today);

  function saveEntry() {
    if (!text.trim()) return;
    const entry: JournalEntry = { id: today, date: today, text: text.trim(), mood };
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      return [entry, ...filtered].slice(0, 30); // 最新30件
    });
    setText("");
  }

  useEffect(() => {
    if (todayEntry) { setText(todayEntry.text); setMood(todayEntry.mood); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Section title="今日の振り返り" emoji="📓">
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-1.5">
          {MOODS.map((m) => (
            <button key={m} onClick={() => setMood(m)}
              className={`h-9 w-9 rounded-xl text-xl transition ${mood === m ? "bg-indigo-100 ring-2 ring-indigo-300 scale-110" : "hover:bg-slate-50 hover:scale-105"}`}>{m}</button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="今日はどんな一日でしたか？気づきや感謝、明日への意気込みを…"
          className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-indigo-300 transition resize-none min-h-[100px]"
        />
        <motion.button onClick={saveEntry} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 py-2.5 text-sm font-semibold text-white shadow-md">
          {todayEntry ? "✏️ 更新する" : "✨ 今日の振り返りを保存"}
        </motion.button>
      </div>

      {entries.filter((e) => e.date !== today).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">過去の記録</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {entries.filter((e) => e.date !== today).slice(0, 7).map((e) => (
              <div key={e.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400">{e.date}</span>
                  <span className="text-base">{e.mood}</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug line-clamp-2">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── ストリーク & 実績 ─────────────────────────────────────────────────
function StreakPanel() {
  const { tasks } = useTasks();
  const today = todayStr();

  const completedToday = tasks.filter(
    (t) => t.completed && t.completedAt && new Date(t.completedAt).toISOString().split("T")[0] === today
  ).length;

  const mustCompleted = tasks.filter((t) => t.type === "must" && t.completed).length;
  const mustTotal = tasks.filter((t) => t.type === "must").length;
  const optionalCompleted = tasks.filter((t) => t.type === "optional" && t.completed).length;

  const badges = [
    { emoji: "🏆", label: "最初の完了", unlocked: tasks.some((t) => t.completed) },
    { emoji: "🌟", label: "5タスク完了", unlocked: mustCompleted >= 5 },
    { emoji: "🔥", label: "10タスク完了", unlocked: mustCompleted >= 10 },
    { emoji: "💎", label: "20タスク完了", unlocked: mustCompleted >= 20 },
    { emoji: "🎯", label: "プロジェクト開始", unlocked: false },
    { emoji: "✨", label: "Optional達成者", unlocked: optionalCompleted >= 3 },
  ];

  return (
    <Section title="実績 & バッジ" emoji="🏅">
      <div className="grid grid-cols-3 gap-3 mb-4 sm:grid-cols-6">
        {badges.map((b) => (
          <motion.div key={b.label}
            whileHover={b.unlocked ? { scale: 1.08, y: -2 } : {}}
            className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition ${
              b.unlocked ? "bg-gradient-to-br from-indigo-50 to-violet-50 ring-1 ring-indigo-200" : "bg-slate-50 opacity-40"
            }`}
          >
            <span className="text-2xl">{b.emoji}</span>
            <span className="text-[10px] text-slate-500 leading-snug">{b.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "今日完了", value: completedToday, emoji: "✅", color: "#10b981" },
          { label: "Must達成", value: mustCompleted, emoji: "📌", color: "#6366f1" },
          { label: "Optional", value: optionalCompleted, emoji: "✨", color: "#f97316" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-100">
            <div className="text-xl mb-0.5">{stat.emoji}</div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── メインページ ─────────────────────────────────────────────────────
export default function AxisPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-7 pb-4 sm:px-8 lg:px-10 lg:pt-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-md">
            <span className="text-lg">🧭</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              自分軸
              <span className="ml-2 bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">ページ</span>
            </h1>
            <p className="text-xs text-slate-400">目標・習慣・振り返りで自分を高めよう</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-24 sm:px-8 lg:px-10 space-y-4">
        <GoalBoard />
        <HabitTracker />
        <StreakPanel />
        <Journal />
      </div>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="glass-card border-t border-slate-200/60 px-2 pb-5 pt-2">
          <div className="flex items-center justify-around">
            <Link href="/" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-slate-400"><span className="text-xl leading-none">🏠</span>フロー</Link>
            <Link href="/weekly" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-slate-400"><span className="text-xl leading-none">📅</span>週間</Link>
            <Link href="/" className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
            </Link>
            <Link href="/axis" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-violet-600"><span className="text-xl leading-none">🧭</span>自分軸</Link>
            <Link href="/settings" className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-slate-400"><span className="text-xl leading-none">⚙️</span>設定</Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
