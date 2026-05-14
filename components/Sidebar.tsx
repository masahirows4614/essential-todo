"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import AxisIndicator from "./AxisIndicator";
import { useAuth } from "./AuthProvider";
import { useTasks } from "@/contexts/TaskContext";

const NAV_ITEMS = [
  {
    href: "/",
    label: "今日のフロー",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/weekly",
    label: "ウィークリー",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <rect x="2" y="4" width="16" height="13" rx="2" />
        <path d="M2 8h16M7 2v4M13 2v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "プロジェクト",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <path d="M3 7a2 2 0 0 1 2-2h2l2 2h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      </svg>
    ),
  },
  {
    href: "/focus",
    label: "フォーカス",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <circle cx="10" cy="10" r="7" />
        <circle cx="10" cy="10" r="3" />
        <circle cx="10" cy="10" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/axis",
    label: "自分軸",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10h1M13 10h1M10 6v1M10 13v1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "設定",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
        <circle cx="10" cy="10" r="2.5" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { tasks, settings } = useTasks();

  const axisProgress = useMemo(() => {
    const must = tasks.filter((t) => t.type === "must");
    if (!must.length) return 0;
    return Math.round((must.filter((t) => t.completed).length / must.length) * 100);
  }, [tasks]);

  return (
    <aside className="glass-sidebar flex h-full w-60 shrink-0 flex-col rounded-r-3xl">
      {/* Logo */}
      <div className="px-6 pt-7 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 3C8 3 5 7 5 10s1 4 3 6" strokeLinecap="round" />
              <path d="M12 3c4 0 7 4 7 7s-1 4-3 6" strokeLinecap="round" />
              <path d="M8 16c1.5 2 2.5 3 4 3s2.5-1 4-3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="block text-sm font-bold text-slate-800 leading-tight">Essential</span>
            <span className="block text-xs font-semibold italic bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent leading-tight">Flow</span>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400 leading-snug">
          &ldquo;本当に大切なこと&rdquo;に、集中するためのToDo
        </p>

        {/* User */}
        <div className="mt-3 flex items-center justify-between">
          {user ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: user.avatarColor ?? "#4361EE" }}
                >
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="shrink-0 rounded-lg py-1 px-2 text-[10px] text-rose-500 hover:bg-rose-50 transition"
              >
                ログアウト
              </button>
            </>
          ) : (
            <div className="flex gap-2 w-full">
              <Link href="/signin" className="flex-1 rounded-lg py-1 text-center text-xs ring-1 ring-slate-200 hover:bg-slate-50 transition">
                サインイン
              </Link>
              <Link href="/signup" className="flex-1 rounded-lg bg-indigo-600 py-1 text-center text-xs text-white hover:brightness-105 transition">
                登録
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Axis Indicator */}
      <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-b from-indigo-50/80 to-violet-50/80 p-4 ring-1 ring-indigo-100">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          自分の軸
        </p>
        <AxisIndicator progress={axisProgress} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 ring-1 ring-indigo-200/60"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className={isActive ? "text-indigo-500" : "text-slate-400"}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Mood */}
      <div className="mx-4 mb-5 mt-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-3 ring-1 ring-indigo-100/60">
        <p className="mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">今週のムード</p>
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-200 to-violet-200 text-xl shadow-sm"
          >
            {settings.moodEmoji}
          </motion.div>
          <div>
            <p className="text-xs font-semibold text-indigo-600">{settings.moodText.split("　")[0]}</p>
            <p className="text-[10px] text-slate-400 leading-snug">{settings.moodText.split("　")[1] ?? ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
