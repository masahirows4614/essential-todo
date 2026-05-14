"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import type { Task } from "@/lib/types";
import Link from "next/link";

/* ─── Canvas size ───────────────────────────────────────────────── */
const CANVAS_W = 3200;
const CANVAS_H = 2200;

/* ─── Priority config ───────────────────────────────────────────── */
const PRIORITY_SIZE: Record<string, number> = {
  urgent: 168,
  high:   144,
  normal: 120,
  low:    96,
};
const PRIORITY_GRADIENT: Record<string, string> = {
  urgent: "from-rose-500 to-orange-400",
  high:   "from-indigo-500 to-violet-500",
  normal: "from-sky-400 to-indigo-400",
  low:    "from-emerald-400 to-teal-400",
};
const PRIORITY_GLOW: Record<string, string> = {
  urgent: "rgba(239,68,68,0.45)",
  high:   "rgba(99,102,241,0.4)",
  normal: "rgba(56,189,248,0.35)",
  low:    "rgba(16,185,129,0.3)",
};

/* ─── Bubble positions ──────────────────────────────────────────── */
function generatePositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const pad = 180;
  for (let i = 0; i < count; i++) {
    let tries = 0;
    let x: number, y: number;
    do {
      x = pad + Math.random() * (CANVAS_W - pad * 2);
      y = pad + Math.random() * (CANVAS_H - pad * 2);
      tries++;
    } while (
      tries < 30 &&
      positions.some((p) => Math.hypot(p.x - x, p.y - y) < 200)
    );
    positions.push({ x, y });
  }
  return positions;
}

/* ─── Bubble component ──────────────────────────────────────────── */
interface BubbleProps {
  task: Task;
  onPop: (id: string) => void;
  x: number;
  y: number;
}

