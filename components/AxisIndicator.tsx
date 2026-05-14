"use client";

import { motion } from "framer-motion";

interface Props {
  progress?: number;
  compact?: boolean;
}

export default function AxisIndicator({ progress = 78, compact = false }: Props) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  const size = compact ? "w-20 h-20" : "w-28 h-28";
  const textSize = compact ? "text-xl" : "text-3xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${size}`}>
        {/* Background blob */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 blur-sm" />

        {/* Wave fill */}
        <div className="absolute inset-2 rounded-full overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 overflow-hidden"
            style={{ height: `${progress}%` }}
          >
            <div
              className="absolute bottom-0 left-0 h-full animate-wave-fill"
              style={{
                width: "200%",
                background:
                  "linear-gradient(180deg, rgba(99,102,241,0.25) 0%, rgba(124,92,229,0.40) 100%)",
              }}
            />
          </div>
        </div>

        {/* SVG ring */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
          <defs>
            <linearGradient id="axisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4361EE" />
              <stop offset="100%" stopColor="#7C5CE5" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="rgba(67,97,238,0.12)"
            strokeWidth="7"
          />
          {/* Progress arc */}
          <motion.circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="url(#axisGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            transform="rotate(-90 50 50)"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span className={`${textSize} font-bold bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent`}>
            {progress}%
          </span>
        </div>
      </div>

      {!compact && (
        <>
          <span className="text-xs font-semibold text-indigo-500 tracking-wide">
            集中・成長モード
          </span>
          <span className="text-[11px] text-slate-400 text-center leading-tight">
            迷ったら、コアに戻ろ。
          </span>
        </>
      )}
    </div>
  );
}
