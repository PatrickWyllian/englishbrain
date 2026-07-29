/**
 * Weighted random loot roll.
 * Only returns items bound to user's level range.
 */

export interface LootDropEntry {
  weight: number;
  minLevel: number;
  maxLevel: number | null;
  item: LootEntry;
}

export interface LootEntry {
  id: string;
  name: string;
  rarity: string;
}

export function rollLoot(drops: LootDropEntry[], userLevel: number): LootDropEntry["item"] | null {
  const eligible = drops.filter(
    (d) => d.minLevel <= userLevel && (d.maxLevel === null || d.maxLevel >= userLevel)
  );
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, d) => sum + d.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const drop of eligible) {
    roll -= drop.weight;
    if (roll <= 0) return drop.item;
  }
  // Fallback (floating point rounding)
  return eligible[eligible.length - 1].item;
}

export const rarityLabel: Record<string, string> = {
  COMMON: "Comum",
  UNCOMMON: "Incomum",
  RARE: "Raro",
  EPIC: "\u00C9pico",
  LEGENDARY: "Lend\u00E1rio",
};

export const rarityColor: Record<string, string> = {
  COMMON: "var(--color-rarity-common)",
  UNCOMMON: "var(--color-rarity-uncommon)",
  RARE: "var(--color-rarity-rare)",
  EPIC: "var(--color-rarity-epic)",
  LEGENDARY: "var(--color-rarity-legendary)",
};

/**
 * Default loot table rewarded after lessons.
 */
export const LESSON_LOOT_TABLE: LootDropEntry[] = [
  {
    weight: 60,
    minLevel: 1,
    maxLevel: 99,
    item: { id: "loot_pen_common", name: "Caneta do Estagiário", rarity: "COMMON" },
  },
  {
    weight: 25,
    minLevel: 1,
    maxLevel: 99,
    item: { id: "loot_sticker_uncommon", name: "Adesivo do Dwight", rarity: "UNCOMMON" },
  },
  {
    weight: 10,
    minLevel: 3,
    maxLevel: 99,
    item: { id: "loot_charger_rare", name: "Carregador Portátil", rarity: "RARE" },
  },
  {
    weight: 4,
    minLevel: 5,
    maxLevel: 99,
    item: { id: "loot_headset_epic", name: "Headset de Conferência", rarity: "EPIC" },
  },
  {
    weight: 1,
    minLevel: 10,
    maxLevel: null,
    item: { id: "loot_golden_stapler", name: "Grampeador Dourado", rarity: "LEGENDARY" },
  },
];
