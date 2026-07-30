"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <main className="flex-1 p-4 md:p-8 pb-20 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg p-2 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-n-400">Configure seu jogo</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-n-800 border border-n-700">
            <Settings className="h-10 w-10 text-info" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Em construção
            </h2>
            <p className="text-n-400 max-w-sm mx-auto">
              Em breve: tema claro/escuro, idioma, notificações, conta. Deixe do seu jeito.
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")} size="lg">
            Voltar ao Dashboard
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}