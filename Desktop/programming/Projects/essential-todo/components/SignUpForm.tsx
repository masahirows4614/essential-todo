"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function SignUpForm({ onClose }: { onClose?: () => void } = {}) {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("パスワードが一致しません"); return; }
    if (password.length < 6) { setError("パスワードは6文字以上にしてください"); return; }
    setLoading(true);
    const res = await signUp(name, email, password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "登録に失敗しました"); return; }
    if (onClose) onClose();
    else router.push("/");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="w-full max-w-sm"
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M12 3C8 3 5 7 5 10s1 4 3 6" strokeLinecap="round" />
            <path d="M12 3c4 0 7 4 7 7s-1 4-3 6" strokeLinecap="round" />
            <path d="M8 16c1.5 2 2.5 3 4 3s2.5-1 4-3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center">
          <span className="block text-xl font-bold text-slate-800">Essential <span className="italic bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Flow</span></span>
          <span className="text-xs text-slate-400">フローをデザインしよう</span>
        </div>
      </div>

      {/* Card */}
      <div className="glass-float rounded-3xl p-6 shadow-xl">
        <h2 className="mb-5 text-base font-bold text-slate-800">アカウントを作成 ✨</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">表示名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ソウタ"
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              required
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">パスワード確認</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:bg-white focus:ring-indigo-300 transition"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-500 ring-1 ring-rose-200"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="mt-1 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "登録中…" : "アカウントを作成"}
          </motion.button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          既にアカウントがある方は{" "}
          <Link href="/signin" className="font-semibold text-indigo-500 hover:underline">
            サインイン
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
