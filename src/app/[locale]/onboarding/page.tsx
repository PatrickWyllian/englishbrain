"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { useGameStore } from "@/stores/game-store";
import { useGameSync } from "@/hooks/use-game-sync";
import { InterestPicker } from "@/components/onboarding/InterestPicker";
import { PlacementTest } from "@/components/onboarding/PlacementTest";
import { ClassSelect } from "@/components/onboarding/ClassSelect";
import { Mascot } from "@/components/gamification/Mascot";
import type { PlayerClass, CEFRLevel } from "@/types";

const INTEREST_LABELS: Record<string, string> = {
  "the-office": "The Office",
  friends: "Friends",
  "breaking-bad": "Breaking Bad",
  "game-of-thrones": "Game of Thrones",
  "stranger-things": "Stranger Things",
  tech: "Tecnologia",
  business: "Negócios",
  travel: "Viagem",
  gaming: "Games",
  science: "Ciência",
  music: "Música",
  movies: "Filmes",
  cooking: "Culinária",
  fitness: "Fitness",
  finance: "Finanças",
};

const CLASS_NAMES: Record<PlayerClass, string> = {
  WARRIOR: "Guerreiro",
  ROGUE: "Ladino",
  MAGE: "Mago",
  CLERIC: "Clérigo",
};

const stepVariants = {
  initial: { opacity: 0, x: 24, y: 8 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -24, y: -8 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const {
    step,
    interests,
    estimatedLevel,
    playerClass,
    setInterests,
    setEstimatedLevel,
    setClass,
    nextStep,
    prevStep,
    complete,
    reset,
  } = useOnboardingStore();

  const createPlayer = useGameStore((s) => s.createPlayer);
  const { syncToDb } = useGameSync();

  const handlePlacementComplete = (
    _answers: {
      question: {
        id: string;
        level: CEFRLevel;
        type: "vocab" | "grammar";
        instruction: string;
        prompt: string;
        options: string[];
        correctOption: number;
      };
      correct: boolean;
    }[],
    level: CEFRLevel
  ) => {
    setEstimatedLevel(level);
    nextStep();
  };

  const handlePlacementSkip = () => {
    setEstimatedLevel("A1");
    nextStep();
  };

  const handleFinish = () => {
    if (!playerClass || interests.length < 3) return;
    createPlayer({
      name: "Aventureiro",
      playerClass,
      interests,
      estimatedLevel,
    });
    syncToDb({ class: playerClass, interests });
    complete();
    router.push("/dashboard");
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-foreground py-10 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header / progress */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={step === 0 ? () => router.push("/") : prevStep}
            className="text-sm text-n-400 hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Voltar" : "Anterior"}
          </button>
          <div className="flex-1 mx-6">
            <div className="h-2 bg-n-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / 5) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-n-500">
            {step + 1}/5
          </span>
        </div>

        <AnimatePresence mode="wait">
          {mounted && step === 0 && (
              <motion.div
                key="welcome"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-n-800 border border-n-700 mx-auto">
                  <Mascot pose="idle" size={64} />
                </div>

              <div className="space-y-3">
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                  Bem-vindo à <span className="text-accent">EnglishQuest</span>
                </h1>
                <p className="text-n-300 max-w-lg mx-auto text-lg leading-relaxed">
                  Vamos montar sua jornada personalizada em poucos passos.
                  Escolha seus interesses, descubra seu nível e defina sua classe.
                </p>
              </div>

              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-accent text-n-950 px-8 py-4 font-display font-semibold text-lg hover:bg-accent-600 transition-colors"
              >
                Começar
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="interests"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <InterestPicker selected={interests} onChange={setInterests} />
              <div className="pt-2">
                <button
                  onClick={nextStep}
                  disabled={interests.length < 3}
                  className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 font-display font-semibold text-lg transition-colors ${
                    interests.length >= 3
                      ? "bg-accent text-n-950 hover:bg-accent-600"
                      : "bg-n-800 text-n-500 cursor-not-allowed"
                  }`}
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="placement"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <PlacementTest
                onComplete={handlePlacementComplete}
                onCancel={handlePlacementSkip}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="class"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <ClassSelect
                selected={playerClass}
                onChange={setClass}
              />
              <div className="pt-2">
                <button
                  onClick={nextStep}
                  disabled={!playerClass}
                  className={`inline-flex items-center gap-2 rounded-xl px-8 py-4 font-display font-semibold text-lg transition-colors ${
                    playerClass
                      ? "bg-accent text-n-950 hover:bg-accent-600"
                      : "bg-n-800 text-n-500 cursor-not-allowed"
                  }`}
                >
                  Revisar
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="summary"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="font-display text-3xl font-bold tracking-tight">
                  Seu perfil está pronto
                </h2>
                <p className="text-n-400 max-w-lg">
                  Confira como será sua jornada inicial. Você pode refazer o onboarding a qualquer momento.
                </p>
              </div>

              <div className="rounded-2xl bg-n-900 border border-n-700 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Mascot pose="celebrate" size={48} />
                  </div>
                  <div>
                    <p className="text-sm text-n-400">Classe selecionada</p>
                    <p className="font-display text-2xl font-bold">
                      {playerClass ? CLASS_NAMES[playerClass] : "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-n-800/50 border border-n-700 p-4">
                    <p className="text-xs text-n-400 uppercase tracking-wider font-semibold">
                      Nível estimado
                    </p>
                    <p className="font-display text-2xl font-bold text-accent mt-1">
                      {estimatedLevel}
                    </p>
                  </div>
                  <div className="rounded-xl bg-n-800/50 border border-n-700 p-4">
                    <p className="text-xs text-n-400 uppercase tracking-wider font-semibold">
                      Interesses
                    </p>
                    <p className="font-display text-2xl font-bold text-accent mt-1">
                      {interests.length}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-n-400 mb-3">Seus temas</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center rounded-lg bg-n-800 border border-n-700 px-3 py-1.5 text-sm text-n-200"
                      >
                        {INTEREST_LABELS[id] ?? id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleFinish}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-n-950 px-8 py-4 font-display font-semibold text-lg hover:bg-accent-600 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Ir para Dashboard
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-n-800 text-n-200 px-8 py-4 font-display font-semibold text-lg border border-n-700 hover:border-n-500 transition-colors"
                >
                  Refazer onboarding
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
