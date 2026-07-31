// @vitest-environment node
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { chatCompletion, extractJson } from "./client";

const questSchema = z.object({
  quest_title: z.string().min(1),
  cefr_level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  theme: z.string().min(1),
  narrative_hook: z.string().min(1),
  new_structure: z.string().min(1),
  challenge_prompt: z.string().min(1),
  hint_progressive: z.array(z.string().min(1)).max(4),
  xp_base: z.number().int().positive(),
  loot_pool: z.array(z.string().min(1)).max(10),
  streak_multiplier_eligible: z.boolean(),
});

describe("nvidia smoke (real API, skip unless NVIDIA_API_KEY set)", () => {
  const key = process.env.NVIDIA_API_KEY;
  const run = it;

  run.skipIf(!key)(
    "generates a quest and parses JSON",
    async () => {
      const result = await chatCompletion({
        provider: "nvidia",
        apiKey: key!,
        system:
          "Você é o Mestre-Coruja do EnglishQuest, professor de inglês gamificado.",
        user: `Gere UMA quest nova de inglês (A2), com tema séries. Responda APENAS com JSON:
{"quest_title": string, "cefr_level": string, "theme": string, "narrative_hook": string, "new_structure": string, "challenge_prompt": string, "hint_progressive": string[], "xp_base": number, "loot_pool": string[], "streak_multiplier_eligible": boolean}`,
        maxTokens: 700,
        temperature: 0.8,
      });

      expect(result.model).toContain("nemotron");
      const quest = extractJson(result.text, questSchema);
      expect(quest.quest_title.length).toBeGreaterThan(0);
      expect(quest.xp_base).toBeGreaterThan(0);
    },
    90_000,
  );
});
