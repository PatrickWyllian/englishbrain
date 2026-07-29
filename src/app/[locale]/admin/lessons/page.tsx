"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getLessons, deleteLesson } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

export default function LessonsListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: () => getLessons(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => {
      toast.success("Lição excluída!");
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] });
    },
    onError: () => toast.error("Erro ao excluir lição"),
  });

  const lessonList: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    level: string;
    tags: string[];
    isActive: boolean;
    order: number;
    xpReward: number;
    manaCost: number;
    estimatedMin: number;
    stepCount: number;
    hasSkillRewards: boolean;
    hasLootTable: boolean;
  }> =
    lessons && "error" in lessons
      ? []
      : Array.isArray(lessons)
        ? lessons
        : [];

  const filtered = lessonList.filter((l) => {
    const matchSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchLevel = filterLevel === "all" || l.level === filterLevel;
    return matchSearch && matchLevel;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Lições
          </h1>
          <p className="text-sm text-n-400 mt-1">
            Gerencie todas as lições do sistema.
          </p>
        </div>
        <Button onClick={() => router.push("/admin/lessons/new")}>
          <Plus className="w-4 h-4" />
          Nova Lição
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-500" />
          <Input
            placeholder="Buscar por título ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="h-10 rounded-xl border border-n-700 bg-n-900 px-3 text-sm text-foreground"
        >
          <option value="all">Todos os níveis</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-n-800 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-n-400">
              {search || filterLevel !== "all"
                ? "Nenhuma lição encontrada com esses filtros."
                : "Nenhuma lição criada ainda."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((lesson) => (
            <Card key={lesson.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-foreground truncate">
                        {lesson.title}
                      </h3>
                      <Badge variant={lesson.isActive ? "success" : "secondary"}>
                        {lesson.isActive ? "Ativa" : "Rascunho"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-n-400">
                      <span className="font-display font-semibold text-accent">
                        {lesson.level}
                      </span>
                      <span>{lesson.stepCount} etapas</span>
                      <span>{lesson.xpReward} XP</span>
                      <span>{lesson.estimatedMin} min</span>
                      <div className="flex gap-1">
                        {lesson.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="bg-n-700 text-n-300 px-1.5 py-0.5 rounded text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                        {lesson.tags.length > 3 && (
                          <span className="text-n-500">
                            +{lesson.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admin/lessons/${lesson.id}/edit`)
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (
                          confirm("Tem certeza que deseja excluir esta lição?")
                        ) {
                          deleteMutation.mutate(lesson.id);
                        }
                      }}
                      className="text-n-500 hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
