"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  level: number;
  xp: string; // BigInt -> string for JSON
  totalXp: string;
  streak: number;
  longestStreak: number;
  mana: number;
  maxMana: number;
  class: "WARRIOR" | "MAGE" | "ROGUE" | "CLERIC";
  interests: string[];
}

interface AppState {
  user: User | null;
  theme: "dark" | "light";
  setUser: (user: User | null) => void;
  setTheme: (theme: "dark" | "light") => void;
  updateXp: (xp: string, totalXp: string, level?: number) => void;
  updateStreak: (streak: number) => void;
  updateMana: (mana: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      theme: "dark",
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      updateXp: (xp, totalXp, level) =>
        set((s) => ({
          user: s.user ? { ...s.user, xp, totalXp, ...(level ? { level } : {}) } : null,
        })),
      updateStreak: (streak) =>
        set((s) => ({
          user: s.user
            ? { ...s.user, streak, longestStreak: Math.max(streak, s.user.longestStreak) }
            : null,
        })),
      updateMana: (mana) =>
        set((s) => ({
          user: s.user ? { ...s.user, mana } : null,
        })),
    }),
    { name: "englishquest-state", partialize: (state) => ({ theme: state.theme }) }
  )
);