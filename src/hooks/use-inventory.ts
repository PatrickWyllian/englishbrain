"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInventoryItems,
  getEquippedItems,
  equipItem,
  unequipItem,
} from "@/app/actions/inventory";

export const INVENTORY_KEY = ["inventory"] as const;

interface InventoryItemData {
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

interface EquippedItemData {
  id: string;
  userId: string;
  itemId: string;
  slot: string;
  equippedAt: Date;
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

export function useInventory(userId?: string) {
  return useQuery({
    queryKey: [...INVENTORY_KEY, userId],
    queryFn: () => getInventoryItems(userId) as Promise<InventoryItemData[]>,
    staleTime: 30_000,
  });
}

export function useEquipped(userId?: string) {
  return useQuery({
    queryKey: [...INVENTORY_KEY, "equipped", userId],
    queryFn: () => getEquippedItems(userId) as Promise<EquippedItemData[]>,
    staleTime: 30_000,
  });
}

export function useEquipItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      slot,
    }: {
      itemId: string;
      slot: string;
    }) => equipItem(itemId, slot) as Promise<
      | { equipped: EquippedItemData[]; slot: string }
      | { unequipped: true; slot: string }
      | { error: string }
    >,
    onMutate: async ({ itemId, slot }) => {
      await queryClient.cancelQueries({ queryKey: INVENTORY_KEY });

      const previousEquipped = queryClient.getQueryData([...INVENTORY_KEY, "equipped"]);

      queryClient.setQueryData(
        [...INVENTORY_KEY, "equipped"],
        (old: EquippedItemData[] | undefined) => {
          if (!old) return old;

          const alreadyInSlot = old.find((e) => e.slot === slot);
          if (alreadyInSlot && alreadyInSlot.itemId === itemId) {
            return old.filter((e) => e.slot !== slot);
          }

          const withoutSlot = old.filter((e) => e.slot !== slot);
          const inventoryItems = queryClient.getQueryData([...INVENTORY_KEY]) as
            | InventoryItemData[]
            | undefined;
          const invItem = inventoryItems?.find((i) => i.itemId === itemId);
          if (!invItem) return old;

          return [
            ...withoutSlot,
            {
              id: `optimistic-${slot}-${itemId}`,
              userId: "",
              itemId,
              slot,
              equippedAt: new Date(),
              item: invItem.item,
            },
          ];
        },
      );

      return { previousEquipped };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEquipped) {
        queryClient.setQueryData(
          [...INVENTORY_KEY, "equipped"],
          context.previousEquipped,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
    },
  });
}

export function useUnequipItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slot: string) =>
      unequipItem(slot) as Promise<
        { equipped: EquippedItemData[]; slot: string } | { error: string }
      >,
    onMutate: async (slot) => {
      await queryClient.cancelQueries({ queryKey: INVENTORY_KEY });

      const previousEquipped = queryClient.getQueryData([...INVENTORY_KEY, "equipped"]);

      queryClient.setQueryData(
        [...INVENTORY_KEY, "equipped"],
        (old: EquippedItemData[] | undefined) => {
          if (!old) return old;
          return old.filter((e) => e.slot !== slot);
        },
      );

      return { previousEquipped };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEquipped) {
        queryClient.setQueryData(
          [...INVENTORY_KEY, "equipped"],
          context.previousEquipped,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY });
    },
  });
}
