"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Gift, Sparkles, Package } from "lucide-react";
import type { LootEntry } from "@/lib/gamification/loot";
import { rarityColor, rarityLabel } from "@/lib/gamification/loot";

const GLOW_INTENSITY: Record<string, number> = {
  COMMON: 0,
  UNCOMMON: 0.08,
  RARE: 0.15,
  EPIC: 0.25,
  LEGENDARY: 0.4,
};

interface LootDropToastProps {
  loot: LootEntry;
  visible: boolean;
  onClose: () => void;
  index?: number;
}

export function LootDropToast({ loot, visible, onClose, index = 0 }: LootDropToastProps) {
  const router = useRouter();
  const rarity = loot.rarity;
  const color = rarityColor[rarity] ?? rarityColor.COMMON;
  const glow = GLOW_INTENSITY[rarity] ?? 0;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  const handleClick = useCallback(() => {
    onClose();
    router.push("/inventory");
  }, [onClose, router]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 320, opacity: 0, scale: 0.85 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 320, opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", damping: 22, stiffness: 220 }}
          className="fixed z-50 w-80 cursor-pointer"
          style={{ bottom: `${16 + index * 96}px`, right: "16px" }}
          onClick={handleClick}
        >
          <div
            className="relative overflow-hidden rounded-xl border bg-n-900 p-4 transition-shadow"
            style={{
              borderColor: `var(${color})`,
              boxShadow: glow > 0 ? `0 0 24px 4px var(${color})` : "none",
              opacity: 1,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 80% 50%, var(${color}), transparent 70%)`,
                opacity: glow,
              }}
            />

            <div className="relative flex items-center gap-3">
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${color}) 15%, transparent)`,
                  border: `1px solid var(${color})`,
                }}
              >
                <Gift className="h-5 w-5" style={{ color: `var(${color})` }} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" style={{ color: `var(${color})` }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `var(${color})` }}>
                    Loot Drop!
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-semibold text-foreground truncate">
                  {loot.name}
                </p>
                <span
                  className="inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: `var(${color})`,
                    backgroundColor: `color-mix(in srgb, var(${color}) 12%, transparent)`,
                  }}
                >
                  {rarityLabel[rarity] ?? rarity}
                </span>
              </div>

              <Package className="h-4 w-4 shrink-0 text-n-500" />
            </div>

            {glow > 0.2 && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  boxShadow: `inset 0 0 30px var(${color})`,
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
