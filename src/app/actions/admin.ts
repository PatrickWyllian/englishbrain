"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { StepType } from "@/lib/lesson/types";
import type { StepType as PrismaStepType } from "@/generated/prisma/enums";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonContent = Record<string, any>;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}

export async function getAdminStats() {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  const [totalLessons, totalUsers, activeUsers] = await Promise.all([
    prisma.lesson.count(),
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return { totalLessons, totalUsers, activeUsers };
}

export async function getLessons() {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  const lessons = await prisma.lesson.findMany({
    orderBy: { order: "asc" },
    include: {
      steps: { select: { id: true } },
      skillRewards: { select: { id: true } },
      lootTable: { select: { id: true } },
    },
  });

  return lessons.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    level: l.level,
    tags: l.contextTags,
    isActive: l.isActive,
    order: l.order,
    xpReward: l.xpReward,
    manaCost: l.manaCost,
    estimatedMin: l.estimatedMin,
    stepCount: l.steps.length,
    hasSkillRewards: l.skillRewards.length > 0,
    hasLootTable: !!l.lootTable,
  }));
}

export async function getLessonById(id: string) {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  return prisma.lesson.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      skillRewards: true,
      lootTable: { include: { drops: { include: { item: true } } } },
    },
  });
}

interface LessonInput {
  title: string;
  description: string;
  slug: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  xpReward: number;
  manaCost: number;
  estimatedMin: number;
  order: number;
  isActive: boolean;
  contextTags: string[];
  steps: {
    type: StepType;
    title: string;
    order: number;
    xpReward: number;
    content: Record<string, unknown>;
  }[];
  skillRewards: { skillId: string; xpAmount: number }[];
  lootTable: {
    drops: { itemId: string; weight: number; minLevel: number; maxLevel: number | null }[];
  } | null;
}

export async function createLesson(input: LessonInput) {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: input.title,
      description: input.description,
      slug: input.slug,
      level: input.level,
      xpReward: input.xpReward,
      manaCost: input.manaCost,
      estimatedMin: input.estimatedMin,
      order: input.order,
      isActive: input.isActive,
      contextTags: input.contextTags,
      steps: {
        create: input.steps.map((s) => ({
          type: s.type.toUpperCase() as PrismaStepType,
          title: s.title,
          order: s.order,
          xpReward: s.xpReward,
          content: s.content as JsonContent,
        })),
      },
      skillRewards: {
        create: input.skillRewards,
      },
      ...(input.lootTable
        ? {
            lootTable: {
              create: {
                drops: {
                  create: input.lootTable.drops,
                },
              },
            },
          }
        : {}),
    },
    include: { steps: true, skillRewards: true, lootTable: true },
  });

  return lesson;
}

export async function updateLesson(id: string, input: LessonInput) {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  await prisma.lessonStep.deleteMany({ where: { lessonId: id } });
  await prisma.skillReward.deleteMany({ where: { lessonId: id } });
  await prisma.lootDrop.deleteMany({
    where: { lootTable: { lessonId: id } },
  });
  await prisma.lootTable.deleteMany({ where: { lessonId: id } });

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      slug: input.slug,
      level: input.level,
      xpReward: input.xpReward,
      manaCost: input.manaCost,
      estimatedMin: input.estimatedMin,
      order: input.order,
      isActive: input.isActive,
      contextTags: input.contextTags,
      steps: {
        create: input.steps.map((s) => ({
          type: s.type.toUpperCase() as PrismaStepType,
          title: s.title,
          order: s.order,
          xpReward: s.xpReward,
          content: s.content as JsonContent,
        })),
      },
      skillRewards: {
        create: input.skillRewards,
      },
      ...(input.lootTable
        ? {
            lootTable: {
              create: {
                drops: {
                  create: input.lootTable.drops,
                },
              },
            },
          }
        : {}),
    },
    include: { steps: true, skillRewards: true, lootTable: true },
  });

  return lesson;
}

export async function deleteLesson(id: string) {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  await prisma.lesson.delete({ where: { id } });
  return { success: true };
}

export async function getAllItems() {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  return prisma.item.findMany({ orderBy: { name: "asc" } });
}

export async function getAllSkillNodes() {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "Acesso negado" };
  }

  return prisma.skillNode.findMany({ orderBy: { name: "asc" } });
}
