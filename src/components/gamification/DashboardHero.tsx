"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Sparkles } from "lucide-react";
import { XPBar } from "./XPBar";
import { StreakFlame } from "./StreakFlame";
import { Mascot } from "./Mascot";
import type { PlayerProfile } from "@/types";

const CLASS_NAMES: Record<string, string> = {
  WARRIOR: "Guerreiro",
  ROGUE: "Ladino",
  MAGE: "Mago",
  CLERIC: "Clérigo",
};

const CLASS_ICONS: Record<string, string> = {
  WARRIOR: "⚔️",
  ROGUE: "🗡️",
  MAGE: "🔮",
  CLERIC: "✨",
};

interface DashboardHeroProps {
  player: PlayerProfile;
  xp: bigint;
  xpNeeded: bigint;
  equippedFrame?: {
    icon: string;
    rarity: string;
  } | null;
}

export function DashboardHero({
  player,
  xp,
  xpNeeded,
  equippedFrame,
}: DashboardHeroProps) {
  return (
    <div className="rounded-2xl border border-n-700 bg-n-900 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative flex-shrink-0">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-n-600">
              <AvatarImage src={player.interestsName} alt={player.name} />
              <AvatarFallback className="text-3xl bg-n-800">
                {CLASS_ICONS[player.class] ?? "🦉"}
              </AvatarFallback>
            </Avatar>

            <div className="absolute -bottom-1 -right-1">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-n-900 font-display font-bold text-sm border-2 border-n-900">
                {player.level}
              </div>
            </div>

            <div className="absolute -top-1 -right-1">
              <StreakFlame streak={player.streak} />
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <Mascot pose="idle" size={48} />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-display font-semibold text-n-400 uppercase tracking-wider">
                {CLASS_NAMES[player.class] ?? player.class}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {player.name}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-accent-secondary">
              <Sparkles className="w-5 h-5" />
              <span className="font-mono font-semibold text-lg tabular-nums">
                {player.mana}
              </span>
              <span className="text-n-500 text-sm">/ {player.maxMana}</span>
            </div>
          </div>

          <XPBar variant="horizontal" xp={xp} xpNeeded={xpNeeded} level={player.level} />

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              {player.estimatedLevel}
            </Badge>
            {equippedFrame && (
              <Badge variant="outline" className="text-xs gap-1">
                <span>{equippedFrame.icon}</span>
                <span className="capitalize">{equippedFrame.rarity}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
