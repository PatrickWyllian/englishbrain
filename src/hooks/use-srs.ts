"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserSrsCards, getDueCards, upsertSrsCard } from "@/app/actions/srs";

const SRS_KEY = ["srs"] as const;

interface SrsCardData {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: Date;
  lastReviewed: Date | null;
  lapseCount: number;
}

export function useSrsCards() {
  return useQuery({
    queryKey: SRS_KEY,
    queryFn: () => getUserSrsCards() as Promise<SrsCardData[]>,
    staleTime: 30_000,
  });
}

export function useDueCards() {
  return useQuery({
    queryKey: [...SRS_KEY, "due"],
    queryFn: () => getDueCards() as Promise<SrsCardData[]>,
    staleTime: 10_000,
  });
}

export function useGradeCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      contentType,
      grade,
    }: {
      contentId: string;
      contentType: string;
      grade: number;
    }) => upsertSrsCard(contentId, contentType as "VOCAB" | "GRAMMAR" | "PHRASE", grade) as Promise<{ card: SrsCardData } | { error: string }>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SRS_KEY });
    },
    onError: () => {},
  });
}
