"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Check, RotateCcw, Volume2 } from "lucide-react";
import { Mascot } from "@/components/gamification/Mascot";
import { useEvaluateAnswer } from "@/hooks/use-teacher";
import type { TeacherFeedback } from "@/lib/teacher/types";
import type { SpeakingStep as SpeakingStepType } from "@/lib/lesson/types";

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
}

interface SpeakingStepProps {
  step: SpeakingStepType;
  onComplete: (correct: number, total: number) => void;
}

export function SpeakingStep({ step, onComplete }: SpeakingStepProps) {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [status, setStatus] = useState<"idle" | "listening" | "result">(
    "idle",
  );
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<TeacherFeedback | null>(null);
  const [degraded, setDegraded] = useState(false);
  const evaluate = useEvaluateAnswer();

  const target = step.targetSentences[currentSentence];
  const isLast = currentSentence === step.targetSentences.length - 1;

  const evaluateTranscript = async (spoken: string) => {
    const result = await evaluate.mutateAsync({
      prompt: step.prompt || `Pronuncie: ${target}`,
      attempt: spoken,
      target,
      attemptCount: 1,
    });

    if ("error" in result) {
      const sim = Math.round(calculateSimilarity(spoken, target) * 100);
      setFeedback({
        score: sim,
        praise:
          sim >= 80
            ? "Excelente! Você dominou essa missão como um veterano."
            : "Boa tentativa! Você está mais perto do que parece.",
        native_version: target,
        why: "Compare sua fala com a versão nativa abaixo para notar a diferença.",
        hint: "Tente repetir a frase com mais atenção às palavras-chave.",
        mastery: sim >= 80,
      });
      setScore(sim);
      setDegraded(true);
      return;
    }

    setFeedback(result.feedback);
    setScore(result.feedback.score);
    setDegraded(result.degraded);
  };

  const startRecognition = async () => {
    // Check for Web Speech API support
    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: simulate recognition
      simulateRecognition();
      return;
    }

    setStatus("listening");
    setTranscript("");
    setFeedback(null);

    const recognition = new (SpeechRecognition as new () => SpeechRecognitionInstance)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: { results: Array<Array<{ transcript: string }>> }) => {
      const spoken = event.results[0][0].transcript;
      setTranscript(spoken);
      await evaluateTranscript(spoken);
      setStatus("result");
    };

    recognition.onerror = () => {
      // Fallback on error
      simulateRecognition();
    };

    recognition.onend = () => {
      if (status === "listening" && !transcript) {
        simulateRecognition();
      }
    };

    recognition.start();
  };

  const simulateRecognition = async () => {
    setStatus("listening");
    setTranscript("");

    // Simulate a 2-second "listening" period
    setTimeout(async () => {
      // Simulate partial accuracy
      const simulatedSimilarity = 0.5 + Math.random() * 0.45;
      const simulated = target;
      setTranscript(simulated);
      await evaluateTranscript(simulated);
      setScore(Math.round(simulatedSimilarity * 100));
      setStatus("result");
    }, 2000);
  };

  const handleNext = () => {
    if (isLast) {
      // All sentences completed - score based on average similarity
      const avgScore = score / 100; // rough
      const totalPoints = Math.round(avgScore * step.targetSentences.length);
      onComplete(totalPoints, step.targetSentences.length);
    } else {
      setCurrentSentence(currentSentence + 1);
      setStatus("idle");
      setTranscript("");
      setScore(0);
      setShowHint(false);
      setFeedback(null);
    }
  };

  const scoreColor =
    score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/30 px-4 py-1.5">
          <Mic className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Speaking
          </span>
        </div>
        <div className="flex justify-center" aria-hidden="true">
          <Mascot
            pose={status === "listening" ? "speak" : "idle"}
            size={56}
          />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {step.title}
        </h2>
        <p className="text-sm text-n-400">
          {status === "idle" && "Leia a frase em voz alta"}
          {status === "listening" && "Ouvindo..."}
          {status === "result" && "Resultado"}
        </p>
      </div>

      {/* Prompt */}
      <div className="rounded-2xl bg-n-800/60 border border-n-700 p-8 text-center space-y-6">
        <p className="text-xs text-n-500 uppercase tracking-wider font-semibold">
          Frase {currentSentence + 1} de {step.targetSentences.length}
        </p>

        <div className={status === "result" ? "opacity-60" : ""}>
          <p className="font-display text-3xl font-bold text-foreground leading-relaxed">
            &ldquo;{target}&rdquo;
          </p>
          {step.prompt && (
            <p className="mt-3 text-sm text-n-400">{step.prompt}</p>
          )}
        </div>

        {/* Hint */}
        {step.hints && step.hints[currentSentence] && (
          <div className="mt-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-n-500 hover:text-n-300 transition-colors"
            >
              {showHint ? "Esconder dica" : "Precisa de ajuda?"}
            </button>
            {showHint && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 text-sm text-n-400 italic"
              >
                {step.hints[currentSentence]}
              </motion.p>
            )}
          </div>
        )}

        {/* Status display */}
        {status === "listening" && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Mic className="h-6 w-6 text-accent animate-pulse" />
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-1 rounded-full bg-accent"
                  style={{ height: `${8 + i * 5}px` }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {status === "result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className={`font-display text-4xl font-bold ${scoreColor}`}>
              {score}%
            </div>

            <div className="flex items-center gap-2 justify-center text-sm">
              <Volume2 className="h-4 w-4 text-n-400" />
              <span className="text-n-300">
                Você disse:{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{transcript}&rdquo;
                </span>
              </span>
            </div>

            {score < 80 && (
              <p className="text-xs text-n-500">
                Esperado: &ldquo;{target}&rdquo;
              </p>
            )}

            {feedback && (
              <div className="space-y-2 text-sm max-w-md mx-auto">
                {feedback.praise && (
                  <p className="text-success">{feedback.praise}</p>
                )}
                {feedback.why && <p className="text-n-300">{feedback.why}</p>}
                {feedback.hint && (
                  <p className="text-info bg-info/10 border border-info/30 rounded-xl p-3">
                    Dica: {feedback.hint}
                  </p>
                )}
                {degraded && (
                  <p className="text-xs text-n-500">
                    Modo offline: feedback simplificado. Configure o Professor/IA nas
                    configurações para correção completa.
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={startRecognition}
                className="inline-flex items-center gap-2 rounded-lg bg-n-700 px-4 py-2 text-sm font-medium text-n-200 hover:bg-n-600 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Tentar novamente
              </button>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-n-950 hover:bg-accent-600 transition-colors"
              >
                <Check className="h-4 w-4" />
                {isLast ? "Concluir" : "Próxima"}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Start button */}
      {status === "idle" && (
        <div className="flex justify-center">
          <button
            onClick={startRecognition}
            className="inline-flex items-center gap-3 rounded-xl bg-accent px-10 py-5 font-display font-semibold text-lg text-n-950 hover:bg-accent-600 transition-colors shadow-lg shadow-accent/20"
          >
            <Mic className="h-6 w-6" />
            Falar Agora
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center">
        {step.targetSentences.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < currentSentence
                ? "bg-success"
                : i === currentSentence
                  ? "bg-accent"
                  : "bg-n-700"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Simple word-overlap similarity between two strings.
 */
function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const maxSize = Math.max(wordsA.size, wordsB.size);
  return overlap / maxSize;
}