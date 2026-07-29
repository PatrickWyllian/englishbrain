"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAdminStats } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Users,
  Activity,
  Plus,
  List,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(),
  });

  const statCards = [
    {
      label: "Total de Lições",
      value: stats && "totalLessons" in stats ? stats.totalLessons : "—",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      label: "Total de Usuários",
      value: stats && "totalUsers" in stats ? stats.totalUsers : "—",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Ativos (7 dias)",
      value: stats && "activeUsers" in stats ? stats.activeUsers : "—",
      icon: <Activity className="w-5 h-5" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Painel Admin
        </h1>
        <p className="text-n-400">
          Visão geral do sistema EnglishQuest.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-n-400">{s.label}</p>
                  <p className="text-2xl font-display font-bold text-foreground mt-1">
                    {isLoading ? (
                      <span className="inline-block w-12 h-6 bg-n-700 rounded animate-pulse" />
                    ) : (
                      s.value
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                  {s.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => router.push("/admin/lessons/new")}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Lição
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/lessons")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            Gerenciar Lições
          </Button>
        </div>
      </div>
    </div>
  );
}
