"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { LlmProviderId } from "@/lib/teacher/providers";
import {
  getLlmSettings,
  saveLlmSettings,
  testLlmConnection,
  getActiveTeacherQuest,
  generateTeacherQuest,
  evaluateAnswer,
  submitTeacherQuest,
} from "@/app/actions/teacher";

const TEACHER_KEY = ["teacher"] as const;
export const LLM_SETTINGS_KEY = ["teacher", "llm-settings"] as const;
export const ACTIVE_QUEST_KEY = ["teacher", "active-quest"] as const;

export function useLlmSettings() {
  return useQuery({
    queryKey: LLM_SETTINGS_KEY,
    queryFn: () => getLlmSettings(),
    staleTime: 60_000,
  });
}

export function useSaveLlmSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      provider: LlmProviderId;
      model?: string;
      apiKey?: string;
      baseUrl?: string;
    }) => saveLlmSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LLM_SETTINGS_KEY });
    },
  });
}

export function useTestLlmConnection() {
  return useMutation({
    mutationFn: () => testLlmConnection(),
  });
}

export function useActiveTeacherQuest() {
  return useQuery({
    queryKey: ACTIVE_QUEST_KEY,
    queryFn: () => getActiveTeacherQuest(),
    staleTime: 30_000,
  });
}

export function useGenerateTeacherQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateTeacherQuest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_QUEST_KEY });
    },
  });
}

export function useEvaluateAnswer() {
  return useMutation({
    mutationFn: (input: Parameters<typeof evaluateAnswer>[0]) =>
      evaluateAnswer(input),
  });
}

export function useSubmitTeacherQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questId, attempt }: { questId: string; attempt: string }) =>
      submitTeacherQuest(questId, attempt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_QUEST_KEY });
      queryClient.invalidateQueries({ queryKey: TEACHER_KEY });
    },
  });
}
