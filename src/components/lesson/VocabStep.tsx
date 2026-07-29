"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { VocabItem } from "@/lib/lesson/types";

export function VocabStep({
  items,
  onComplete,
}: {
  items: VocabItem[];
  onComplete: (correct: number, total: number) => void;
}) {
  const [known, setKnown] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    const next = new Set(known);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setKnown(next);
    onComplete(next.size, items.length);
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const isKnown = known.has(i);
        return (
          <motion.div
            key={item.word}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => toggle(i)}
            className={`
              cursor-pointer rounded-2xl border p-5 transition-all
              ${
                isKnown
                  ? "bg-accent/10 border-accent"
                  : "bg-n-900 border-n-700 hover:border-n-500"
              }
            `}
            role="button"
            aria-pressed={isKnown}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-display text-xl font-bold text-foreground">
                  {item.word}
                </div>
                <div className="text-sm font-medium text-accent-secondary">
                  {item.translation}
                </div>
                <div className="text-sm text-n-400 italic">
                  “{item.context}”
                </div>
              </div>
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors
                  ${
                    isKnown
                      ? "bg-accent border-accent text-n-950"
                      : "border-n-600 text-transparent"
                  }
                `}
              >
                <Check className="w-5 h-5" strokeWidth={3} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
