"use client";

import { useState, useCallback } from "react";

interface LootEntry {
  id: string;
  name: string;
  rarity: string;
  acquiredAt: string;
}

const STORAGE_KEY = "englishquest-loot-log";

function getInitialLoot(): LootEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function useRecentLoot(limit = 5) {
  const [loot, setLoot] = useState<LootEntry[]>(getInitialLoot);

  const addLoot = useCallback((entry: Omit<LootEntry, "acquiredAt">) => {
    setLoot((prev) => {
      const next = [{ ...entry, acquiredAt: new Date().toISOString() }, ...prev].slice(0, limit);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [limit]);

  return { loot, addLoot };
}
