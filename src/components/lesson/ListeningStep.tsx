"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Check, X, Play } from "lucide-react";
import type { ListeningStep as ListeningStepType } from "@/lib/lesson/types";

interface ListeningStepProps {
  step: ListeningStepType;
  onComplete: (correct: number, total: number) => void;
}

export function ListeningStep({ step, onComplete }: ListeningStepProps) {
  const [phase, setPhase] = useState<"preview" | "listening" | "answering">(
    "preview",
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);

  const question = step.questions[currentQ];

  const startListening = () => {
    setPhase("listening");
    // Auto-advance to answering after a delay (simulating audio playback)
    setTimeout(() => setPhase("answering"), 3000);
  };

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
        setPhase("preview");
      } else {
        const totalCorrect = newAnswers.filter(Boolean).length;
        onComplete(totalCorrect, step.questions.length);
      }
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 px-4 py-1.5">
          <Volume2 className="h-4 w-4 text-accent-secondary" />
          <span className="text-xs font-semibold text-accent-secondary uppercase tracking-wider">
            Listening
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {step.title}
        </h2>
        <p className="text-sm text-n-400">
          {phase === "preview" && "Ouça o áudio e responda às perguntas"}
          {phase === "listening" && "Ouvindo..."}
          {phase === "answering" &&
            `Pergunta ${currentQ + 1} de ${step.questions.length}`}
        </p>
      </div>

      {/* Audio player simulation */}
      {phase === "preview" && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl bg-n-800/60 border border-n-700 p-8"
        >
          {/* Animated sound waves */}
          <div className="flex items-center gap-1 h-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{
                  duration: 0.8 + i * 0.15,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                className="w-1.5 rounded-full bg-accent-secondary"
                style={{ height: `${12 + i * 6}px` }}
              />
            ))}
          </div>

          <button
            onClick={startListening}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-secondary px-8 py-4 font-semibold text-n-950 hover:bg-accent-secondary/80 transition-colors"
          >
            <Play className="h-5 w-5" fill="currentColor" />
            Ouvir Áudio
          </button>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs text-n-500 hover:text-n-300 transition-colors"
          >
            {showTranscript ? "Esconder transcrição" : "Ver transcrição"}
          </button>

          {showTranscript && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="text-sm text-n-300 italic max-w-md text-center leading-relaxed"
            >
              &ldquo;{step.transcript}&rdquo;
            </motion.p>
          )}
        </motion.div>
      )}

      {phase === "listening" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-n-800/60 border border-accent-secondary/30 p-8">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-secondary/20"
          >
            <Volume2 className="h-8 w-8 text-accent-secondary" />
          </motion.div>
          <p className="text-accent-secondary font-medium animate-pulse">
            Reproduzindo áudio...
          </p>
          <motion.div
            className="h-1 rounded-full bg-accent-secondary/30 w-64"
            initial={{ width: 0 }}
          >
            <motion.div
              className="h-full rounded-full bg-accent-secondary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </motion.div>
        </div>
      )}

      {/* Questions */}
      {phase === "answering" && question && (
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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
                  icon = <Check className="h-4 w-4" />;
                } else if (idx === selected && idx !== question.correctOption) {
                  bg = "bg-error/10 border-error/30";
                  textColor = "text-error";
                  icon = <X className="h-4 w-4" />;
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
                  className={`w-full flex items-center gap-3 rounded-xl border ${bg} p-4 text-left transition-colors ${
                    selected === null ? "hover:border-accent-secondary/50 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-n-800 font-mono text-xs font-semibold text-n-400">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`flex-1 font-medium ${textColor}`}>
                    {opt}
                  </span>
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

          {/* Progress */}
          <div className="flex gap-1 justify-center">
            {step.questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i < currentQ
                    ? answers[i]
                      ? "bg-success"
                      : "bg-error"
                    : i === currentQ
                      ? "bg-accent-secondary"
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