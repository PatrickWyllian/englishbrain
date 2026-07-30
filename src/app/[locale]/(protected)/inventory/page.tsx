"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Shield,
  Sparkles,
  ArrowLeft,
  Shirt,
  Crown,
  Cat,
  Sword,
  Loader2,
  Zap,
  Snowflake,
  Droplets,
  Hammer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { rarityColor } from "@/lib/gamification/loot";
import { useInventory, useEquipped, useEquipItem, useUnequipItem } from "@/hooks/use-inventory";
import { useConsumables, useActiveEffects, useUseConsumable } from "@/hooks/use-consumables";
import { CollectibleGrid, type CollectibleItem } from "@/components/inventory/CollectibleGrid";
import { CraftingPanel, type MaterialItem } from "@/components/inventory/CraftingPanel";
import { formatRemainingTime, getEffectRemainingMs, type ActiveEffect } from "@/lib/items/consumables";

interface EquippedSlots {
  FRAME: string | null;
  TITLE: string | null;
  PET: string | null;
  WEAPON: string | null;
}

const SLOT_ICONS: Record<string, React.ElementType> = {
  FRAME: Shirt,
  TITLE: Crown,
  PET: Cat,
  WEAPON: Sword,
};

const SLOT_LABELS: Record<string, string> = {
  FRAME: "Moldura",
  TITLE: "Título",
  PET: "Pet",
  WEAPON: "Arma",
};

const EFFECT_ICONS: Record<string, React.ElementType> = {
  XP_BOOST: Zap,
  STREAK_FREEZE: Snowflake,
  MANA_POTION: Droplets,
};

const EFFECT_LABELS: Record<string, string> = {
  XP_BOOST: "Boost de XP (1.5x)",
  STREAK_FREEZE: "Congelamento de Sequência",
  MANA_POTION: "Poção de Mana",
};

