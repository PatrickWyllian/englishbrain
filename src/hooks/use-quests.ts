"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDailyQuests,
  getWeeklyQuests,
  claimQuestReward,
  refreshQuestProgress,
} from "@/app/actions/quests";

const QUESTS_KEY = ["quests"] as const;

export function useDailyQuests(userId?: string) {
  return useQuery({
    queryKey: [...QUESTS_KEY, "daily", userId],
    queryFn: () => getDailyQuests(userId),
    staleTime: 30_000,
  });
}

export function useWeeklyQuests(userId?: string) {
  return useQuery({
    queryKey: [...QUESTS_KEY, "weekly", userId],
    queryFn: () => getWeeklyQuests(userId),
    staleTime: 30_000,
  });
}

export function useClaimQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questId: string) => claimQuestReward(questId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTS_KEY });
    },
  });
}

export function useRefreshQuests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refreshQuestProgress(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTS_KEY });
    },
  });
}
