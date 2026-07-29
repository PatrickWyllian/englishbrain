"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import type { CEFRLevel } from "@/types";

interface PlacementQuestion {
  id: string;
  level: CEFRLevel;
  type: "vocab" | "grammar";
  instruction: string;
  prompt: string;
  options: string[];
  correctOption: number;
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "p-a1-1",
    level: "A1",
    type: "vocab",
    instruction: "Escolha a palavra correta.",
    prompt: "I ___ a student.",
    options: ["am", "is", "are", "be"],
    correctOption: 0,
  },
  {
    id: "p-a1-2",
    level: "A1",
    type: "vocab",
    instruction: "Complete a frase.",
    prompt: "She ___ two cats.",
    options: ["have", "has", "haves", "having"],
    correctOption: 1,
  },
  {
    id: "p-a2-1",
    level: "A2",
    type: "grammar",
    instruction: "Escolha a alternativa correta.",
    prompt: "I ___ to the cinema last night.",
    options: ["go", "went", "gone", "going"],
    correctOption: 1,
  },
  {
    id: "p-a2-2",
    level: "A2",
    type: "grammar",
    instruction: "Complete com o verbo adequado.",
    prompt: "They ___ football every Saturday.",
    options: ["play", "plays", "playing", "played"],
    correctOption: 0,
  },
  {
    id: "p-b1-1",
    level: "B1",
    type: "grammar",
    instruction: "Escolha a frase mais adequada.",
    prompt: "If I ___ more time, I would learn French.",
    options: ["have", "had", "would have", "will have"],
    correctOption: 1,
  },
  {
    id: "p-b1-2",
    level: "B1",
    type: "vocab",
    instruction: "Qual o significado mais próximo?",
    prompt: "The meeting was called off.",
    options: ["cancelled", "postponed", "moved", "started"],
    correctOption: 0,
  },
  {
    id: "p-b2-1",
    level: "B2",
    type: "grammar",
    instruction: "Escolha a alternativa correta.",
    prompt: "By the time we arrived, the film ___.",
    options: ["already started", "has already started", "had already started", "would already start"],
    correctOption: 2,
  },
  {
    id: "p-b2-2",
    level: "B2",
    type: "vocab",
    instruction: "Complete com a expressão correta.",
    prompt: "We need to ___ our competitors if we want to grow.",
    options: ["get ahead of", "fall behind", "look up to", "catch up with"],
    correctOption: 0,
  },
  {
    id: "p-c1-1",
    level: "C1",
    type: "grammar",
    instruction: "Escolha a alternativa que mantém o sentido.",
    prompt: "It is essential that he ___ on time.",
    options: ["arrives", "arrive", "arrived", "would arrive"],
    correctOption: 1,
  },
  {
    id: "p-c1-2",
    level: "C1",
    type: "vocab",
    instruction: "Qual palavra substitui melhor 'very good'?",
    prompt: "The proposal was ___ and well-articulated.",
    options: ["mediocre", "compelling", "vague", "redundant"],
    correctOption: 1,
  },
];

const LEVEL_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function calculateLevel(answers: { question: PlacementQuestion; correct: boolean }[]): CEFRLevel {
  const grouped = new Map<CEFRLevel, { correct: number; total: number }>();

  for (const a of answers) {
    const current = grouped.get(a.question.level) ?? { correct: 0, total: 0 };
    current.total++;
    if (a.correct) current.correct++;
    grouped.set(a.question.level, current);
  }

  // Start at A1, promote when >= 60% correct on current level
  let finalLevel: CEFRLevel = "A1";
  for (const level of LEVEL_ORDER) {
    const stats = grouped.get(level);
    if (!stats || stats.total === 0) break;
    const pct = stats.correct / stats.total;
    if (pct >= 0.6) {
      finalLevel = level;
      const nextIndex = LEVEL_ORDER.indexOf(level) + 1;
      if (nextIndex < LEVEL_ORDER.length) {
        finalLevel = LEVEL_ORDER[nextIndex];
      }
    } else {
      break;
    }
  }

  return finalLevel;
}

export function PlacementTest({
  onComplete,
  onCancel,
}: {
  onComplete: (answers: { question: PlacementQuestion; correct: boolean }[], level: CEFRLevel) => void;
  onCancel: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: PlacementQuestion; correct: boolean }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const question = PLACEMENT_QUESTIONS[index];

  const handleSelect = useCallback((optionIndex: number) => {
    if (hasAnswered) return;
    setSelected(optionIndex);

    const isCorrect = optionIndex === question.correctOption;
    setAnswers((prev) => [...prev, { question, correct: isCorrect }]);
    setHasAnswered(true);

    setTimeout(() => {
      if (index + 1 < PLACEMENT_QUESTIONS.length) {
        setIndex((i) => i + 1);
        setSelected(null);
        setHasAnswered(false);
      } else {
        const finalAnswers = [...answers, { question, correct: isCorrect }];
        onComplete(finalAnswers, calculateLevel(finalAnswers));
      }
    }, 900);
  }, [hasAnswered, question, index, answers, onComplete]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Placement Test
          </h2>
          <div className="flex items-center gap-2 text-sm text-n-400">
            <Clock className="w-4 h-4" />
            <span>
              {index + 1} / {PLACEMENT_QUESTIONS.length}
            </span>
          </div>
        </div>
        <p className="text-n-400 max-w-lg">
          Responda as perguntas para descobrirmos seu nível atual. Não se
          preocupe em errar — isso nos ajuda a personalizar seu caminho.
        </p>
      </div>

      {/* Progress */}
      <div className="h-2 bg-n-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((index + 1) / PLACEMENT_QUESTIONS.length) * 100}%` }}
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
          className="space-y-6"
        >
          <div className="rounded-2xl bg-n-900 border border-n-700 p-6 md:p-8">
            <div className="text-xs font-display font-semibold text-accent uppercase tracking-widest mb-4">
              {question.level} &middot; {question.type === "vocab" ? "Vocabulário" : "Gramática"}
            </div>
            <p className="text-sm text-n-400 mb-2">{question.instruction}</p>
            <p className="font-display text-2xl font-semibold text-foreground mb-8">
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
                  <button
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
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={onCancel}
        className="text-sm text-n-500 hover:text-n-300 underline underline-offset-4"
      >
        Pular teste (definir A1)
      </button>
    </div>
  );
}

export { calculateLevel };
export type { PlacementQuestion };
