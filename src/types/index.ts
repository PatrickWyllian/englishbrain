// ──── EnglishQuest Domain Types ────

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type PlayerClass = "WARRIOR" | "MAGE" | "ROGUE" | "CLERIC";

export interface PlayerClassInfo {
  id: PlayerClass;
  name: string;
  tagline: string;
  focus: string;
  starterBranch: SkillBranch;
  color: string;
}

export type SkillBranch = "SPEAKING" | "LISTENING" | "READING" | "WRITING" | "GRAMMAR" | "VOCAB";

export interface InterestTag {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface OnboardingState {
  step: number;
  interests: string[];
  placementAnswers: PlacementAnswer[];
  estimatedLevel: CEFRLevel;
  playerClass: PlayerClass | null;
  completed: boolean;
}

export interface PlacementAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeMs: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  email?: string;
  level: number;
  xp: string;
  totalXp: string;
  streak: number;
  longestStreak: number;
  mana: number;
  maxMana: number;
  class: PlayerClass;
  interests: string[];
  estimatedLevel: CEFRLevel;
  interestsName?: string;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  contextTags: string[];
  level: CEFRLevel;
  xpReward: number;
  manaCost: number;
  estimatedMin: number;
  isLocked?: boolean;
  thumbnail?: string;
}

export interface DashboardStats {
  xpToday: number;
  lessonsCompleted: number;
  accuracy: number;
  streak: number;
}
