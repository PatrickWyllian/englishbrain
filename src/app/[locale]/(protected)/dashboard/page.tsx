"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/stores/game-store";
import { useGameSync } from "@/hooks/use-game-sync";
import { DashboardHero } from "@/components/gamification/DashboardHero";
import { NextQuestCard } from "@/components/gamification/NextQuestCard";
import { SkillTreeMini } from "@/components/gamification/SkillTreeMini";
import { LootLog } from "@/components/gamification/LootLog";
import { Button } from "@/components/ui/Button";
import { Zap, Target, Crosshair, Droplet } from "lucide-react";
import { xpIntoLevel } from "@/lib/gamification/xp-curve";
import { getRecommendedLesson } from "@/lib/lesson/data";

function EmptyDashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-bg px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl border border-n-700 bg-n-900 p-8 md:p-12 overflow-hidden text-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
          <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-n-800 border border-n-700 text-4xl">
            🦉
          </div>
          <div className="relative z-10 space-y-3">
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Comece sua Quest
            </h1>
            <p className="text-n-300 max-w-lg mx-auto">
              Escolha seus interesses, faça o placement test e desbloqueie sua
              primeira lição contextualizada.
            </p>
          </div>
          <Button onClick={() => router.push("/onboarding")} size="lg">
            Criar Personagem
          </Button>
        </div>
      </div>
    </main>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function StatBox({ label, value, icon }: StatBoxProps) {
  return (
    <div className="rounded-xl bg-n-900 border border-n-800 p-4">
      <div className="mb-2 text-accent">{icon}</div>
      <div className="text-xs text-n-400">{label}</div>
      <div className="text-xl font-display font-bold tracking-tight mt-0.5 text-foreground">
        {value}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const player = useGameStore((s) => s.player);
  const xpToday = useGameStore((s) => s.xpToday);
  const lessonsCompleted = useGameStore((s) => s.lessonsCompleted);
  const accuracy = useGameStore((s) => s.accuracy);
  const { syncAndMerge } = useGameSync();

  useEffect(() => {
    syncAndMerge();
  }, [syncAndMerge]);

  if (!player) {
    return <EmptyDashboard />;
  }

  const { xp, xpNeeded } = xpIntoLevel(BigInt(player.totalXp));
  const accuracyDisplay = `${accuracy.toFixed(1)}%`;
  const recommendedLesson = getRecommendedLesson(
    player.estimatedLevel ?? "A1",
    player.interests ?? [],
  );

  return (
    <main className="min-h-screen bg-bg px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <DashboardHero player={player} xp={xp} xpNeeded={xpNeeded} />

        <NextQuestCard lesson={recommendedLesson} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox
            label="XP Hoje"
            value={xpToday.toLocaleString("pt-BR")}
            icon={<Zap className="w-5 h-5" />}
          />
          <StatBox
            label="Lições"
            value={lessonsCompleted.toString()}
            icon={<Target className="w-5 h-5" />}
          />
          <StatBox
            label="Precisão"
            value={accuracyDisplay}
            icon={<Crosshair className="w-5 h-5" />}
          />
          <StatBox
            label="Mana"
            value={`${player.mana}/${player.maxMana}`}
            icon={<Droplet className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkillTreeMini />
          <LootLog player={player} />
          <div className="rounded-xl bg-n-900 border border-n-800 p-5">
            <h3 className="font-display font-semibold text-sm text-n-200 mb-4">
              Weekly Quests
            </h3>
            <p className="text-xs text-n-500">
              Quests semanais em construção. Volte em breve!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}