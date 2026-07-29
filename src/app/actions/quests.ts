"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAILY_QUEST_TEMPLATES, WEEKLY_QUEST_TEMPLATES } from "@/lib/quests/seed";
import { checkRequirement } from "@/lib/quests/requirements";

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

function getDailyQuestDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function getWeeklyQuestDateRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

async function ensureQuestsExist(
  templates: typeof DAILY_QUEST_TEMPLATES,
  startsAt: Date,
  endsAt: Date,
) {
  const quests = [];
  for (const tpl of templates) {
    const quest = await prisma.quest.upsert({
      where: { id: tpl.id },
      update: { startsAt, endsAt },
      create: {
        id: tpl.id,
        type: tpl.type,
        title: tpl.title,
        description: tpl.description,
        requirement: tpl.requirement,
        xpReward: tpl.xpReward,
        startsAt,
        endsAt,
      },
    });
    quests.push(quest);
  }
  return quests;
}

export async function getDailyQuests(userId?: string) {
  const id = userId ?? (await getAuthUserId());
  if (!id) return [];

  const { start, end } = getDailyQuestDateRange();
  const quests = await ensureQuestsExist(DAILY_QUEST_TEMPLATES, start, end);

  const progress = await prisma.userQuest.findMany({
    where: {
      userId: id,
      questId: { in: quests.map((q) => q.id) },
    },
  });

  const progressMap = new Map(progress.map((p) => [p.questId, p]));

  return quests.map((quest) => {
    const userQuest = progressMap.get(quest.id);
    const req = quest.requirement as { type: string; count?: number };
    return {
      ...quest,
      requirement: req,
      progress: (userQuest?.progress ?? { current: 0, target: req.count ?? 0 }) as { current: number; target: number },
      completedAt: userQuest?.completedAt ?? null,
      claimedAt: userQuest?.claimedAt ?? null,
    };
  });
}

export async function getWeeklyQuests(userId?: string) {
  const id = userId ?? (await getAuthUserId());
  if (!id) return [];

  const { start, end } = getWeeklyQuestDateRange();
  const quests = await ensureQuestsExist(WEEKLY_QUEST_TEMPLATES, start, end);

  const progress = await prisma.userQuest.findMany({
    where: {
      userId: id,
      questId: { in: quests.map((q) => q.id) },
    },
  });

  const progressMap = new Map(progress.map((p) => [p.questId, p]));

  return quests.map((quest) => {
    const userQuest = progressMap.get(quest.id);
    const req = quest.requirement as { type: string; count?: number };
    return {
      ...quest,
      requirement: req,
      progress: (userQuest?.progress ?? { current: 0, target: req.count ?? 0 }) as { current: number; target: number },
      completedAt: userQuest?.completedAt ?? null,
      claimedAt: userQuest?.claimedAt ?? null,
    };
  });
}

export async function getQuestProgress(questId: string) {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const userQuest = await prisma.userQuest.findUnique({
    where: { userId_questId: { userId, questId } },
  });

  return userQuest;
}

export async function claimQuestReward(questId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) return { error: "Quest não encontrada" as const };

  const userQuest = await prisma.userQuest.findUnique({
    where: { userId_questId: { userId, questId } },
  });

  if (!userQuest) return { error: "Progresso não encontrado" as const };
  if (!userQuest.completedAt) return { error: "Quest não concluída" as const };
  if (userQuest.claimedAt) return { error: "Recompensa já coletada" as const };

  const updated = await prisma.userQuest.update({
    where: { id: userQuest.id },
    data: { claimedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: quest.xpReward },
      totalXp: { increment: quest.xpReward },
    },
  });

  return { quest: updated, xpAwarded: quest.xpReward };
}

export async function updateQuestProgress(
  questId: string,
  progress: { current: number; target: number },
) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) return { error: "Quest não encontrada" as const };

  const userQuest = await prisma.userQuest.upsert({
    where: { userId_questId: { userId, questId } },
    update: {
      progress,
      completedAt: progress.current >= progress.target ? new Date() : null,
    },
    create: {
      userId,
      questId,
      progress,
      completedAt: progress.current >= progress.target ? new Date() : null,
    },
  });

  return { userQuest };
}

export async function refreshQuestProgress(userId?: string) {
  const id = userId ?? (await getAuthUserId());
  if (!id) return;

  const allQuests = await prisma.quest.findMany({
    where: { isActive: true },
  });

  for (const quest of allQuests) {
    const requirement = quest.requirement as { type: string; count?: number; tags?: string[] };
    const result = await checkRequirement(id, requirement);
    await prisma.userQuest.upsert({
      where: { userId_questId: { userId: id, questId: quest.id } },
      update: {
        progress: { current: result.current, target: result.target } as unknown as Record<string, number>,
        completedAt: result.current >= result.target ? new Date() : undefined,
      },
      create: {
        userId: id,
        questId: quest.id,
        progress: { current: result.current, target: result.target } as unknown as Record<string, number>,
        completedAt: result.current >= result.target ? new Date() : undefined,
      },
    });
  }
}
