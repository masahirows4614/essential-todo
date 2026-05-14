"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import type { Task } from "@/lib/types";
import Link from "next/link";

const PRIORITY_SIZE: Record<string, number> = {
  urgent: 160,
  high: 136,
  normal: 116,
  low: 96,
};

const PRIORITY_GRADIENT: Record<string, string> = {
  urgent: "from-rose-500 to-orange-400",
  high: "from-indigo-500 to-violet-500",
  normal: "from-sky-400 to-indigo-400",
  low: "from-emerald-400 to-teal-400",
};

interface BubbleProps {
  task: Task;
  onPop: (id: string) => void;
  style: React.CSSProperties;
}

function Bubble({ task, onPop, style }: BubbleProps) {
  const reduce = useReducedMotion();
  const [popping, setPopping] = useState(false);
  const size = PRIORITY_SIZE[task.priority] ?? 116;
  const grad = PRIORITY_GRADIENT[task.priority] ?? PRIORITY_GRADIENT.normal;

  function handlePop() {
    if (popping) return;
    setPopping(true);
    setTimeout(() => onPop(task.id), 480);
  }

  const floatY = Math.random() * 6 + 3;
  const floatDuration = Math.random() * 2 + 2.5;

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={popping ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={popping ? { duration: 0.48, ease: "easeOut" } : { type: "spring", stiffness: 320, damping: 22 }}
      className="absolute cursor-pointer select-none"
      style={{ width: size, height: size, ...style }}
      onClick={handlePop}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -floatY, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
      >
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${grad} flex flex-col items-center justify-center shadow-lg shadow-black/10 relative overflow-hidden`}
        >
          {/* Gloss overlay */}
          <div className="absolute top-2 left-3 w-1/2 h-1/3 rounded-full bg-white/25 blur-sm" />
          {/* Ring for urgent */}
          {task.priority === "urgent" && (
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full ring-2 ring-rose-400/60"
            />
          )}
          <p className="z-10 text-center text-white font-bold leading-tight px-3 text-xs">
            {task.title.length > 24 ? task.title.slice(0, 22) + "…" : task.title}
          </p>
          <p className="z-10 mt-1 text-white/60 text-[10px]">タップで完了</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function positionBubbles(count: number): React.CSSProperties[] {
  const positions: React.CSSProperties[] = [];
  const margin = 0.05;
  for (let i = 0; i < count; i++) {
    let tries = 0;
    let x: number, y: number;
    do {
      x = margin + Math.random() * (1 - 2 * margin);
      y = margin + Math.random() * (1 - 2 * margin);
      tries++;
    } while (tries < 20 && positions.some((p) => {
      const dx = (parseFloat(p.left as string) / 100) - x;
      const dy = (parseFloat(p.top as string) / 100) - y;
      return Math.sqrt(dx * dx + dy * dy) < 0.18;
    }));
    positions.push({ left: `${x * 100}%`, top: `${y * 100}%`, transform: "translate(-50%, -50%)" });
  }
  return positions;
}

export default function BubbleFocus() {
  const { tasks, toggleTask } = useTasks();
  const reduce = useReducedMotion();

  const pending = useMemo(
    () => tasks.filter((t) => !t.completed).slice(0, 12),
    [tasks],
  );

  const positions = useMemo(() => positionBubbles(pending.length), [pending.length]);

  const [completedThisSession, setCompletedThisSession] = useState(0);
  const [confettis, setConfettis] = useState<number[]>([]);

  function handlePop(id: string) {
    toggleTask(id);
    setCompletedThisSession((n) => n + 1);
    setConfettis((prev) => [...prev, Date.now()]);
    setTimeout(() => setConfettis((prev) => prev.slice(1)), 1200);
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 20% 80%, #4361EE 0%, transparent 40%), radial-gradient(circle at 80% 20%, #7C5CE5 0%, transparent 40%)",
      }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-6">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest">フォーカスモード</p>
          <h1 className="text-white font-bold text-lg mt-0.5">バブルをタップして完了</h1>
        </div>
        <div className="flex items-center gap-3">
          {completedThisSession > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm"
            >
              <span className="text-sm">✨</span>
              <span className="text-white text-xs font-semibold">{completedThisSession}件完了</span>
            </motion.div>
          )}
          <Link href="/" className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 transition backdrop-blur-sm">
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bubbles */}
      <div className="absolute inset-0 pt-24 pb-8">
        <AnimatePresence>
          {pending.map((task, i) => (
            <Bubble
              key={task.id}
              task={task}
              onPop={handlePop}
              style={positions[i] ?? { left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
            />
          ))}
        </AnimatePresence>

        {pending.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
          >
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">全部完了！</h2>
            <p className="text-white/60 text-sm mb-6">素晴らしい集中力でした</p>
            <Link
              href="/"
              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 transition"
            >
              フローに戻る
            </Link>
          </motion.div>
        )}
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {!reduce && confettis.map((key) => (
          <motion.div
            key={key}
            className="pointer-events-none absolute inset-0 overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                  backgroundColor: ["#4361EE", "#7C5CE5", "#fd79a8", "#fdcb6e", "#00b894"][i % 5],
                }}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [1, 1, 0],
                  scale: [0, 1, 0.5],
                  x: (Math.random() - 0.5) * 120,
                  y: (Math.random() - 0.5) * 120,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
