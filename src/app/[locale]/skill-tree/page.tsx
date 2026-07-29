"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { SkillTree } from "@/components/gamification/SkillTreeFull";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function SkillTreePage() {
  const router = useRouter();
  const player = useGameStore((s) => s.player);

  if (!player) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Sparkles className="mx-auto h-12 w-12 text-n-500" />
          <p className="text-n-400">
            Crie seu personagem para ver a Skill Tree.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg p-2 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Skill Tree
          </h1>
          <p className="text-sm text-n-400">
            Desbloqueie novas habilidades gastando XP
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Árvore de Habilidades</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillTree />
        </CardContent>
      </Card>
    </main>
  );
}