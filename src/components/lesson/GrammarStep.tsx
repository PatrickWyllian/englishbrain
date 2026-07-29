"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/gamification/Mascot";
import type { McqQuestion } from "@/lib/lesson/types";

export function GrammarStep({
  rule,
  explanation,
  question,
  onComplete,
}: {
  rule: string;
  explanation: string;
  question: McqQuestion;
  onComplete: (correct: number, total: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelected(index);
    setHasAnswered(true);
    const correct = index === question.correctOption ? 1 : 0;
    onComplete(correct, 1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-n-900 border border-n-700 p-6 space-y-3">
        <h3 className="font-display text-lg font-bold text-accent">{rule}</h3>
        <p className="text-n-300">{explanation}</p>
      </div>

      <div className="rounded-2xl bg-n-900 border border-n-700 p-6">
        <p className="font-display text-xl font-semibold text-foreground mb-6">
          {question.prompt}
        </p>
        <div className="grid gap-3">
          {question.options.map((option, i) => {
            const state =
              selected === null
                ? "neutral"
                : i === question.correctOption
                  ? "correct"
                  : selected === i
                    ? "wrong"
                    : "dimmed";

            return (
              <motion.button
                key={i}
                disabled={hasAnswered}
                onClick={() => handleSelect(i)}
                className={`
                  w-full text-left rounded-xl border px-5 py-4 font-medium transition-all
                  ${
                    state === "neutral"
                      ? "bg-n-800 border-n-700 text-n-200 hover:border-accent"
                      : state === "correct"
                        ? "bg-success/10 border-success text-success"
                        : state === "wrong"
                          ? "bg-error/10 border-error text-error"
                          : "bg-n-950/50 border-n-800 text-n-600"
                  }
                `}
              >
                {option}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {hasAnswered && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-xl bg-n-800/50 border border-n-700 p-4 text-sm text-n-300 flex items-start gap-3"
          >
            <Mascot pose="think" size={40} className="flex-shrink-0 mt-0.5" />
            <p>{question.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
