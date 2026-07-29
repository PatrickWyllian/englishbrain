import type { SkillBranch } from "@/types";

export interface SkillNodeData {
  id: string;
  name: string;
  description: string;
  branch: SkillBranch;
  tier: number; // 1-5
  xpCost: number;
  prerequisites: string[]; // node ids
  icon: string; // lucide icon name
}

export type NodeState = "locked" | "available" | "active" | "mastered";

export interface UserSkillNodeData {
  nodeId: string;
  status: NodeState;
  progress: number; // 0-1
}

export const BRANCH_COLORS: Record<SkillBranch, string> = {
  SPEAKING: "#EF4444", // red
  LISTENING: "#22C55E", // green
  READING: "#8B5CF6", // purple
  WRITING: "#3B82F6", // blue
  GRAMMAR: "#F59E0B", // amber
  VOCAB: "#06B6D4", // cyan
};

export const BRANCH_LABELS: Record<SkillBranch, string> = {
  SPEAKING: "Speaking",
  LISTENING: "Listening",
  READING: "Reading",
  WRITING: "Writing",
  GRAMMAR: "Grammar",
  VOCAB: "Vocabulário",
};

// Hex layout constants
export const HEX_RADIUS = 48;
export const HEX_WIDTH = HEX_RADIUS * 2;
export const HEX_HEIGHT = Math.sqrt(3) * HEX_RADIUS;
export const HEX_H_SPACING = HEX_WIDTH * 0.75;
export const HEX_V_SPACING = HEX_HEIGHT;

/**
 * Generate hex position for a node at (col, row) in a hex grid.
 * Odd columns are offset by half height (pointy-top hex layout).
 */
export function hexPosition(col: number, row: number): { x: number; y: number } {
  const offsetY = col % 2 === 1 ? HEX_HEIGHT / 2 : 0;
  return {
    x: col * HEX_H_SPACING + HEX_RADIUS,
    y: row * HEX_V_SPACING + offsetY + HEX_RADIUS,
  };
}

/**
 * Generate hex path for SVG polygon.
 */
export function hexPath(cx: number, cy: number, r: number = HEX_RADIUS): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30); // pointy-top
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
}

/**
 * All skill nodes organized by branch and tier.
 * 6 branches x 5 tiers = 30 nodes.
 */
