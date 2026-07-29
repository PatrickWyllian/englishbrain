"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCraft } from "@/hooks/use-crafting";
import { rarityColor } from "@/lib/gamification/loot";

export interface MaterialItem {
  id: string;
  itemId: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
    icon: string;
  };
}

interface CraftingPanelProps {
  materials: MaterialItem[];
}

export function CraftingPanel({ materials }: CraftingPanelProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [craftedItem, setCraftedItem] = useState<{ name: string; rarity: string } | null>(null);
  const craftMutation = useCraft();

  const selectableMaterials = materials.filter(
    (m) => m.item.rarity === "COMMON" && m.item.type === "MATERIAL",
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleCraft = () => {
    if (selected.length < 3) return;
    craftMutation.mutate(selected, {
      onSuccess: (result) => {
        if ("success" in result && result.success && result.item) {
          setCraftedItem(result.item.item);
          setSelected([]);
          setTimeout(() => setCraftedItem(null), 3000);
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hammer className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Forjar Item</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          3 Comum → 1 Incomum
        </Badge>
      </div>

      <p className="text-xs text-n-400">
        Selecione 3 materiais Comuns para forjar um item de maior raridade.
      </p>

      {selectableMaterials.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <Hammer className="mx-auto h-8 w-8 text-n-600" />
          <p className="text-xs text-n-500">Nenhum material disponível para forja.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {selectableMaterials.map((m) => {
              const isSelected = selected.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleSelect(m.id)}
                  disabled={craftMutation.isPending}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-n-700 bg-n-800/60 hover:border-n-500"
                  }`}
                >
                  <div
                    className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: `var(${rarityColor[m.item.rarity as keyof typeof rarityColor] ?? "--n-700"})`,
                      opacity: 0.15,
                    }}
                  >
                    <Sparkles
                      className="h-4 w-4"
                      style={{
                        color: `var(${rarityColor[m.item.rarity as keyof typeof rarityColor] ?? "--n-400"})`,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{m.item.name}</p>
                    <p className="text-[10px] text-n-500">x{m.quantity}</p>
                  </div>
                  {isSelected && <Check className="h-3 w-3 text-accent shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-n-400">
              {selected.length}/3 selecionados
            </p>
            <Button
              variant="primary"
              size="sm"
              disabled={selected.length < 3 || craftMutation.isPending}
              isLoading={craftMutation.isPending}
              onClick={handleCraft}
            >
              <Hammer className="h-4 w-4" />
              Forjar
            </Button>
          </div>

          {craftMutation.isError && (
            <p className="text-xs text-error">
              {(craftMutation.failureReason as { error?: string })?.error ?? "Erro ao forjar item"}
            </p>
          )}
        </>
      )}

      <AnimatePresence>
        {craftedItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{craftedItem.name}</p>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-0.5">
                {craftedItem.rarity}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
