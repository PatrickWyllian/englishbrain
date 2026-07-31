"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Zap, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Textarea } from "@/components/ui/Input";
import {
  useActiveTeacherQuest,
  useGenerateTeacherQuest,
  useSubmitTeacherQuest,
} from "@/hooks/use-teacher";

function scoreColor(score: number) {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-warning";
  return "bg-error";
}

export function TeacherQuestCard() {
  const { data: quest, isLoading } = useActiveTeacherQuest();
  const generate = useGenerateTeacherQuest();
  const submit = useSubmitTeacherQuest();

  const [attempt, setAttempt] = useState("");
  const [showHint, setShowHint] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-n-700 bg-n-900 p-6 animate-pulse space-y-3">
        <div className="h-5 w-48 bg-n-700 rounded" />
        <div className="h-3 w-full bg-n-700 rounded" />
        <div className="h-3 w-3/4 bg-n-700 rounded" />
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h2 className="font-display font-semibold text-foreground">
                Missão do Professor
              </h2>
            </div>
            <p className="text-sm text-n-400">
              Uma quest gerada sob medida pelo Mestre-Coruja, no seu universo favorito.
            </p>
          </div>
        </div>
        <Button
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          size="lg"
        >
          <Wand2 className="w-4 h-4" />
          {generate.isPending ? "Gerando missão..." : "Gerar nova missão"}
        </Button>
        {generate.isError && (
          <p className="mt-3 text-sm text-error">
            {generate.error?.message ?? "Falha ao gerar missão. Tente novamente."}
          </p>
        )}
        {generate.data?.error && (
          <p className="mt-3 text-sm text-error">{generate.data.error}</p>
        )}
      </div>
    );
  }

  const feedback = submit.data?.feedback;

  return (
    <div className="rounded-2xl border border-accent/40 bg-n-900 p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="font-display font-semibold text-foreground">
            Missão do Professor
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{quest.cefrLevel}</Badge>
          <Badge variant="secondary">{quest.theme}</Badge>
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-display text-xl font-bold text-foreground">
          {quest.questTitle}
        </h3>
        <p className="text-sm text-n-300 italic">{quest.narrativeHook}</p>
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="default">{quest.newStructure}</Badge>
          <span className="flex items-center gap-1 text-xs text-accent">
            <Zap className="w-3.5 h-3.5" /> {quest.xpBase} XP
          </span>
        </div>
      </div>

      <p className="text-sm text-foreground bg-bg border border-n-700 rounded-xl p-4">
        {quest.challengePrompt}
      </p>

      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <Textarea
              label="Sua resposta"
              placeholder="Escreva sua resposta em inglês aqui..."
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              disabled={submit.isPending}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => submit.mutate({ questId: quest.id, attempt })}
                disabled={submit.isPending || attempt.trim().length === 0}
              >
                {submit.isPending ? "Corrigindo..." : "Entregar missão"}
              </Button>
              <button
                onClick={() => setShowHint((v) => !v)}
                className="inline-flex items-center gap-1 text-sm text-info hover:text-info/80"
              >
                {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Dica
              </button>
            </div>
            {showHint && quest.hintProgressive.length > 0 && (
              <p className="text-sm text-info bg-info/10 border border-info/30 rounded-xl p-3">
                {quest.hintProgressive[0]}
              </p>
            )}
            {submit.isError && (
              <p className="text-sm text-error">
                {submit.error?.message ?? "Falha ao corrigir. Tente novamente."}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-n-300">Pontuação</span>
                <span className="font-display text-2xl font-bold text-foreground">
                  {feedback.score}
                </span>
              </div>
              <Progress value={feedback.score} indicatorColor={scoreColor(feedback.score)} />
            </div>

            <div className="space-y-3">
              {feedback.praise && (
                <p className="text-sm text-success">{feedback.praise}</p>
              )}
              {feedback.native_version && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-n-500">
                    Versão nativa
                  </p>
                  <p className="text-sm text-foreground bg-bg border border-n-700 rounded-xl p-3">
                    {feedback.native_version}
                  </p>
                </div>
              )}
              {feedback.why && (
                <p className="text-sm text-n-300">{feedback.why}</p>
              )}
              {feedback.hint && (
                <p className="text-sm text-info bg-info/10 border border-info/30 rounded-xl p-3">
                  💡 {feedback.hint}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {submit.data?.passed && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Missão concluída! +{submit.data.xpAwarded} XP
                </span>
              )}
              {!submit.data?.passed && (
                <Button
                  variant="secondary"
                  onClick={() => submit.reset()}
                  disabled={submit.isPending}
                >
                  Tentar novamente
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => generate.mutate()}
                disabled={generate.isPending}
              >
                <Wand2 className="w-4 h-4" />
                {generate.isPending ? "Gerando..." : "Nova missão"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
