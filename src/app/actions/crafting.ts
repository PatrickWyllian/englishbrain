"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

const RARITY_ORDER = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"] as const;

function nextRarity(current: string): string | null {
  const idx = RARITY_ORDER.indexOf(current as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY");
  if (idx < 0 || idx >= RARITY_ORDER.length - 1) return null;
  return RARITY_ORDER[idx + 1];
}

export async function craftItem(materialIds: string[]) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  if (materialIds.length < 3) {
    return { error: "São necessários pelo menos 3 materiais" as const };
  }

  const materials = await prisma.inventoryItem.findMany({
    where: { userId, id: { in: materialIds } },
    include: { item: true },
  });

  if (materials.length !== materialIds.length) {
    return { error: "Alguns materiais não foram encontrados" as const };
  }

  const allCommon = materials.every((m) => m.item.rarity === "COMMON");
  if (!allCommon) {
    return { error: "Apenas itens Comuns podem ser forjados" as const };
  }

  const allMaterialType = materials.every((m) => m.item.type === "MATERIAL");
  if (!allMaterialType) {
    return { error: "Apenas itens do tipo Material podem ser forjados" as const };
  }

  for (const m of materials) {
    if (m.quantity <= 1) {
      await prisma.inventoryItem.delete({ where: { id: m.id } });
    } else {
      await prisma.inventoryItem.update({
        where: { id: m.id },
        data: { quantity: m.quantity - 1 },
      });
    }
  }

  const rarityUp = nextRarity("COMMON") ?? "UNCOMMON";

  const possibleItems = await prisma.item.findMany({
    where: { rarity: rarityUp as "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" },
  });

  if (possibleItems.length === 0) {
    return { error: "Nenhum item disponível para esta raridade" as const };
  }

  const craftedItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];

  const existing = await prisma.inventoryItem.findFirst({
    where: { userId, itemId: craftedItem.id },
  });

  let inventoryItem;
  if (existing) {
    inventoryItem = await prisma.inventoryItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 },
      include: { item: true },
    });
  } else {
    inventoryItem = await prisma.inventoryItem.create({
      data: { userId, itemId: craftedItem.id, quantity: 1 },
      include: { item: true },
    });
  }

  return { success: true as const, item: inventoryItem };
}
