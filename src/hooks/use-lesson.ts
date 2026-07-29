"use client";

import { useCallback } from "react";
import { useGameStore } from "@/stores/game-store";
import { calculateLessonXp } from "@/lib/gamification/xp-curve";
import { rollLoot, type LootEntry } from "@/lib/gamification/loot";
import { addLessonCards } from "@/lib/lesson/srs-storage";
import type { Lesson, VocabItem } from "@/lib/lesson/types";

interface CompletionStats {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  loot: LootEntry | null;
  vocabCardsAdded: number;
}

const LOOT_TABLE = [
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

export function useLessonCompletion() {
  const addXp = useGameStore((s) => s.addXp);
  const consumeMana = useGameStore((s) => s.consumeMana);
  const incrementLessonsCompleted = useGameStore(
    (s) => s.incrementLessonsCompleted
  );
  const updateAccuracy = useGameStore((s) => s.updateAccuracy);
  const updateStreak = useGameStore((s) => s.updateStreak);

  const completeLesson = useCallback(
    (
      lesson: Lesson,
      correctCount: number,
      questionCount: number
    ): CompletionStats | null => {
      const player = useGameStore.getState().player;
      if (!player) return null;

      const xp = calculateLessonXp(lesson.xpReward, player.level, player.streak);
      consumeMana(lesson.manaCost);
      incrementLessonsCompleted();
      updateAccuracy(correctCount, questionCount);
      updateStreak();
      const result = addXp(xp);

      let vocabCardsAdded = 0;
      const vocabSteps = lesson.steps.filter((s) => s.type === "vocab");
      for (const step of vocabSteps) {
        if ("items" in step) {
          const items = (step as { items: VocabItem[] }).items;
          addLessonCards(items, lesson.contextTags);
          vocabCardsAdded += items.length;
        }
      }

      const loot = rollLoot(LOOT_TABLE, result.newLevel);

      return {
        xpGained: xp,
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
        loot,
        vocabCardsAdded,
      };
    },
    [addXp, consumeMana, incrementLessonsCompleted, updateAccuracy, updateStreak]
  );

  return { completeLesson };
}
