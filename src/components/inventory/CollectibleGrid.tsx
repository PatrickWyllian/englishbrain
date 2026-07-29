"use client";

import { motion } from "framer-motion";
import { Award, Quote, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BADGE_DEFINITIONS, SCENE_CARDS } from "@/lib/items/collectibles";

export interface CollectibleItem {
  id: string;
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

interface CollectibleGridProps {
  items: CollectibleItem[];
}

export function CollectibleGrid({ items }: CollectibleGridProps) {
  const badges = items.filter((i) => i.item.type === "BADGE");
  const cards = items.filter((i) => i.item.isCosmetic && i.item.type === "BADGE");

  return (
    <div className="space-y-6">
      {badges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-n-300 uppercase tracking-wider mb-3">
            Insígnias
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map((item, idx) => {
              const def = BADGE_DEFINITIONS.find((b) => b.id === item.item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-n-700 bg-n-800/60 p-4 text-center space-y-2"
                >
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-accent/10">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {def?.name ?? item.item.name}
                  </p>
                  <p className="text-[11px] text-n-400">
                    {def?.description ?? item.item.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-n-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.acquiredAt).toLocaleDateString("pt-BR")}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-n-300 uppercase tracking-wider mb-3">
            Cartas de Cena
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cards.map((item, idx) => {
              const scene = SCENE_CARDS.find((s) => s.id === item.item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-n-700 bg-n-800/60 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10">
                      <Quote className="h-4 w-4 text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground italic">
                        &ldquo;{scene?.quote ?? item.item.description}&rdquo;
                      </p>
                      <p className="text-[11px] text-n-400 mt-1">
                        {scene?.character ?? item.item.name} — {scene?.series ?? "Série"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      {item.item.rarity}
                    </Badge>
                    <span className="text-[10px] text-n-500">
                      {new Date(item.acquiredAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {badges.length === 0 && cards.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Award className="mx-auto h-10 w-10 text-n-600" />
          <p className="text-sm text-n-500">
            Nenhum colecionável ainda. Continue estudando para desbloquear!
          </p>
        </div>
      )}
    </div>
  );
}
