"use client";

import { useMemo } from "react";
import type { PlayerProfile } from "@/types";
import { LootCard } from "./LootCard";

interface LootLogProps {
  player: PlayerProfile;
}

const MOCK_LOOT: { name: string; rarity: string }[] = [
  { name: "Insígnia de Bronze", rarity: "COMMON" },
  { name: "Poção de XP Menor", rarity: "UNCOMMON" },
  { name: "Pergaminho de Vocab", rarity: "RARE" },
  { name: "Tomo de Gramática", rarity: "EPIC" },
  { name: "Dragonstone Lendária", rarity: "LEGENDARY" },
];

export function LootLog({ player }: LootLogProps) {
  const items = useMemo(() => {
    // Deterministic seed based on player id so SSR/hydration match.
    const seed =
      player.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) +
      player.level * 31 +
      player.streak * 7;

    const count = 3;
    return Array.from({ length: count }, (_, i) => {
      // Pure pseudo-random index derived from the seed + offset.
      const index = Math.floor(
        Math.abs(Math.sin(seed + i) * 10000) % MOCK_LOOT.length
      );
      const loot = MOCK_LOOT[index];
      return {
        id: `loot-${player.id}-${i}`,
        name: loot.name,
        rarity: loot.rarity,
        timestamp: `${i + 1}d`,
      };
    });
  }, [player.id, player.level, player.streak]);

  return (
    <div className="rounded-xl bg-n-900 border border-n-800 p-5">
      <h3 className="font-display font-semibold text-sm text-n-200 mb-4">
        Loot Recente
      </h3>

      {items.length === 0 ? (
        <p className="text-xs text-n-500">
          Complete lições para receber drops.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <LootCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
