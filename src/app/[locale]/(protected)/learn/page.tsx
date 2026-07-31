"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Zap, Clock, ArrowRight } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { LESSONS, getRecommendedLesson } from "@/lib/lesson/data";
import type { Lesson } from "@/lib/lesson/types";
import { TeacherQuestCard } from "@/components/teacher/TeacherQuestCard";

function LessonCard({
  lesson,
  recommended,
}: {
  lesson: Lesson;
  recommended?: boolean;
}) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        rounded-2xl border p-6 transition-colors cursor-pointer
        ${
          recommended
            ? "bg-accent/5 border-accent"
            : "bg-n-900 border-n-700 hover:border-n-500"
        }
      `}
      onClick={() => router.push(`/learn/${lesson.slug}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-semibold text-accent uppercase tracking-wider">
              {lesson.level}
            </span>
            {recommended && (
              <span className="text-xs font-bold text-n-950 bg-accent px-2 py-0.5 rounded-full">
                Recomendada
              </span>
            )}
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {lesson.title}
          </h3>
          <p className="text-sm text-n-400">{lesson.description}</p>
          <div className="flex items-center gap-4 text-xs text-n-500 pt-2">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-accent" />
              {lesson.xpReward} XP
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent-secondary" />
              {lesson.estimatedMin} min
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-n-500" />
      </div>
    </motion.div>
  );
}

export default function LearnPage() {
  const router = useRouter();
  const player = useGameStore((s) => s.player);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  if (!player) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-n-400">Complete o onboarding para desbloquear as lições.</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent text-n-950 px-6 py-3 font-display font-semibold"
          >
            Começar Onboarding
          </button>
        </div>
      </main>
    );
  }

  const recommended = getRecommendedLesson(player.estimatedLevel, player.interests);

  return (
    <main className="min-h-screen bg-bg px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Quest Log
          </h1>
          <p className="text-n-400">
            Lições contextualizadas nos seus interesses.
          </p>
        </div>

        <div className="rounded-2xl bg-n-900 border border-n-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold text-foreground">
              Próxima recomendada
            </h2>
          </div>
          <LessonCard lesson={recommended} recommended />
        </div>

        <TeacherQuestCard />

        <div className="space-y-4">
          <h2 className="font-display font-semibold text-foreground">
            Todas as lições
          </h2>
          <div className="grid gap-4">
            {LESSONS.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
