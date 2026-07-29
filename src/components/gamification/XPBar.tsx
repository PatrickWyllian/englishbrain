"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

type XPBarVariant = "horizontal" | "mini" | "circular";

interface XPBarProps {
  variant?: XPBarVariant;
  xp: bigint;
  xpNeeded: bigint;
  level: number;
  className?: string;
}

export function XPBar({
  variant = "horizontal",
  xp,
  xpNeeded,
  level,
  className = "",
}: XPBarProps) {
  const gradientId = useId();
  const prefersReducedMotion = useReducedMotion();
  const pct =
    xpNeeded > 0n ? Math.round((Number(xp) / Number(xpNeeded)) * 100) : 0;
  const normalizedPct = Math.min(pct, 100);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

  if (variant === "circular") {
    const circumference = 2 * Math.PI * 28;
    const filled = (normalizedPct / 100) * circumference;

    return (
      <div
        className={`relative inline-flex items-center justify-center ${className}`}
        role="progressbar"
        aria-valuenow={normalizedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Nível ${level}, ${normalizedPct}% para o próximo nível`}
      >
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="var(--color-n-700)"
            strokeWidth="4"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: normalizedPct / 100 }}
            transition={transition}
          />
          <defs>
            <linearGradient
              id={gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-accent-secondary)" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-4xl font-display font-bold text-accent">
          {level}
        </span>
      </div>
    );
  }

  if (variant === "mini") {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        role="progressbar"
        aria-valuenow={normalizedPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${normalizedPct}% para o próximo nível`}
      >
        <div className="flex-1 h-2.5 bg-n-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${normalizedPct}%` }}
            transition={transition}
          />
        </div>
        <span className="text-xs font-mono text-n-400 tabular-nums">
          {Number(xp)}/{Number(xpNeeded)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`space-y-2 ${className}`}
      role="progressbar"
      aria-valuenow={normalizedPct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Nível ${level}, ${normalizedPct}% para o próximo nível`}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl font-bold text-accent">
          Level {level}
        </span>
        <motion.span
          className="text-sm font-mono text-n-400 tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
        >
          {Number(xp).toLocaleString("pt-BR")} /{" "}
          {Number(xpNeeded).toLocaleString("pt-BR")}
        </motion.span>
      </div>
      <div className="relative h-3 bg-n-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${normalizedPct}%` }}
          transition={transition}
        />
      </div>
    </div>
  );
}
