"use client";

import { motion } from "framer-motion";
import { rarityColor } from "@/lib/gamification/loot";

interface LootCardProps {
  item: { id: string; name: string; rarity: string };
  showRarity?: boolean;
}

export function LootCard({ item, showRarity = true }: LootCardProps) {
  const color = rarityColor[item.rarity] ?? rarityColor.COMMON;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl bg-n-900 border border-n-700 p-4 flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{
          backgroundColor: `${color}20`,
          border: `1px solid ${color}`,
        }}
      >
        🎁
      </div>
      <div>
        <div className="font-display font-semibold text-foreground text-sm">
          {item.name}
        </div>
        {showRarity && (
          <div className="text-xs capitalize" style={{ color }}>
            {item.rarity.toLowerCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
