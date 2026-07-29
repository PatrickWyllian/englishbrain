"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Clock } from "lucide-react";
import type { Lesson } from "@/lib/lesson/types";

export function NextQuestCard({ lesson }: { lesson: Lesson }) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative rounded-2xl border border-accent bg-n-900 p-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent pointer-events-none" />
      <div className="relative z-10 space-y-4">
        <span className="text-xs font-display font-semibold text-accent uppercase tracking-widest">
          Próxima Quest
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {lesson.title}
        </h2>
        <p className="text-n-300 max-w-xl">{lesson.description}</p>
        <div className="flex items-center gap-4 text-sm text-n-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-accent" />
            {lesson.xpReward} XP
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent-secondary" />
            {lesson.estimatedMin} min
          </span>
        </div>
        <button
          onClick={() => router.push(`/learn/${lesson.slug}`)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent text-n-950 px-6 py-3 font-display font-semibold text-sm hover:bg-accent-600 transition-colors"
        >
          Iniciar lição
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
