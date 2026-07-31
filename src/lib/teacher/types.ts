import { z } from "zod";

export const teacherQuestSchema = z.object({
  quest_title: z.string().min(1),
  cefr_level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  theme: z.string().min(1),
  narrative_hook: z.string().min(1),
  new_structure: z.string().min(1),
  challenge_prompt: z.string().min(1),
  hint_progressive: z.array(z.string().min(1)).max(4),
  xp_base: z.number().int().positive().max(500),
  loot_pool: z.array(z.string().min(1)).max(10).default([]),
  streak_multiplier_eligible: z.boolean(),
});

export type TeacherQuest = z.infer<typeof teacherQuestSchema>;

export const teacherFeedbackSchema = z.object({
  score: z.number().int().min(0).max(100),
  praise: z.string().min(1),
  native_version: z.string().min(1),
  why: z.string().min(1),
  hint: z.string().min(1),
  mastery: z.boolean(),
});

export type TeacherFeedback = z.infer<typeof teacherFeedbackSchema>;

export const feedbackInputSchema = z.object({
  prompt: z.string().min(1).max(2000),
  attempt: z.string().min(1).max(2000),
  target: z.string().max(2000).optional(),
  attemptCount: z.number().int().min(1).max(10).optional().default(1),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
