"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getLessonById } from "@/app/actions/admin";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["admin-lesson", id],
    queryFn: () => getLessonById(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-n-800 rounded animate-pulse" />
        <div className="h-64 bg-n-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!lesson || "error" in lesson) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-n-400 mb-4">Lição não encontrada.</p>
        <Button variant="secondary" onClick={() => router.push("/admin/lessons")}>
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const initialData = {
    title: lesson.title,
    description: lesson.description,
    slug: lesson.slug,
    level: lesson.level,
    xpReward: lesson.xpReward,
    manaCost: lesson.manaCost,
    estimatedMin: lesson.estimatedMin,
    order: lesson.order,
    isActive: lesson.isActive,
    contextTags: lesson.contextTags,
    steps: lesson.steps.map((s) => {
      const content = s.content as Record<string, unknown>;
      return {
        id: s.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: s.type.toLowerCase() as any,
        title: (content.title as string) ?? "",
        xpReward: s.xpReward,
        content: content,
      };
    }),
    skillRewards: lesson.skillRewards.map((sr) => ({
      skillId: sr.skillId,
      xpAmount: sr.xpAmount,
    })),
    lootTable: lesson.lootTable?.drops.map((d) => ({
      itemId: d.itemId,
      weight: d.weight,
      minLevel: d.minLevel,
      maxLevel: d.maxLevel,
    })) ?? null,
  };

  return <LessonEditor initialData={initialData} lessonId={id} />;
}