export default function InventoryPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("all");
  const [showCrafting, setShowCrafting] = useState(false);

  const { data: inventoryData = [], isLoading: loadingInventory } = useInventory();
  const { data: equippedData = [], isLoading: loadingEquipped } = useEquipped();
  const { data: consumablesData = [] } = useConsumables();
  const { data: activeEffects = [] } = useActiveEffects();
  const equipMutation = useEquipItem();
  const unequipMutation = useUnequipItem();
  const useConsumableMutation = useUseConsumable();

  const isLoading = loadingInventory || loadingEquipped;

  const [effectTimers, setEffectTimers] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimers = () => {
      const timers: Record<string, string> = {};
      for (const effect of activeEffects) {
        const remaining = getEffectRemainingMs(effect as ActiveEffect);
        timers[effect.type] = formatRemainingTime(remaining);
      }
      setEffectTimers(timers);
    };
    updateTimers();
    const interval = setInterval(updateTimers, 60_000);
    return () => clearInterval(interval);
  }, [activeEffects]);

  const equipped: EquippedSlots = { FRAME: null, TITLE: null, PET: null, WEAPON: null };
  for (const e of equippedData) {
    if (e.slot in equipped) {
      equipped[e.slot as keyof EquippedSlots] = e.itemId;
    }
  }

  const items = inventoryData.map((inv) => ({
    ...inv.item,
    inventoryId: inv.id,
    quantity: inv.quantity,
    acquiredAt: inv.acquiredAt,
  }));

  const categorized = {
    all: items,
    equipped: items.filter((item) => Object.values(equipped).includes(item.id)),
    consumables: items.filter((item) => item.type === "CONSUMABLE"),
    collectibles: items.filter((item) => item.type === "BADGE"),
    materials: items.filter((item) => item.type === "MATERIAL"),
  };

  const handleEquip = (slot: keyof EquippedSlots, itemId: string) => {
    if (equipped[slot] === itemId) {
      unequipMutation.mutate(slot);
    } else {
      equipMutation.mutate({ itemId, slot });
    }
  };

  const findItem = (id: string | null) =>
    id ? items.find((item) => item.id === id) : null;

  const isPending = equipMutation.isPending || unequipMutation.isPending;

  if (isLoading) {
    return (
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto pb-20 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg p-2 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Inventário
            </h1>
            <p className="text-sm text-n-400">Carregando...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-n-500" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto pb-20 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg p-2 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Inventário
          </h1>
          <p className="text-sm text-n-400">
            Gerencie seus itens e equipamentos
          </p>
        </div>
      </div>

      {activeEffects.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-n-400 uppercase tracking-wider">Efeitos Ativos</h3>
          <div className="flex flex-wrap gap-2">
            {activeEffects.map((effect) => {
              const Icon = EFFECT_ICONS[effect.type] ?? Sparkles;
              return (
                <motion.div
                  key={effect.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  <span className="text-xs font-medium text-foreground">
                    {EFFECT_LABELS[effect.type] ?? effect.type}
                  </span>
                  <Badge variant="success" className="text-[9px] px-1.5 py-0">
                    {effectTimers[effect.type] ?? "Ativo"}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(SLOT_LABELS) as (keyof EquippedSlots)[]).map((slot) => {
          const equippedItem = findItem(equipped[slot]);
          const Icon = SLOT_ICONS[slot];

          return (
            <div
              key={slot}
              className="rounded-xl border border-n-700 bg-n-800/60 p-4 text-center space-y-2"
            >
              <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg bg-n-700">
                <Icon className="h-5 w-5 text-n-400" />
              </div>
              <p className="text-[10px] text-n-500 uppercase tracking-wider font-semibold">
                {SLOT_LABELS[slot]}
              </p>
              {equippedItem ? (
                <div>
                  <p
                    className="text-xs font-semibold truncate"
                    style={{
                      color: `var(${rarityColor[equippedItem.rarity as keyof typeof rarityColor] ?? "--n-400"})`,
                    }}
                  >
                    {equippedItem.name}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-1 text-[9px] px-1.5 py-0"
                  >
                    {equippedItem.rarity}
                  </Badge>
                </div>
              ) : (
                <p className="text-xs text-n-600">Vazio</p>
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Itens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full justify-start gap-1 overflow-x-auto">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="equipped">Equipados</TabsTrigger>
              <TabsTrigger value="consumables">Consumíveis</TabsTrigger>
              <TabsTrigger value="collectibles">Colecionáveis</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {categorized.all.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="mx-auto h-10 w-10 text-n-600" />
                  <p className="text-sm text-n-500">
                    Seu inventário está vazio. Complete lições para ganhar loot!
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push("/learn")}
                  >
                    Fazer uma lição
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorized.all.map((item, idx) => {
                    const isEquipped = Object.entries(equipped).some(
                      ([, id]) => id === item.id,
                    );
                    const equippedSlot = Object.entries(equipped).find(
                      ([, id]) => id === item.id,
                    );

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 rounded-xl border border-n-700 bg-n-800/60 p-4 hover:border-accent/30 transition-colors"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-700"})`,
                            opacity: 0.15,
                          }}
                        >
                          <Sparkles
                            className="h-5 w-5"
                            style={{
                              color: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-400"})`,
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0"
                            >
                              {item.rarity}
                            </Badge>
                            {isEquipped && (
                              <Badge
                                variant="success"
                                className="text-[9px] px-1.5 py-0"
                              >
                                Equipado ({SLOT_LABELS[equippedSlot?.[0] ?? ""]})
                              </Badge>
                            )}
                            {item.quantity > 1 && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0"
                              >
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          {item.type === "CONSUMABLE" ? (
                            <button
                              onClick={() => useConsumableMutation.mutate(item.id)}
                              disabled={useConsumableMutation.isPending}
                              className="rounded-md px-2 py-1 text-[9px] font-semibold transition-colors whitespace-nowrap bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 disabled:opacity-50"
                            >
                              Usar
                            </button>
                          ) : (
                            (Object.keys(SLOT_LABELS) as (keyof EquippedSlots)[]).map(
                              (slot) => (
                                <button
                                  key={slot}
                                  onClick={() => handleEquip(slot, item.id)}
                                  disabled={isPending}
                                  className={`rounded-md px-2 py-1 text-[9px] font-semibold transition-colors whitespace-nowrap disabled:opacity-50 ${
                                    equipped[slot] === item.id
                                      ? "bg-success/20 text-success border border-success/30"
                                      : "bg-n-700/50 text-n-400 hover:bg-n-600 hover:text-n-200 border border-n-600"
                                  }`}
                                >
                                  {equipped[slot] === item.id
                                    ? "Desequip."
                                    : SLOT_LABELS[slot]}
                                </button>
                              ),
                            )
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="equipped" className="mt-4">
              {categorized.equipped.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Shield className="mx-auto h-10 w-10 text-n-600" />
                  <p className="text-sm text-n-500">Nenhum item equipado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorized.equipped.map((item, idx) => {
                    const equippedSlot = Object.entries(equipped).find(
                      ([, id]) => id === item.id,
                    );
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 p-4"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-700"})`,
                            opacity: 0.15,
                          }}
                        >
                          <Sparkles
                            className="h-5 w-5"
                            style={{
                              color: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-400"})`,
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="success" className="text-[9px] px-1.5 py-0">
                              {SLOT_LABELS[equippedSlot?.[0] ?? ""]}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {item.rarity}
                            </Badge>
                          </div>
                        </div>
                        <button
                          onClick={() => unequipMutation.mutate(equippedSlot![0])}
                          disabled={isPending}
                          className="rounded-md px-2 py-1 text-[9px] font-semibold transition-colors bg-error/10 text-error border border-error/30 hover:bg-error/20 disabled:opacity-50"
                        >
                          Desequipar
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="consumables" className="mt-4">
              {categorized.consumables.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Zap className="mx-auto h-10 w-10 text-n-600" />
                  <p className="text-sm text-n-500">
                    Nenhum consumível no inventário.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorized.consumables.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 rounded-xl border border-n-700 bg-n-800/60 p-4 hover:border-accent/30 transition-colors"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-700"})`,
                            opacity: 0.15,
                          }}
                        >
                          <Zap
                            className="h-5 w-5"
                            style={{
                              color: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-400"})`,
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-n-400 mt-0.5">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {item.rarity}
                            </Badge>
                            {item.quantity > 1 && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={useConsumableMutation.isPending}
                          isLoading={useConsumableMutation.isPending}
                          onClick={() => useConsumableMutation.mutate(item.id)}
                          className="shrink-0"
                        >
                          Usar
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="collectibles" className="mt-4">
              <CollectibleGrid items={consumablesData as unknown as CollectibleItem[]} />
            </TabsContent>

            <TabsContent value="materials" className="mt-4">
              {categorized.materials.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="mx-auto h-10 w-10 text-n-600" />
                  <p className="text-sm text-n-500">
                    Nenhum material no inventário.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorized.materials.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 rounded-xl border border-n-700 bg-n-800/60 p-4"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-700"})`,
                            opacity: 0.15,
                          }}
                        >
                          <Package
                            className="h-5 w-5"
                            style={{
                              color: `var(${rarityColor[item.rarity as keyof typeof rarityColor] ?? "--n-400"})`,
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {item.rarity}
                            </Badge>
                            {item.quantity > 1 && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-n-700 pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowCrafting(!showCrafting)}
                      className="w-full"
                    >
                      <Hammer className="h-4 w-4" />
                      {showCrafting ? "Fechar Forja" : "Abrir Forja"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showCrafting && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <Card className="mt-2">
                          <CardContent className="pt-6">
                            <CraftingPanel materials={categorized.materials as unknown as MaterialItem[]} />
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
