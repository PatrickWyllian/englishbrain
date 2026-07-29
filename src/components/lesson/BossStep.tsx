"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { McqQuestion } from "@/lib/lesson/types";

export function BossStep({
  questions,
  timeLimit,
  onComplete,
}: {
  questions: McqQuestion[];
  timeLimit: number; // seconds
  onComplete: (correct: number, total: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [finished, setFinished] = useState(false);
  const correctCountRef = useRef(0);

  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  const finish = (correct: number) => {
    setFinished(true);
    onComplete(correct, questions.length);
  };

  useEffect(() => {
    if (finished || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, finished]);

  useEffect(() => {
    if (!finished || timeLeft > 0) return;
    onComplete(correctCountRef.current, questions.length);
  }, [finished, timeLeft, onComplete, questions.length]);

  const handleSelect = (optionIndex: number) => {
    if (hasAnswered || finished) return;
    setSelected(optionIndex);
    setHasAnswered(true);

    const isCorrect = optionIndex === questions[index].correctOption;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(nextCorrect);

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setSelected(null);
        setHasAnswered(false);
      } else {
        finish(nextCorrect);
      }
    }, 900);
  };

  const question = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  if (finished) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-5xl">⚔️</div>
        <h3 className="font-display text-2xl font-bold text-foreground">
          Boss derrotado!
        </h3>
        <p className="text-n-400">
          Você acertou {correctCount} de {questions.length} perguntas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-display font-semibold text-accent uppercase tracking-wider">
          Boss Fight
        </span>
        <span
          className={`text-sm font-mono font-medium ${
            timeLeft <= 10 ? "text-error" : "text-n-300"
          }`}
        >
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="h-2 bg-n-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
