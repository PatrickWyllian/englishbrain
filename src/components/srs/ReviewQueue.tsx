"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Zap, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { sm2Grade, type SrsState } from "@/lib/srs/sm2";
import { getLessonCards, type LessonCard } from "@/lib/lesson/srs-storage";
import { useGradeCard, useSrsCards } from "@/hooks/use-srs";
import { upsertSrsCard } from "@/app/actions/srs";

interface ReviewCard {
  word: string;
  translation: string;
  context?: string;
  tags: string[];
  srs: SrsState;
  contentId?: string;
  contentType?: string;
}

const GRADE_LABELS = [
  { label: "Difícil", key: "again", shortcut: "1" },
  { label: "Médio", key: "hard", shortcut: "2" },
  { label: "Bom", key: "good", shortcut: "3" },
  { label: "Fácil", key: "easy", shortcut: "4" },
] as const;

const GRADE_COLORS: Record<string, string> = {
  again: "bg-error/10 border-error/30 text-error",
  hard: "bg-warning/10 border-warning/30 text-warning",
  good: "bg-success/10 border-success/30 text-success",
  easy: "bg-info/10 border-info/30 text-info",
};

export function ReviewQueue() {
  const router = useRouter();
  const { data: serverCards } = useSrsCards();
  const gradeMutation = useGradeCard();

  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { dueCount, learningCount, matureCount } = useMemo(() => {
    const now = new Date();
    const due = cards.filter((c) => {
      const d = c.srs?.dueDate ? new Date(c.srs.dueDate) : new Date(0);
      return d <= now;
    }).length;
    const learning = cards.filter((c) => (c.srs?.repetitions ?? 0) > 0 && (c.srs?.interval ?? 0) < 21).length;
    const mature = cards.filter((c) => (c.srs?.interval ?? 0) >= 21).length;
    return { dueCount: due, learningCount: learning, matureCount: mature };
  }, [cards]);

  useEffect(() => {
    const lessonCards = getLessonCards();
    const now = new Date();

    const serverMapped: ReviewCard[] = (serverCards ?? []).map((card) => ({
      word: card.contentId,
      translation: card.contentId,
      tags: [],
      srs: {
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        dueDate: new Date(card.dueDate),
      },
      contentId: card.contentId,
      contentType: card.contentType,
    }));

    const localMapped: ReviewCard[] = lessonCards.map((card: LessonCard) => ({
      word: card.word,
      translation: card.translation,
      context: card.context,
      tags: card.tags,
      srs: card.srs,
    }));

    const allCards = [...serverMapped, ...localMapped.filter(
      lc => !serverMapped.some(sc => sc.contentId === `${lc.word}::${lc.translation}`)
    )];

    if (allCards.length === 0) {
      const raf = requestAnimationFrame(() => setIsComplete(true));
      return () => cancelAnimationFrame(raf);
    }

    const sorted = [...allCards].sort((a, b) => {
      const aDue = a.srs?.dueDate ? new Date(a.srs.dueDate) : new Date(0);
      const bDue = b.srs?.dueDate ? new Date(b.srs.dueDate) : new Date(0);
      const aOverdue = aDue <= now ? -1 : 1;
      const bOverdue = bDue <= now ? -1 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return aDue.getTime() - bDue.getTime();
    });

    const raf = requestAnimationFrame(() => setCards(sorted));
    return () => cancelAnimationFrame(raf);
  }, [serverCards]);

  const handleGrade = useCallback(
    (grade: 0 | 1 | 2 | 3) => {
      const currentCard = cards[currentIdx];
      if (!currentCard) return;

      const oldState = currentCard.srs;
      const newState = sm2Grade(oldState, grade);

      if (currentCard.contentId && currentCard.contentType) {
        gradeMutation.mutate({
          contentId: currentCard.contentId,
          contentType: currentCard.contentType,
          grade,
        });
      } else {
        const contentId = `${currentCard.word}::${currentCard.translation}`;
        upsertSrsCard(contentId, "VOCAB", grade).catch(() => {});
      }

      const updated = [...cards];
      updated[currentIdx] = { ...currentCard, srs: newState };

      if (currentIdx < cards.length - 1) {
        setTimeout(() => {
          setCards(updated);
          setCurrentIdx(currentIdx + 1);
          setIsFlipped(false);
        }, 400);
      } else {
        setCards(updated);
      }
    },
    [cards, currentIdx, gradeMutation],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isFlipped) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setIsFlipped(true);
        }
        return;
      }
      switch (e.key) {
        case "1": handleGrade(0); break;
        case "2": handleGrade(1); break;
        case "3": handleGrade(2); break;
        case "4": handleGrade(3); break;
        case " ": e.preventDefault(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFlipped, handleGrade]);

  const currentCard = cards[currentIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg p-2 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-5 text-center">
          <div>
            <div className="font-mono text-lg font-bold text-accent">
              {dueCount}
            </div>
            <div className="text-[10px] text-n-500 uppercase tracking-wider">
              Hoje
            </div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-accent-secondary">
              {learningCount}
            </div>
            <div className="text-[10px] text-n-500 uppercase tracking-wider">
              Aprendendo
            </div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-success">
              {matureCount}
            </div>
            <div className="text-[10px] text-n-500 uppercase tracking-wider">
              Dominadas
            </div>
          </div>
        </div>
      </div>

      {!isComplete && cards.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-n-400 font-mono">
            {currentIdx + 1} de {cards.length}
          </p>
          <div className="mt-2 h-1 rounded-full bg-n-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
              animate={{
                width: `${((currentIdx) / cards.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isComplete && currentCard ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div
              onClick={() => !isFlipped && setIsFlipped(true)}
              className={`relative cursor-pointer select-none rounded-2xl border transition-all duration-500 ${
                isFlipped
                  ? "border-n-600 bg-n-800/60"
                  : "border-n-700 bg-n-800/60 hover:border-accent/30"
              }`}
              style={{ perspective: "1000px" }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative min-h-[280px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-8"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <p className="text-xs text-n-500 uppercase tracking-wider mb-6">
                    Pressione para revelar
                  </p>
                  <p className="font-display text-4xl md:text-5xl font-bold text-foreground text-center leading-tight">
                    {currentCard.word}
                  </p>
                  {currentCard.context && (
                    <p className="mt-6 text-sm text-n-500 italic text-center max-w-md">
                      &ldquo;{currentCard.context}&rdquo;
                    </p>
                  )}
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {currentCard.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-n-700 px-2 py-0.5 text-[10px] text-n-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="absolute inset-0 flex flex-col items-center justify-center p-8"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/30 px-4 py-1.5 mb-6">
                    <BookOpen className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                      Resposta
                    </span>
                  </div>
                  <p className="font-display text-3xl md:text-4xl font-bold text-accent text-center">
                    {currentCard.translation}
                  </p>
                  <p className="mt-4 text-lg text-n-300">
                    {currentCard.word}
                  </p>
                </div>
              </motion.div>
            </div>

            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-3"
              >
                {GRADE_LABELS.map(({ label, key, shortcut }) => (
                  <button
                    key={key}
                    onClick={() =>
                      handleGrade(
                        key === "again" ? 0 : key === "hard" ? 1 : key === "good" ? 2 : 3,
                      )
                    }
                    className={`flex flex-col items-center gap-1 rounded-xl border p-4 transition-all hover:scale-105 active:scale-95 ${GRADE_COLORS[key]}`}
                  >
                    <span className="font-display text-lg font-bold">
                      {label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                      {shortcut}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-n-800 border border-n-700">
              {cards.length > 0 ? (
                <Sparkles className="h-10 w-10 text-accent" />
              ) : (
                <Zap className="h-10 w-10 text-n-500" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {cards.length > 0 ? "Revisão completa!" : "Nada para revisar"}
              </h2>
              <p className="text-n-400 max-w-sm mx-auto">
                {cards.length > 0
                  ? `Você revisou ${cards.length} cartas. Continue praticando para fixar o conteúdo.`
                  : "Complete lições para adicionar cartas de vocabulário à sua fila de revisão."}
              </p>
            </div>

            <button
              onClick={() => router.push("/learn")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-display font-semibold text-n-950 hover:bg-accent-600 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              {cards.length > 0 ? "Revisar novamente" : "Fazer uma lição"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isFlipped && !isComplete && (
        <p className="text-center text-[10px] text-n-600">
          Teclas 1-4 para avaliar · Espaço vira a carta
        </p>
      )}
    </div>
  );
}
