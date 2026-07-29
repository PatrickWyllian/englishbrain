import type { PlayerProfile } from "@/types";

export interface RecommendedLesson {
  slug: string;
  title: string;
  description: string;
  level: PlayerProfile["estimatedLevel"];
  tags: string[];
  xpReward: number;
  manaCost: number;
  estimatedMin: number;
}

const INTEREST_NAMES: Record<string, string> = {
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

const BRANCH_NAMES: Record<string, string> = {
  SPEAKING: "Speaking",
  LISTENING: "Listening",
  READING: "Reading",
  WRITING: "Writing",
  GRAMMAR: "Grammar",
  VOCAB: "Vocab",
};

/**
 * Deterministic recommendation based on the player's interests, level and class.
 * Does not depend on a real lesson catalog — generates a `/learn/[slug]` target
 * that the lesson engine can later hydrate from the backend.
 */
export function recommendLesson(player: PlayerProfile): RecommendedLesson {
  const interest = player.interests[0] ?? "general";
  const interestName = INTEREST_NAMES[interest] ?? interest;
  const level = player.estimatedLevel;

  // Pick a branch influenced by class without exposing unrelated branches.
  const classBranch: Record<PlayerProfile["class"], string> = {
    WARRIOR: "SPEAKING",
    ROGUE: "LISTENING",
    MAGE: "WRITING",
    CLERIC: "READING",
  };
  const branch = classBranch[player.class];
  const branchName = BRANCH_NAMES[branch] ?? branch;

  const slug = `${interest}-${level.toLowerCase()}-${branch.toLowerCase()}`;

  const titles = [
    `${interestName}: ${branchName} Essentials`,
    `Survival English — ${interestName}`,
    `${interestName} Fluency Drill`,
  ];
  const titleIndex =
    player.level % titles.length ||
    Math.abs(slug.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) %
      titles.length;

  return {
    slug,
    title: titles[titleIndex],
    description: `Lição recomendada para ${interestName.toLowerCase()} no nível ${level}. Foco em ${branchName.toLowerCase()}.`,
    level,
    tags: [interest, branch, level],
    xpReward: 120 + player.level * 10,
    manaCost: 20,
    estimatedMin: 8 + Math.floor(player.level / 5),
  };
}
