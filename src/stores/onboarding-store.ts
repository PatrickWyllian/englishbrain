"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingState, PlayerClass, CEFRLevel } from "@/types";

const initialOnboarding: OnboardingState = {
  step: 0,
  interests: [],
  placementAnswers: [],
  estimatedLevel: "A1",
  playerClass: null,
  completed: false,
};

interface OnboardingStore extends OnboardingState {
  setInterests: (interests: string[]) => void;
  addPlacementAnswer: (answer: OnboardingState["placementAnswers"][number]) => void;
  clearPlacementAnswers: () => void;
  setEstimatedLevel: (level: CEFRLevel) => void;
  setClass: (playerClass: PlayerClass) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...initialOnboarding,
      setInterests: (interests) => set({ interests }),
      addPlacementAnswer: (answer) =>
        set((s) => ({
          placementAnswers: [...s.placementAnswers, answer],
        })),
      clearPlacementAnswers: () => set({ placementAnswers: [] }),
      setEstimatedLevel: (level) => set({ estimatedLevel: level }),
      setClass: (playerClass) => set({ playerClass }),
      nextStep: () => set((s) => ({ step: s.step + 1 })),
      prevStep: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      goToStep: (step) => set({ step }),
      complete: () => set({ completed: true }),
      reset: () => set(initialOnboarding),
    }),
    { name: "englishquest-onboarding" }
  )
);
