"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilePen, RotateCcw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { WritingStep as WritingStepType } from "@/lib/lesson/types";
import { useEvaluateAnswer } from "@/hooks/use-teacher";
import type { TeacherFeedback } from "@/lib/teacher/types";

interface WritingStepProps {
  step: WritingStepType;
  onComplete: (correct: number, total: number) => void;
}

function calculateSimilarity(a: string, b: string): number {
  const wordsA = a.toLowerCase().trim().split(/\s+/);
  const wordsB = b.toLowerCase().trim().split(/\s+/);
  if (wordsA.length === 0 && wordsB.length === 0) return 1;
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let overlap = 0;
  for (const w of setA) {
    if (setB.has(w)) overlap++;
  }
  const maxSize = Math.max(setA.size, setB.size);
  return overlap / maxSize;
}

function localFallback(
  attempt: string,
  target: string,
): TeacherFeedback {
  const sim = calculateSimilarity(attempt, target);
  const score = Math.round(sim * 100);
  const mastery = score >= 80;
  return {
    score,
    praise: mastery
      ? "Excelente! Você dominou essa missão como um veterano."
      : "Boa tentativa! Você está mais perto do que parece.",
    native_version: target,
    why:
      "Compare sua resposta com a versão nativa abaixo para notar a diferença.",
    hint: "Tente reformular focando nas palavras-chave da frase nativa.",
    mastery,
  };
}

function getScoreColor(score: number): { bg: string; text: string; icon: React.ReactNode } {
  if (score >= 80) {
    return {
      bg: "bg-success/10 border-success/30",
      text: "text-success",
      icon: <CheckCircle className="h-4 w-4" />,
    };
  }
  if (score >= 50) {
    return {
      bg: "bg-warning/10 border-warning/30",
      text: "text-warning",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }
  return {
    bg: "bg-error/10 border-error/30",
    text: "text-error",
    icon: <XCircle className="h-4 w-4" />,
  };
}

export function WritingStep({ step, onComplete }: WritingStepProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<TeacherFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const evaluate = useEvaluateAnswer();

  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentIdx, submitted]);

  const target = step.targetSentences[currentIdx];
  const isLast = currentIdx === step.targetSentences.length - 1;

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    setSubmitting(true);
    const result = await evaluate.mutateAsync({
      prompt: step.prompt,
      attempt: userInput,
      target,
      attemptCount: scores.length + 1,
    });
    setSubmitting(false);

    const fb =
      "error" in result
        ? localFallback(userInput, target)
        : result.feedback;

    setFeedback(fb);
    setScore(fb.score);
    setScores((prev) => [...prev, fb.score]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (isLast) {
      const totalCorrect = scores.filter((s) => s >= 70).length;
      onComplete(totalCorrect, step.targetSentences.length);
    } else {
      setCurrentIdx(currentIdx + 1);
      setUserInput("");
      setSubmitted(false);
      setScore(null);
      setShowHint(false);
      setFeedback(null);
    }
  };

  const handleRetry = () => {
    setUserInput("");
    setSubmitted(false);
    setScore(null);
    setScores((prev) => prev.slice(0, -1));
    setFeedback(null);
  };

  const color = score !== null ? getScoreColor(score) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue/10 border border-blue/30 px-4 py-1.5">
          <FilePen className="h-4 w-4 text-blue" />
          <span className="text-xs font-semibold text-blue uppercase tracking-wider">
            Writing
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {step.title}
        </h2>
        <p className="text-sm text-n-400">
          {submitted ? "Resultado" : `Frase ${currentIdx + 1} de ${step.targetSentences.length}`}
        </p>
      </div>

      {/* Prompt */}
      <div className="rounded-2xl bg-n-800/60 border border-n-700 p-6">
        <p className="text-xs text-n-500 uppercase tracking-wider font-semibold mb-3">
          Prompt
        </p>
        <p className="text-n-300 leading-relaxed">{step.prompt}</p>
      </div>

      {/* Target sentence (shown after submit) */}
      <AnimatePresence mode="wait">
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl bg-n-900/60 border border-n-700 p-4"
          >
            <p className="text-xs text-n-500 uppercase tracking-wider font-semibold mb-2">
              Frase alvo
            </p>
            <p className="font-mono text-sm text-n-200 leading-relaxed">{target}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="rounded-2xl border p-4 transition-colors" style={{
        borderColor: color ? color.text : "var(--n-600)",
        backgroundColor: color ? color.bg.replace("bg-", "").replace("border-", "") : "var(--n-800/60)",
      }}>
        {!submitted ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-n-500 uppercase tracking-wider font-semibold">
                Sua resposta
              </p>
              {step.hints && step.hints[currentIdx] && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="ml-auto text-xs text-n-500 hover:text-n-300 transition-colors"
                >
                  {showHint ? "Esconder dica" : "Precisa de ajuda?"}
                </button>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="w-full min-h-[100px] bg-transparent resize-none text-n-100 placeholder-n-500 focus:outline-none font-mono text-base leading-relaxed"
              placeholder="Escreva a frase aqui... (Enter para enviar)"
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim() || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue px-6 py-2.5 font-semibold text-n-950 hover:bg-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                {submitting ? "Corrigindo..." : "Enviar"}
              </button>
            </div>

            {showHint && step.hints && step.hints[currentIdx] && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 text-sm text-n-400 italic"
              >
                Dica: {step.hints[currentIdx]}
              </motion.p>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3" style={{ borderColor: color?.text }}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: color?.bg.replace("bg-", "").replace("/10", "/20") }}>
                {color?.icon}
              </div>
              <div>
                <p className="font-display text-xl font-bold" style={{ color: color?.text }}>
                  {score ?? 0}%
                </p>
                <p className="text-xs text-n-500">
                  {score !== null ? (score >= 80 ? "Excelente!" : score >= 50 ? "Bom esforço, tente melhorar" : "Continue praticando") : "Aguardando envio..."}
                </p>
              </div>
            </div>

            {feedback && (
              <div className="space-y-3 text-sm">
                {feedback.praise && (
                  <p className="text-success">{feedback.praise}</p>
                )}
                {feedback.why && <p className="text-n-300">{feedback.why}</p>}
                {feedback.hint && (
                  <p className="text-info bg-info/10 border border-info/30 rounded-xl p-3">
                    Dica: {feedback.hint}
                  </p>
                )}
                {evaluate.data && "degraded" in evaluate.data && evaluate.data.degraded && (
                  <p className="text-xs text-n-500">
                    Modo offline: feedback simplificado. Configure o Professor/IA nas
                    configurações para correção completa.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-n-700 px-6 py-2.5 font-semibold text-n-200 hover:bg-n-600 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Tentar novamente
              </button>
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue px-6 py-2.5 font-semibold text-n-950 hover:bg-blue/80 transition-colors"
              >
                {isLast ? "Concluir" : "Próxima"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {step.targetSentences.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < currentIdx
                ? scores[i] >= 70
                  ? "bg-success"
                  : "bg-error"
                : i === currentIdx
                  ? "bg-blue"
                  : "bg-n-700"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}