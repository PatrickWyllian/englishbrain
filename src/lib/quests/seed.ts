import type { QuestType } from "@/generated/prisma/enums";

export interface QuestTemplate {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  requirement: {
    type: string;
    count?: number;
    tags?: string[];
  };
  xpReward: number;
}

export const DAILY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: "daily-complete-3-lessons",
    type: "DAILY",
    title: "Complete 3 Lessons",
    description: "Complete any 3 lessons today",
    requirement: { type: "LESSONS_COMPLETED", count: 3 },
    xpReward: 150,
  },
  {
    id: "daily-earn-500-xp",
    type: "DAILY",
    title: "Earn 500 XP",
    description: "Earn 500 XP today",
    requirement: { type: "XP_EARNED", count: 500 },
    xpReward: 200,
  },
  {
    id: "daily-3-day-streak",
    type: "DAILY",
    title: "Maintain 3-Day Streak",
    description: "Maintain a streak of at least 3 days",
    requirement: { type: "STREAK_DAYS", count: 3 },
    xpReward: 100,
  },
  {
    id: "daily-2-business-lessons",
    type: "DAILY",
    title: "Complete 2 Business Lessons",
    description: "Complete 2 lessons tagged 'business'",
    requirement: { type: "TAG_LESSONS", tags: ["business"], count: 2 },
    xpReward: 175,
  },
  {
    id: "daily-2-tech-lessons",
    type: "DAILY",
    title: "Complete 2 Tech Lessons",
    description: "Complete 2 lessons tagged 'tech'",
    requirement: { type: "TAG_LESSONS", tags: ["tech"], count: 2 },
    xpReward: 175,
  },
  {
    id: "daily-review-10-srs",
    type: "DAILY",
    title: "Review 10 SRS Cards",
    description: "Review at least 10 SRS cards today",
    requirement: { type: "SRS_REVIEWS", count: 10 },
    xpReward: 125,
  },
  {
    id: "daily-1-speaking",
    type: "DAILY",
    title: "Complete 1 Speaking Challenge",
    description: "Complete one speaking challenge",
    requirement: { type: "SPEAKING_CHALLENGES", count: 1 },
    xpReward: 150,
  },
  {
    id: "daily-1-listening",
    type: "DAILY",
    title: "Complete 1 Listening Challenge",
    description: "Complete one listening challenge",
    requirement: { type: "LISTENING_CHALLENGES", count: 1 },
    xpReward: 150,
  },
  {
    id: "daily-reach-level-5",
    type: "DAILY",
    title: "Reach Level 5",
    description: "Reach player level 5",
    requirement: { type: "LEVEL_REACHED", count: 5 },
    xpReward: 300,
  },
  {
    id: "daily-unlock-3-skills",
    type: "DAILY",
    title: "Unlock 3 Skill Nodes",
    description: "Unlock 3 skill nodes in the skill tree",
    requirement: { type: "SKILLS_UNLOCKED", count: 3 },
    xpReward: 200,
  },
];

export const WEEKLY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: "weekly-complete-10-lessons",
    type: "WEEKLY",
    title: "Complete 10 Lessons",
    description: "Complete 10 lessons this week",
    requirement: { type: "LESSONS_COMPLETED", count: 10 },
    xpReward: 500,
  },
  {
    id: "weekly-earn-2000-xp",
    type: "WEEKLY",
    title: "Earn 2000 XP",
    description: "Earn 2000 XP this week",
    requirement: { type: "XP_EARNED", count: 2000 },
    xpReward: 750,
  },
];
