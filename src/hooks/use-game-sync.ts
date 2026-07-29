"use client";

import { useRef, useCallback } from "react";
import { syncGameStateToDb, loadGameStateFromDb } from "@/app/actions/user";
import { useGameStore } from "@/stores/game-store";

interface SyncInput {
  level?: number;
  xp?: string;
  totalXp?: string;
  streak?: number;
  longestStreak?: number;
  mana?: number;
  maxMana?: number;
  class?: string;
  interests?: string[];
}

interface DbGameState {
  level: number;
  xp: string;
  totalXp: string;
  streak: number;
  longestStreak: number;
  mana: number;
  maxMana: number;
  class: string;
  interests: string[];
  lastActiveAt: Date | null;
}

export function useGameSync() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setPlayer = useGameStore((s) => s.setPlayer);

  const syncToDb = useCallback((state: SyncInput) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        await syncGameStateToDb(state);
      } catch (err) {
        console.error("Falha ao sincronizar com o banco de dados:", err);
      }
    }, 500);
  }, []);

  const loadFromDb = useCallback(async (): Promise<DbGameState | null> => {
    try {
      const data = await loadGameStateFromDb();
      return data;
    } catch (err) {
      console.error("Falha ao carregar do banco de dados:", err);
      return null;
    }
  }, []);

  const syncAndMerge = useCallback(async () => {
    const dbData = await loadFromDb();
    if (!dbData) return;

    const current = useGameStore.getState().player;
    if (!current) {
      setPlayer({
        id: crypto.randomUUID(),
        name: "Aventureiro",
        level: dbData.level,
        xp: dbData.xp,
        totalXp: dbData.totalXp,
        streak: dbData.streak,
        longestStreak: dbData.longestStreak,
        mana: dbData.mana,
        maxMana: dbData.maxMana,
        class: dbData.class as "WARRIOR" | "MAGE" | "ROGUE" | "CLERIC",
        interests: dbData.interests,
        estimatedLevel: "A1",
      });
      return;
    }

    const dbTotalXp = BigInt(dbData.totalXp);
    const localTotalXp = BigInt(current.totalXp);

    if (dbTotalXp > localTotalXp) {
      setPlayer({
        ...current,
        level: dbData.level,
        xp: dbData.xp,
        totalXp: dbData.totalXp,
        streak: dbData.streak,
        longestStreak: dbData.longestStreak,
        mana: dbData.mana,
        maxMana: dbData.maxMana,
        class: dbData.class as "WARRIOR" | "MAGE" | "ROGUE" | "CLERIC",
        interests: dbData.interests,
      });
    }
  }, [loadFromDb, setPlayer]);

  return { syncToDb, loadFromDb, syncAndMerge };
}
