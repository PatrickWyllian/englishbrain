"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConsumables,
  useConsumable as consumeItem,
  getActiveEffects,
} from "@/app/actions/inventory";

const CONSUMABLES_KEY = ["consumables"] as const;
const ACTIVE_EFFECTS_KEY = ["activeEffects"] as const;

interface ConsumableItem {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  acquiredAt: Date;
  item: {
    id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
    icon: string;
    effects: unknown;
    isCosmetic: boolean;
  };
}

interface ActiveEffect {
  type: string;
  activatedAt: string;
  expiresAt: string;
}

export function useConsumables() {
  return useQuery({
    queryKey: CONSUMABLES_KEY,
    queryFn: () => getConsumables() as Promise<ConsumableItem[]>,
    staleTime: 30_000,
  });
}

export function useActiveEffects() {
  return useQuery({
    queryKey: ACTIVE_EFFECTS_KEY,
    queryFn: () => getActiveEffects() as Promise<ActiveEffect[]>,
    staleTime: 30_000,
  });
}

export function useUseConsumable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      consumeItem(itemId) as Promise<
        | { success: true; effect: string; manaRestored?: number }
        | { error: string }
      >,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CONSUMABLES_KEY });

      const previous = queryClient.getQueryData(CONSUMABLES_KEY);

      queryClient.setQueryData(
        CONSUMABLES_KEY,
        (old: ConsumableItem[] | undefined) => {
          if (!old) return old;
          return old
            .map((c) =>
              c.itemId === itemId
                ? { ...c, quantity: c.quantity - 1 }
                : c,
            )
            .filter((c) => c.quantity > 0);
        },
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CONSUMABLES_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CONSUMABLES_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_EFFECTS_KEY });
    },
  });
}
