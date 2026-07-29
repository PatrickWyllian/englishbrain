"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import clsx from "clsx";

interface StreakFlameProps {
  streak: number;
  className?: string;
}

export function StreakFlame({ streak, className = "" }: StreakFlameProps) {
  const prefersReducedMotion = useReducedMotion();

  const flameColor = useMemo(() => {
    if (streak >= 365) return "text-accent-accent";
    if (streak >= 100) return "text-accent";
    if (streak >= 30) return "text-accent-secondary";
    return "text-error";
  }, [streak]);

  const milestone = streak >= 365 || streak >= 100 || streak >= 30 || streak >= 7;

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-n-800 px-3 py-1.5 border border-n-700",
        className,
      )}
      aria-label={`Streak de ${streak} dia${streak === 1 ? "" : "s"}`}
      role="status"
    >
      <div className={prefersReducedMotion || !milestone ? "" : "animate-flame-flicker"}>
        <Flame
          className={clsx("w-5 h-5", flameColor)}
          fill="currentColor"
        />
      </div>
      <span className="text-sm font-mono font-medium text-n-200 tabular-nums">
        {streak}
      </span>
    </div>
  );
}
