"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText } from "lucide-react";
import type { ReadingStep as ReadingStepType } from "@/lib/lesson/types";

interface ReadingStepProps {
  step: ReadingStepType;
  onComplete: (correct: number, total: number) => void;
}

export function ReadingStep({ step, onComplete }: ReadingStepProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showText, setShowText] = useState(true);

  const question = step.questions[currentQ];

  const handleSelect = (optionIdx: number) => {
    if (selected !== null) return;
    setSelected(optionIdx);

    const isCorrect = optionIdx === question.correctOption;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < step.questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        const totalCorrect = newAnswers.filter(Boolean).length;
        onComplete(totalCorrect, step.questions.length);
      }
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber/10 border border-amber/30 px-4 py-1.5">
          <ScrollText className="h-4 w-4 text-amber" />
          <span className="text-xs font-semibold text-amber uppercase tracking-wider">
            Reading
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {step.title}
        </h2>
        <p className="text-sm text-n-400">
          {showText ? "Leia o texto com atenção" : `Pergunta ${currentQ + 1} de ${step.questions.length}`}
        </p>
      </div>

      {/* Reading Text */}
      <motion.div
        initial={{ opacity: showText ? 1 : 0, height: showText ? "auto" : 0 }}
        animate={{ opacity: showText ? 1 : 0, height: showText ? "auto" : 0 }}
        className="rounded-2xl bg-n-800/60 border border-n-700 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-n-500 uppercase tracking-wider font-semibold">
            Texto
          </p>
          <button
            onClick={() => setShowText(!showText)}
            className="text-xs text-n-500 hover:text-n-300 transition-colors"
          >
            {showText ? "Esconder texto" : "Mostrar texto"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showText && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="prose prose-invert max-w-none text-n-300 leading-relaxed"
            >
              <div className="text-base md:text-lg space-y-3">
                {step.transcript
                  .split("\n\n")
                  .map((para, i) => (
                    <p key={i}>
                      {para}
                    </p>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Questions */}
      {!showText && question && (
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl bg-n-800/60 border border-n-700 p-6 space-y-5"
        >
          <p className="font-display text-lg font-semibold text-foreground">
            {question.prompt}
          </p>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              let bg = "bg-n-700/50 border-n-600";
              let textColor = "text-n-200";
              let icon = null;

              if (selected !== null) {
                if (idx === question.correctOption) {
                  bg = "bg-success/10 border-success/30";
                  textColor = "text-success";
                  icon = (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  );
                } else if (idx === selected && idx !== question.correctOption) {
                  bg = "bg-error/10 border-error/30";
                  textColor = "text-error";
                  icon = (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  );
                } else {
                  bg = "bg-n-700/20 border-n-600/50";
                  textColor = "text-n-500";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selected === null ? "hover:border-amber/50 cursor-pointer" : "cursor-default"
                  } ${bg} ${textColor}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-n-800 font-mono text-xs font-semibold text-n-400">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 font-medium">{opt}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {selected !== null && question.explanation && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm text-n-400 italic"
            >
              {question.explanation}
            </motion.p>
          )}

          {/* Progress dots */}
          <div className="flex gap-1 justify-center pt-2">
            {step.questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i < currentQ
                    ? answers[i]
                      ? "bg-success"
                      : "bg-error"
                    : i === currentQ
                      ? "bg-amber"
                      : "bg-n-700"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}