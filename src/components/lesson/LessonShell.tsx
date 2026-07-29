"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { useRecentLoot } from "@/hooks/use-recent-loot";
import { useGameSync } from "@/hooks/use-game-sync";
import { calculateLessonXp } from "@/lib/gamification/xp-curve";
import { rollLoot, type LootEntry } from "@/lib/gamification/loot";
import { addLessonCards } from "@/lib/lesson/srs-storage";
import { addItemToInventory } from "@/app/actions/inventory";
import { refreshQuestProgress } from "@/app/actions/quests";
import type { Lesson } from "@/lib/lesson/types";
import { Mascot } from "@/components/gamification/Mascot";
import { VocabStep } from "./VocabStep";
import { GrammarStep } from "./GrammarStep";
import { ListeningStep } from "./ListeningStep";
import { SpeakingStep } from "./SpeakingStep";
import { ReadingStep } from "./ReadingStep";
import { WritingStep } from "./WritingStep";
import { BossStep } from "./BossStep";
import { LessonResult } from "./LessonResult";

const INITIAL_LOOT_TABLE = [
  {
    weight: 50,
    minLevel: 1,
    maxLevel: 10,
    item: { id: "frame-starter", name: "Frame Iniciante", rarity: "COMMON" },
  },
  {
    weight: 25,
    minLevel: 1,
    maxLevel: 5,
    item: { id: "title-rookie", name: "Título Rookie", rarity: "UNCOMMON" },
  },
  {
    weight: 10,
    minLevel: 1,
    maxLevel: 10,
    item: { id: "mana-potion", name: "Poção de Mana", rarity: "RARE" },
  },
];

interface LessonShellProps {
  lesson: Lesson;
}

export function LessonShell({ lesson }: LessonShellProps) {
  const router = useRouter();
  const player = useGameStore((s) => s.player);
  const addXp = useGameStore((s) => s.addXp);
  const consumeMana = useGameStore((s) => s.consumeMana);
  const incrementLessonsCompleted = useGameStore(
    (s) => s.incrementLessonsCompleted
  );
  const updateAccuracy = useGameStore((s) => s.updateAccuracy);
  const updateStreak = useGameStore((s) => s.updateStreak);

  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [loot, setLoot] = useState<LootEntry | null>(null);
  const [mascotPose, setMascotPose] = useState<"idle" | "celebrate" | "think" | "speak">("idle");
  const { addLoot } = useRecentLoot();
  const { syncToDb } = useGameSync();

  const step = lesson.steps[stepIndex];

  const finishLesson = useCallback(
    (finalCorrect: number, finalTotal: number) => {
      if (!player) return;

      const xp = calculateLessonXp(
        lesson.xpReward,
        player.level,
        player.streak
      );
      consumeMana(lesson.manaCost);
      incrementLessonsCompleted();
      updateAccuracy(finalCorrect, finalTotal);
      updateStreak();
      const result = addXp(xp);

      setXpGained(xp);
      setLeveledUp(result.leveledUp);
      setNewLevel(result.newLevel);
      setLoot(rollLoot(INITIAL_LOOT_TABLE, result.newLevel));
      setFinished(true);

      const vocabSteps = lesson.steps.filter((s) => s.type === "vocab");
      for (const step of vocabSteps) {
        if ("items" in step) {
          addLessonCards(step.items, lesson.contextTags);
        }
      }

      const updatedPlayer = useGameStore.getState().player;
      if (updatedPlayer) {
        syncToDb({
          level: updatedPlayer.level,
          xp: updatedPlayer.xp,
          totalXp: updatedPlayer.totalXp,
          streak: updatedPlayer.streak,
          longestStreak: updatedPlayer.longestStreak,
          mana: updatedPlayer.mana,
          maxMana: updatedPlayer.maxMana,
        });
      }

      const lootResult = rollLoot(INITIAL_LOOT_TABLE, result.newLevel);
      if (lootResult) {
        addItemToInventory(lootResult.id).catch(() => {});
      }

      refreshQuestProgress().catch(() => {});
    },
    [player, lesson, addXp, consumeMana, incrementLessonsCompleted, updateAccuracy, updateStreak, syncToDb]
  );

  const handleStepComplete = useCallback(
    (correct: number, total: number) => {
      setCorrectCount((c) => c + correct);
      setQuestionCount((q) => q + total);

      if (correct === total) {
        setMascotPose("celebrate");
      } else if (correct < total) {
        setMascotPose("think");
      }

      setTimeout(() => {
        setMascotPose("idle");
        if (stepIndex + 1 < lesson.steps.length) {
          setStepIndex((i) => i + 1);
        } else {
          finishLesson(correctCount + correct, questionCount + total);
        }
      }, 1200);
    },
    [stepIndex, lesson.steps.length, finishLesson, correctCount, questionCount]
  );

  useEffect(() => {
    if (loot) {
      addLoot(loot);
    }
  }, [loot, addLoot]);

  const handleRestart = () => {
    setStepIndex(0);
    setFinished(false);
    setCorrectCount(0);
    setQuestionCount(0);
    setXpGained(0);
    setLeveledUp(false);
    setNewLevel(1);
    setLoot(null);
  };

  if (!player) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-n-400">Você precisa completar o onboarding primeiro.</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent text-n-950 px-6 py-3 font-display font-semibold"
          >
            Começar Onboarding
          </button>
        </div>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="min-h-screen bg-bg px-6 py-12">
        <LessonResult
          lesson={lesson}
          totalCorrect={correctCount}
          totalQuestions={questionCount}
          xpGained={xpGained}
          leveledUp={leveledUp}
          newLevel={newLevel}
          loot={loot}
          onRetry={handleRestart}
        />
      </main>
    );
  }

  const progress = ((stepIndex + 1) / lesson.steps.length) * 100;

  return (
    <main className="min-h-screen bg-bg px-6 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/learn")}
            className="text-sm text-n-400 hover:text-foreground"
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-accent">
              <Zap className="w-4 h-4" />
              <span className="font-mono">{player.mana}</span>
            </div>
            <div className="flex items-center gap-1.5 text-n-400">
              <Trophy className="w-4 h-4" />
              <span className="font-mono">Lvl {player.level}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-display font-semibold text-n-400 uppercase tracking-wider">
              {step.title}
            </span>
            <span className="text-xs font-mono text-n-500">
              {stepIndex + 1}/{lesson.steps.length}
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
        </div>

        {/* Mascot */}
        <div className="flex justify-center" aria-hidden="true">
          <Mascot pose={mascotPose} size={64} />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step.type === "vocab" && (
              <VocabStep
                items={step.items}
                onComplete={handleStepComplete}
              />
            )}
            {step.type === "grammar" && (
              <GrammarStep
                rule={step.rule}
                explanation={step.explanation}
                question={step.question}
                onComplete={handleStepComplete}
              />
            )}
            {step.type === "listening" && (
              <ListeningStep
                step={step}
                onComplete={handleStepComplete}
              />
            )}
            {step.type === "speaking" && (
              <SpeakingStep
                step={step}
                onComplete={handleStepComplete}
              />
            )}
            {step.type === "reading" && (
              <ReadingStep
                step={step}
                onComplete={handleStepComplete}
              />
            )}
            {step.type === "writing" && (
              <WritingStep
                step={step}
                onComplete={handleStepComplete}
              />
            )}
            {step.type === "boss" && (
              <BossStep
                questions={step.questions}
                timeLimit={step.timeLimit}
                onComplete={handleStepComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