export const SKILL_NODES: SkillNodeData[] = [
  // SPEAKING (red)
  { id: "spk-1", name: "Greetings", description: "Cumprimentos básicos", branch: "SPEAKING", tier: 1, xpCost: 100, prerequisites: [], icon: "hand" },
  { id: "spk-2", name: "Self-intro", description: "Se apresentar em inglês", branch: "SPEAKING", tier: 2, xpCost: 200, prerequisites: ["spk-1"], icon: "user" },
  { id: "spk-3", name: "Opinions", description: "Expressar opiniões", branch: "SPEAKING", tier: 3, xpCost: 400, prerequisites: ["spk-2"], icon: "message-circle" },
  { id: "spk-4", name: "Debate", description: "Argumentar e debater", branch: "SPEAKING", tier: 4, xpCost: 800, prerequisites: ["spk-3"], icon: "swords" },
  { id: "spk-5", name: "Fluency", description: "Fluência natural", branch: "SPEAKING", tier: 5, xpCost: 1600, prerequisites: ["spk-4", "lst-4"], icon: "zap" },

  // LISTENING (green)
  { id: "lst-1", name: "Basic Audio", description: "Compreender áudios simples", branch: "LISTENING", tier: 1, xpCost: 100, prerequisites: [], icon: "headphones" },
  { id: "lst-2", name: "Podcasts", description: "Entender podcasts", branch: "LISTENING", tier: 2, xpCost: 200, prerequisites: ["lst-1"], icon: "podcast" },
  { id: "lst-3", name: "Movies", description: "Filmes sem legenda", branch: "LISTENING", tier: 3, xpCost: 400, prerequisites: ["lst-2"], icon: "film" },
  { id: "lst-4", name: "Accents", description: "Reconhecer sotaques", branch: "LISTENING", tier: 4, xpCost: 800, prerequisites: ["lst-3"], icon: "globe" },
  { id: "lst-5", name: "Native Speed", description: "Velocidade nativa", branch: "LISTENING", tier: 5, xpCost: 1600, prerequisites: ["lst-4", "spk-4"], icon: "radio" },

  // READING (purple)
  { id: "rdg-1", name: "Scan", description: "Leitura rápida (scanning)", branch: "READING", tier: 1, xpCost: 100, prerequisites: [], icon: "scan" },
  { id: "rdg-2", name: "Articles", description: "Artigos e notícias", branch: "READING", tier: 2, xpCost: 200, prerequisites: ["rdg-1"], icon: "newspaper" },
  { id: "rdg-3", name: "Tech Docs", description: "Documentação técnica", branch: "READING", tier: 3, xpCost: 400, prerequisites: ["rdg-2"], icon: "file-code" },
  { id: "rdg-4", name: "Literature", description: "Literatura em inglês", branch: "READING", tier: 4, xpCost: 800, prerequisites: ["rdg-3"], icon: "book-open" },
  { id: "rdg-5", name: "Speed Read", description: "Leitura dinâmica", branch: "READING", tier: 5, xpCost: 1600, prerequisites: ["rdg-4", "wrt-4"], icon: "eye" },

  // WRITING (blue)
  { id: "wrt-1", name: "Sentences", description: "Frases simples", branch: "WRITING", tier: 1, xpCost: 100, prerequisites: [], icon: "pencil" },
  { id: "wrt-2", name: "Paragraphs", description: "Parágrafos coesos", branch: "WRITING", tier: 2, xpCost: 200, prerequisites: ["wrt-1"], icon: "align-left" },
  { id: "wrt-3", name: "Emails", description: "E-mails profissionais", branch: "WRITING", tier: 3, xpCost: 400, prerequisites: ["wrt-2"], icon: "mail" },
  { id: "wrt-4", name: "Essays", description: "Ensaios e artigos", branch: "WRITING", tier: 4, xpCost: 800, prerequisites: ["wrt-3"], icon: "file-text" },
  { id: "wrt-5", name: "Style", description: "Estilo e tom avançado", branch: "WRITING", tier: 5, xpCost: 1600, prerequisites: ["wrt-4", "grm-4"], icon: "feather" },

  // GRAMMAR (amber)
  { id: "grm-1", name: "Present", description: "Presente simples/contínuo", branch: "GRAMMAR", tier: 1, xpCost: 100, prerequisites: [], icon: "clock" },
  { id: "grm-2", name: "Past", description: "Passado simples/contínuo", branch: "GRAMMAR", tier: 2, xpCost: 200, prerequisites: ["grm-1"], icon: "rewind" },
  { id: "grm-3", name: "Future", description: "Futuro e condicionais", branch: "GRAMMAR", tier: 3, xpCost: 400, prerequisites: ["grm-2"], icon: "fast-forward" },
  { id: "grm-4", name: "Perfect", description: "Present/past perfect", branch: "GRAMMAR", tier: 4, xpCost: 800, prerequisites: ["grm-3"], icon: "check-circle" },
  { id: "grm-5", name: "Advanced", description: "Estruturas avançadas", branch: "GRAMMAR", tier: 5, xpCost: 1600, prerequisites: ["grm-4", "vcb-4"], icon: "award" },

  // VOCAB (cyan)
  { id: "vcb-1", name: "Core 500", description: "500 palavras essenciais", branch: "VOCAB", tier: 1, xpCost: 100, prerequisites: [], icon: "book" },
  { id: "vcb-2", name: "Phrasal Verbs", description: "Phrasal verbs comuns", branch: "VOCAB", tier: 2, xpCost: 200, prerequisites: ["vcb-1"], icon: "link" },
  { id: "vcb-3", name: "Business", description: "Vocabulário de negócios", branch: "VOCAB", tier: 3, xpCost: 400, prerequisites: ["vcb-2"], icon: "briefcase" },
  { id: "vcb-4", name: "Idioms", description: "Expressões idiomáticas", branch: "VOCAB", tier: 4, xpCost: 800, prerequisites: ["vcb-3"], icon: "lightbulb" },
  { id: "vcb-5", name: "C2 Lexicon", description: "Vocabulário avançado C2", branch: "VOCAB", tier: 5, xpCost: 1600, prerequisites: ["vcb-4", "grm-4"], icon: "crown" },
];