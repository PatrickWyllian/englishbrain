import type { CEFRLevel } from "@/types";

export type StepType =
  | "vocab"
  | "grammar"
  | "listening"
  | "speaking"
  | "boss"
  | "reading"
  | "writing";

export interface VocabItem {
  word: string;
  translation: string;
  context: string;
}

export interface McqQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export interface BaseStep {
  id: string;
  type: StepType;
  title: string;
  xpReward: number;
}

export interface VocabStep extends BaseStep {
  type: "vocab";
  items: VocabItem[];
}

export interface GrammarStep extends BaseStep {
  type: "grammar";
  rule: string;
  explanation: string;
  question: McqQuestion;
}

export interface ListeningStep extends BaseStep {
  type: "listening";
  audioSrc?: string;
  transcript: string;
  questions: McqQuestion[];
}

export interface SpeakingStep extends BaseStep {
  type: "speaking";
  prompt: string;
  targetSentences: string[];
  hints?: string[];
}

export interface BossStep extends BaseStep {
  type: "boss";
  timeLimit: number; // seconds
  questions: McqQuestion[];
  passThreshold: number; // pct
}

export interface ReadingStep extends BaseStep {
  type: "reading";
  transcript: string;
  questions: McqQuestion[];
}

export interface WritingStep extends BaseStep {
  type: "writing";
  prompt: string;
  targetSentences: string[];
  hints?: string[];
}

export type LessonStep =
  | VocabStep
  | GrammarStep
  | ListeningStep
  | SpeakingStep
  | BossStep
  | ReadingStep
  | WritingStep;

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  contextTags: string[];
  level: CEFRLevel;
  xpReward: number;
  manaCost: number;
  estimatedMin: number;
  steps: LessonStep[];
}
