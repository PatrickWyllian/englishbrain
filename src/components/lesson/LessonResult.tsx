"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import type { Lesson } from "@/lib/lesson/types";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { LootDropToast } from "@/components/gamification/LootDropToast";
import type { LootEntry } from "@/lib/gamification/loot";

export function LessonResult({
  lesson,
  totalCorrect,
  totalQuestions,
  xpGained,
  leveledUp,
  newLevel,
  loot,
  onRetry,
}: {
  lesson: Lesson;
  totalCorrect: number;
  totalQuestions: number;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  loot: LootEntry | null;
  onRetry: () => void;
}) {
  const router = useRouter();
  const accuracy =
    totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLootToast, setShowLootToast] = useState(false);

  useEffect(() => {
    if (leveledUp) {
      const timer = setTimeout(() => setShowLevelUp(true), 500);
      return () => clearTimeout(timer);
    }
  }, [leveledUp]);

  useEffect(() => {
    if (loot) {
      const timer = setTimeout(() => setShowLootToast(true), leveledUp ? 1500 : 800);
      return () => clearTimeout(timer);
    }
  }, [loot, leveledUp]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto space-y-8 text-center"
    >
      {leveledUp && (
        <div className="rounded-2xl bg-gradient-to-r from-accent/20 to-accent-accent/20 border border-accent p-6 space-y-2">
          <div className="text-5xl">🎉</div>
          <h2 className="font-display text-3xl font-bold text-accent">
            Level Up!
          </h2>
          <p className="text-n-200">
            Você alcançou o <span className="font-bold">Level {newLevel}</span>.
            Novas skills desbloqueadas em breve.
          </p>
        </div>
      )}

      <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-n-800 border border-n-700">
        {leveledUp ? (
          <Trophy className="w-12 h-12 text-accent" />
        ) : (
          <Sparkles className="w-12 h-12 text-accent-secondary" />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold text-foreground">
          Lição completa!
        </h2>
        <p className="text-n-400">{lesson.title}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-n-900 border border-n-700 p-4">
          <div className="text-xs text-n-500 uppercase tracking-wider font-semibold">
            XP
          </div>
          <div className="font-display text-2xl font-bold text-accent mt-1">
            +{xpGained}
          </div>
        </div>
        <div className="rounded-xl bg-n-900 border border-n-700 p-4">
          <div className="text-xs text-n-500 uppercase tracking-wider font-semibold">
            Precisão
          </div>
          <div className="font-display text-2xl font-bold text-accent-secondary mt-1">
            {accuracy}%
          </div>
        </div>
        <div className="rounded-xl bg-n-900 border border-n-700 p-4">
          <div className="text-xs text-n-500 uppercase tracking-wider font-semibold">
            Mana
          </div>
          <div className="font-display text-2xl font-bold text-info mt-1">
            -{lesson.manaCost}
          </div>
        </div>
      </div>

      {loot && (
        <div className="rounded-2xl bg-n-900 border border-n-700 p-6 space-y-3">
          <div className="text-xs text-n-500 uppercase tracking-wider font-semibold">
            Loot drop
          </div>
          <div className="inline-flex items-center gap-3 rounded-xl bg-n-800 border border-n-700 px-5 py-3">
            <span className="text-2xl">🎁</span>
            <div className="text-left">
              <div className="font-display font-bold text-foreground">
                {loot.name}
              </div>
              <div className="text-xs text-n-400 capitalize">{loot.rarity}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-n-950 px-8 py-4 font-display font-semibold text-lg hover:bg-accent-600 transition-colors"
        >
          Ir para Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-n-800 text-n-200 px-8 py-4 font-display font-semibold text-lg border border-n-700 hover:border-n-500 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Refazer lição
        </button>
      </div>

      <LevelUpModal
        open={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={newLevel}
        oldLevel={newLevel - 1}
        title={
          newLevel >= 10
            ? "Veteran Explorer"
            : newLevel >= 5
              ? "Seasoned Learner"
              : undefined
        }
        bonusEffect={
          newLevel >= 5
            ? "+5% XP boost para próximas lições"
            : undefined
        }
      />

      {loot && (
        <LootDropToast
          loot={loot}
          visible={showLootToast}
          onClose={() => setShowLootToast(false)}
        />
      )}
    </motion.div>
  );
}
