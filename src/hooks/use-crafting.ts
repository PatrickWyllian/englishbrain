"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { craftItem } from "@/app/actions/crafting";
import { INVENTORY_KEY } from "@/hooks/use-inventory";

const CRAFT_KEY = ["crafting"] as const;

export function useCraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialIds: string[]) =>
      craftItem(materialIds) as Promise<
        | { success: true; item: { id: string; item: { name: string; rarity: string } } }
        | { error: string }
      >,
    onMutate: async (materialIds) => {
      await queryClient.cancelQueries({ queryKey: INVENTORY_KEY });

      const previous = queryClient.getQueryData(INVENTORY_KEY);

      queryClient.setQueryData(INVENTORY_KEY, (old: Array<{ id: string; quantity: number }> | undefined) => {
        if (!old) return old;
        return old
          .map((inv) => {
            if (materialIds.includes(inv.id)) {
              if (inv.quantity <= 1) return null;
              return { ...inv, quantity: inv.quantity - 1 };
            }
            return inv;
          })
          .filter(Boolean);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(INVENTORY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
      queryClient.invalidateQueries({ queryKey: CRAFT_KEY });
    },
  });
}
