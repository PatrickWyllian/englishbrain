"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONSUMABLE_EFFECTS, isActiveEffect, type ActiveEffect } from "@/lib/items/consumables";
import { z } from "zod";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function getInventoryItems(userId?: string) {
  const id = userId ?? (await getAuthUserId());
  if (!id) return [];

  return prisma.inventoryItem.findMany({
    where: { userId: id },
    include: { item: true },
    orderBy: { acquiredAt: "desc" },
  });
}

export async function getEquippedItems(userId?: string) {
  const id = userId ?? (await getAuthUserId());
  if (!id) return [];

  return prisma.equippedItem.findMany({
    where: { userId: id },
    include: { item: true },
    orderBy: { equippedAt: "desc" },
  });
}

export async function equipItem(itemId: string, slot: string) {
  const equipSchema = z.object({
    itemId: z.string().min(1, "ID do item é obrigatório"),
    slot: z.string().min(1, "Slot é obrigatório"),
  });
  const parsed = equipSchema.safeParse({ itemId, slot });
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message } as const;
  }

  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: { userId, itemId },
  });

  if (!inventoryItem) {
    return { error: "Item não encontrado no inventário" as const };
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Item não encontrado" as const };

  const existingInSlot = await prisma.equippedItem.findUnique({
    where: { userId_slot: { userId, slot } },
  });

  if (existingInSlot) {
    if (existingInSlot.itemId === itemId) {
      await prisma.equippedItem.delete({ where: { id: existingInSlot.id } });
      return { unequipped: true as const, slot };
    }

    await prisma.equippedItem.update({
      where: { id: existingInSlot.id },
      data: { itemId },
    });
  } else {
    await prisma.equippedItem.create({
      data: { userId, itemId, slot },
    });
  }

  const equipped = await prisma.equippedItem.findMany({
    where: { userId },
    include: { item: true },
  });

  return { equipped, slot };
}

export async function unequipItem(slot: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const existing = await prisma.equippedItem.findUnique({
    where: { userId_slot: { userId, slot } },
  });

  if (!existing) {
    return { error: "Nenhum item equipado neste slot" as const };
  }

  await prisma.equippedItem.delete({ where: { id: existing.id } });

  const equipped = await prisma.equippedItem.findMany({
    where: { userId },
    include: { item: true },
  });

  return { equipped, slot };
}

export async function addItemToInventory(itemId: string, quantity = 1) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const existing = await prisma.inventoryItem.findFirst({
    where: { userId, itemId },
  });

  if (existing) {
    const updated = await prisma.inventoryItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { item: true },
    });
    return { inventoryItem: updated };
  }

  const created = await prisma.inventoryItem.create({
    data: { userId, itemId, quantity },
    include: { item: true },
  });

  return { inventoryItem: created };
}

export async function removeItemFromInventory(itemId: string, quantity = 1) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const existing = await prisma.inventoryItem.findFirst({
    where: { userId, itemId },
  });

  if (!existing) {
    return { error: "Item não encontrado no inventário" as const };
  }

  if (existing.quantity <= quantity) {
    await prisma.inventoryItem.delete({ where: { id: existing.id } });
    return { removed: true as const };
  }

  const updated = await prisma.inventoryItem.update({
    where: { id: existing.id },
    data: { quantity: existing.quantity - quantity },
    include: { item: true },
  });

  return { inventoryItem: updated };
}

export async function useConsumable(itemId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: { userId, itemId },
    include: { item: true },
  });

  if (!inventoryItem) {
    return { error: "Item não encontrado no inventário" as const };
  }

  if (inventoryItem.item.type !== "CONSUMABLE") {
    return { error: "Este item não é consumível" as const };
  }

  const effectKey = (inventoryItem.item.effects as Record<string, string>)?.effectKey;
  if (!effectKey || !(effectKey in CONSUMABLE_EFFECTS)) {
    return { error: "Efeito do item não reconhecido" as const };
  }

  const effectDef = CONSUMABLE_EFFECTS[effectKey];

  if (effectKey === "mana_potion") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Usuário não encontrado" as const };

    const newMana = Math.min(user.maxMana, user.mana + 50);
    await prisma.user.update({ where: { id: userId }, data: { mana: newMana } });

    await removeItemFromInventory(itemId, 1);
    return { success: true as const, effect: "MANA_POTION", manaRestored: newMana - user.mana };
  }

  const existingEffects = await prisma.user.findUnique({ where: { id: userId } });
  const activeEffects = ((existingEffects as Record<string, unknown>)?.activeEffects as ActiveEffect[]) ?? [];

  const now = new Date();
  const newEffect = {
    type: effectDef.type,
    activatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + effectDef.durationMs).toISOString(),
  };

  const alreadyActive = activeEffects.some(
    (e) => e.type === effectDef.type && isActiveEffect(e),
  );
  if (alreadyActive) {
    return { error: "Este efeito já está ativo" as const };
  }

  await prisma.$executeRaw`
    UPDATE "User" SET "activeEffects" = jsonb_build_array(${JSON.stringify(newEffect)}::jsonb)
    WHERE id = ${userId}
  `.catch(async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { activeEffects: [newEffect] } as Record<string, unknown>,
    });
  });

  await removeItemFromInventory(itemId, 1);
  return { success: true as const, effect: effectDef.type };
}

export async function getActiveEffects() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const effects = ((user as Record<string, unknown>)?.activeEffects as ActiveEffect[]) ?? [];
  return effects.filter(isActiveEffect);
}

export async function getConsumables() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  return prisma.inventoryItem.findMany({
    where: { userId, item: { type: "CONSUMABLE" } },
    include: { item: true },
    orderBy: { acquiredAt: "desc" },
  });
}

export async function getCollectibles() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  return prisma.inventoryItem.findMany({
    where: { userId, item: { type: "BADGE" } },
    include: { item: true },
    orderBy: { acquiredAt: "desc" },
  });
}

export async function getSceneCards() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  return prisma.inventoryItem.findMany({
    where: { userId, item: { type: "BADGE", isCosmetic: true } },
    include: { item: true },
    orderBy: { acquiredAt: "desc" },
  });
}

export async function getMaterials() {
  const userId = await getAuthUserId();
  if (!userId) return [];

  return prisma.inventoryItem.findMany({
    where: { userId, item: { type: "MATERIAL" } },
    include: { item: true },
    orderBy: { acquiredAt: "desc" },
  });
}