function Bubble({ task, onPop, x, y }: BubbleProps) {
  const reduce = useReducedMotion();
  const [popping, setPopping] = useState(false);
  const size = PRIORITY_SIZE[task.priority ?? "normal"] ?? 120;
  const grad = PRIORITY_GRADIENT[task.priority ?? "normal"];
  const glow = PRIORITY_GLOW[task.priority ?? "normal"];
  const floatY = useMemo(() => Math.random() * 6 + 3, []);
  const floatDur = useMemo(() => Math.random() * 2 + 2.5, []);

  function handlePop(e: React.MouseEvent | React.TouchEvent) {
    e.stopPropagation();
    if (popping) return;
    setPopping(true);
    setTimeout(() => onPop(task.id), 480);
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={
        popping
          ? { scale: [1, 1.35, 0], opacity: [1, 1, 0] }
          : { scale: 1, opacity: 1 }
      }
      exit={{ scale: 0, opacity: 0 }}
      transition={
        popping
          ? { duration: 0.48, ease: "easeOut" }
          : { type: "spring", stiffness: 320, damping: 22 }
      }
      className="absolute cursor-pointer select-none"
      style={{
        width: size,
        height: size,
        left: x - size / 2,
        top: y - size / 2,
      }}
      onClick={handlePop}
      onTouchEnd={handlePop}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -8,
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: floatDur * 0.9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Float animation wrapper */}
      <motion.div
        className="w-full h-full"
        animate={reduce ? undefined : { y: [0, -floatY, 0] }}
        transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${grad} flex flex-col items-center justify-center relative overflow-hidden`}
          style={{ boxShadow: `0 12px 40px ${glow}, 0 4px 16px rgba(0,0,0,0.15)` }}
        >
          {/* Gloss */}
          <div className="absolute top-2.5 left-4 w-2/5 h-1/4 rounded-full bg-white/30 blur-sm pointer-events-none" />
          <div className="absolute top-1.5 left-3 w-1/4 h-1/6 rounded-full bg-white/20 blur-[1px] pointer-events-none" />

          {/* Urgent pulse ring */}
          {task.priority === "urgent" && (
            <motion.div
              animate={{ scale: [1, 1.14, 1], opacity: [0.55, 0.15, 0.55] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute inset-0 rounded-full ring-2 ring-rose-300/70 pointer-events-none"
            />
          )}

          {/* Content */}
          <p className="z-10 text-center text-white font-bold leading-tight px-3 text-xs drop-shadow">
            {task.title.length > 26 ? task.title.slice(0, 24) + "…" : task.title}
          </p>
          {task.deadline && (
            <p className="z-10 mt-1 text-white/60 text-[10px] tabular-nums">{task.deadline}</p>
          )}
          <p className="z-10 mt-1 text-white/50 text-[9px]">タップで完了</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Confetti burst ────────────────────────────────────────────── */
function ConfettiBurst({ key: _k }: { key: number }) {
  const colors = ["#4361EE", "#7C5CE5", "#fd79a8", "#fdcb6e", "#00b894", "#e17055"];
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 overflow-hidden z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.3 }}
    >
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 4,
            height: Math.random() * 6 + 4,
            left: `${35 + Math.random() * 30}%`,
            top: `${35 + Math.random() * 30}%`,
            backgroundColor: colors[i % colors.length],
          }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1, 0.6],
            x: (Math.random() - 0.5) * 160,
            y: (Math.random() - 0.5) * 160,
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
export default function BubbleFocus() {
  const { tasks, toggleTask } = useTasks();
  const reduce = useReducedMotion();

  const pending = useMemo(
    () => tasks.filter((t) => !t.completed).slice(0, 16),
    [tasks],
  );

  // Stable positions per task id
  const positionMap = useMemo(() => {
    const pts = generatePositions(pending.length);
    return Object.fromEntries(pending.map((t, i) => [t.id, pts[i]]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.length]);

  const [completedThisSession, setCompletedThisSession] = useState(0);
  const [confettis, setConfettis] = useState<number[]>([]);

  function handlePop(id: string) {
    toggleTask(id);
    setCompletedThisSession((n) => n + 1);
    const key = Date.now();
    setConfettis((prev) => [...prev, key]);
    setTimeout(() => setConfettis((prev) => prev.filter((k) => k !== key)), 1400);
  }

  /* ── Canvas pan ─────────────────────────────────────────────── */
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);

  // Clamp helper (for drag constraints we pass them inline)
  const clampX = () => {
    const cw = containerRef.current?.clientWidth ?? window.innerWidth;
    return { left: -(CANVAS_W - cw), right: 0 };
  };
  const clampY = () => {
    const ch = containerRef.current?.clientHeight ?? window.innerHeight;
    return { top: -(CANVAS_H - ch), bottom: 0 };
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ cursor: "grab" }}
    >
      {/* ── Fixed dark background ───────────────────────────── */}
      <div className="absolute inset-0 bg-[#0d1117]" />

      {/* ── Draggable canvas ───────────────────────────────── */}
      <motion.div
        ref={canvasRef}
        drag
        dragMomentum={true}
        dragElastic={0.05}
        dragConstraints={(() => {
          const cw = typeof window !== "undefined" ? window.innerWidth : 1200;
          const ch = typeof window !== "undefined" ? window.innerHeight : 800;
          return {
            left: -(CANVAS_W - cw),
            right: 0,
            top: -(CANVAS_H - ch),
            bottom: 0,
          };
        })()}
        style={{ x: panX, y: panY, width: CANVAS_W, height: CANVAS_H, position: "absolute", cursor: "grab" }}
        whileDrag={{ cursor: "grabbing" }}
      >
        {/* ── Dot-grid background (Freeform style) ───────── */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Soft ambient glows */}
        <div className="absolute pointer-events-none" style={{
          left: 400, top: 300, width: 600, height: 600,
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div className="absolute pointer-events-none" style={{
          left: 1800, top: 800, width: 700, height: 700,
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div className="absolute pointer-events-none" style={{
          left: 2400, top: 200, width: 500, height: 500,
          background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

        {/* ── Bubbles ──────────────────────────────────────── */}
        <AnimatePresence>
          {pending.map((task) => {
            const pos = positionMap[task.id] ?? { x: CANVAS_W / 2, y: CANVAS_H / 2 };
            return (
              <Bubble
                key={task.id}
                task={task}
                onPop={handlePop}
                x={pos.x}
                y={pos.y}
              />
            );
          })}
        </AnimatePresence>

        {/* ── Canvas label (hint) ──────────────────────────── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/15 text-xs font-medium select-none pointer-events-none">
          ドラッグでキャンバスを移動
        </div>
      </motion.div>

      {/* ── Fixed HUD header ───────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-5 pb-3"
        style={{ background: "linear-gradient(to bottom, rgba(13,17,23,0.85) 0%, transparent 100%)", backdropFilter: "blur(4px)" }}
      >
        <div>
          <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">Focus Mode</p>
          <h1 className="text-white font-bold text-base mt-0.5">
            バブルをタップして完了
            <span className="ml-2 text-white/35 text-sm font-normal">— ドラッグで移動</span>
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          {completedThisSession > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm border border-white/10"
            >
              <span className="text-sm">✨</span>
              <span className="text-white text-xs font-semibold">{completedThisSession}件完了</span>
            </motion.div>
          )}
          {/* Minimap hint */}
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1.5 border border-white/10">
            <svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
              <path d="M3 7l4-2 6 3 4-2v9l-4 2-6-3-4 2V7Z" strokeLinejoin="round" />
            </svg>
            <span className="text-white/35 text-[10px] font-medium">{pending.length}個のタスク</span>
          </div>
          <Link
            href="/"
            className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20 transition backdrop-blur-sm border border-white/10"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── All done state ──────────────────────────────────── */}
      <AnimatePresence>
        {pending.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-8"
          >
            <motion.div
              animate={reduce ? undefined : { rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-7xl mb-5"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">全部完了！</h2>
            <p className="text-white/50 text-sm mb-7">素晴らしい集中力でした</p>
            <Link
              href="/"
              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3 text-sm font-semibold text-white shadow-xl hover:brightness-110 transition"
            >
              フローに戻る
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confetti ────────────────────────────────────────── */}
      <AnimatePresence>
        {!reduce && confettis.map((key) => (
          <ConfettiBurst key={key} />
        ))}
      </AnimatePresence>
    </div>
  );
}
