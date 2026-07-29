"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerProfile, PlayerClass, CEFRLevel } from "@/types";
import { levelFromXp, xpIntoLevel } from "@/lib/gamification/xp-curve";

interface GameState {
  player: PlayerProfile | null;
  xpToday: number;
  lessonsCompleted: number;
  accuracy: number;
  lastActiveDate: string | null;

  setPlayer: (player: PlayerProfile | null) => void;
  createPlayer: (props: {
    name: string;
    playerClass: PlayerClass;
    interests: string[];
    estimatedLevel: CEFRLevel;
  }) => void;
  addXp: (amount: number) => { leveledUp: boolean; newLevel: number };
  incrementLessonsCompleted: () => void;
  updateAccuracy: (correct: number, total: number) => void;
  updateStreak: () => void;
  consumeMana: (amount: number) => void;
  resetDailyStats: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: null,
      xpToday: 0,
      lessonsCompleted: 0,
      accuracy: 0,
      lastActiveDate: null,

      setPlayer: (player) => set({ player }),

      createPlayer: ({ name, playerClass, interests, estimatedLevel }) => {
        const today = new Date().toISOString().split("T")[0];
        const player: PlayerProfile = {
          id: crypto.randomUUID(),
          name,
          level: 1,
          xp: "0",
          totalXp: "0",
          streak: 1,
          longestStreak: 1,
          mana: 100,
          maxMana: 100,
          class: playerClass,
          interests,
          estimatedLevel,
        };
        set({ player, xpToday: 0, lessonsCompleted: 0, accuracy: 0, lastActiveDate: today });
      },

      addXp: (amount) => {
        const { player, xpToday } = get();
        if (!player) return { leveledUp: false, newLevel: 1 };

        const previousLevel = player.level;
        const previousTotal = BigInt(player.totalXp);
        const newTotal = previousTotal + BigInt(amount);
        const newLevel = levelFromXp(newTotal);
        const { xp } = xpIntoLevel(newTotal);

        set({
          player: {
            ...player,
            level: newLevel,
            xp: xp.toString(),
            totalXp: newTotal.toString(),
          },
          xpToday: xpToday + amount,
        });

        return { leveledUp: newLevel > previousLevel, newLevel };
      },

      incrementLessonsCompleted: () =>
        set((s) => ({ lessonsCompleted: s.lessonsCompleted + 1 })),

      updateAccuracy: (correct, total) => {
        if (total === 0) return;
        const current = get().accuracy;
        const currentWeight = get().lessonsCompleted || 1;
        const newAccuracy =
          Math.round(
            ((current * currentWeight + (correct / total) * 100) / (currentWeight + 1)) * 100
          ) / 100;
        set({ accuracy: newAccuracy });
      },

      updateStreak: () => {
        const { player, lastActiveDate } = get();
        if (!player) return;

        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];

        let newStreak = player.streak;
        if (lastActiveDate === today) {
          // já deu reset hoje
        } else if (lastActiveDate === yesterday) {
          newStreak = player.streak + 1;
        } else {
          newStreak = 1;
        }

        set({
          player: {
            ...player,
            streak: newStreak,
            longestStreak: Math.max(newStreak, player.longestStreak),
          },
          lastActiveDate: today,
        });
      },

      consumeMana: (amount) =>
        set((s) => ({
          player: s.player
            ? { ...s.player, mana: Math.max(0, s.player.mana - amount) }
            : null,
        })),

      resetDailyStats: () => set({ xpToday: 0, lessonsCompleted: 0, accuracy: 0 }),
    }),
    {
      name: "englishquest-game",
      partialize: (state) => ({
        player: state.player,
        xpToday: state.xpToday,
        lessonsCompleted: state.lessonsCompleted,
        accuracy: state.accuracy,
        lastActiveDate: state.lastActiveDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const today = new Date().toISOString().split("T")[0];
        if (state.lastActiveDate !== today) {
          state.resetDailyStats();
          state.lastActiveDate = today;
        }
      },
    }
  )
);
