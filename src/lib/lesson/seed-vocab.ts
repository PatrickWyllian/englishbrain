/**
 * Seed vocabulary pool for placement test results.
 *
 * After the placement test converges on a CEFR level, we pre-populate the SRS
 * review queue with a small batch of common, useful English words tagged
 * `placement`. Translations are in pt-BR (DESIGN.md §1 — pt-BR default locale).
 *
 * Words are intentionally short (6-8 per level) so the very first review session
 * is fast and gives the user an early dopamine hit (DESIGN.md §8.2 — progressão
 * visceral > completude de features).
 */

import type { CEFRLevel } from "@/types";

export interface SeedVocabItem {
  word: string;
  translation: string;
  context?: string;
}

const SEED_VOCAB: Record<Exclude<CEFRLevel, "C2">, SeedVocabItem[]> = {
  A1: [
    { word: "hello", translation: "olá" },
    { word: "goodbye", translation: "tchau" },
    { word: "thank you", translation: "obrigado" },
    { word: "please", translation: "por favor" },
    { word: "sorry", translation: "desculpa" },
    { word: "yes", translation: "sim" },
    { word: "no", translation: "não" },
    { word: "help", translation: "ajuda" },
  ],
  A2: [
    { word: "family", translation: "família" },
    { word: "weekend", translation: "fim de semana" },
    { word: "breakfast", translation: "café da manhã" },
    { word: "weather", translation: "clima" },
    { word: "schedule", translation: "agenda" },
    { word: "appointment", translation: "compromisso" },
    { word: "neighbor", translation: "vizinho" },
    { word: "shopping", translation: "compras" },
  ],
  B1: [
    { word: "meeting", translation: "reunião" },
    { word: "deadline", translation: "prazo final" },
    { word: "experience", translation: "experiência" },
    { word: "decision", translation: "decisão" },
    { word: "improve", translation: "melhorar" },
    { word: "suggest", translation: "sugerir" },
    { word: "comfortable", translation: "confortável" },
    { word: "available", translation: "disponível" },
  ],
  B2: [
    { word: "negotiate", translation: "negociar" },
    { word: "strategy", translation: "estratégia" },
    { word: "emphasis", translation: "ênfase" },
    { word: "outcome", translation: "resultado" },
    { word: "commitment", translation: "comprometimento" },
    { word: "perspective", translation: "perspectiva" },
    { word: "assumption", translation: "suposição" },
    { word: "thorough", translation: "minucioso" },
  ],
  C1: [
    { word: "compelling", translation: "convincente" },
    { word: "articulate", translation: "articular" },
    { word: "nuance", translation: "nuance" },
    { word: "scrutinize", translation: "escrutinar" },
    { word: "mitigate", translation: "mitigar" },
    { word: "convergence", translation: "convergência" },
    { word: "candid", translation: "franco" },
    { word: "prevalent", translation: "predominante" },
  ],
};

/**
 * Returns the seed vocab list for a given CEFR level.
 *
 * Falls back to A1 for any level outside the explicit pool (e.g. C2, which we
 * don't seed separately — a C2 reader is well past beginner vocabulary and the
 * real lesson pipeline will supply appropriate cards).
 */
export function seedVocabForLevel(level: CEFRLevel): SeedVocabItem[] {
  if (level in SEED_VOCAB) return SEED_VOCAB[level as Exclude<CEFRLevel, "C2">];
  // C2 or any unexpected value: degrade to a B2-ish starter set
  return SEED_VOCAB.B2;
}
