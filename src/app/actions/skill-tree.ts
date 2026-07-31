"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function getUserSkillNodes(userId?: string) {
  const session = await auth();
  const id = userId ?? session?.user?.id;
  if (!id) return [];

  return prisma.userSkillNode.findMany({
    where: { userId: id },
    include: { skill: true },
  });
}

export async function unlockSkillNode(skillId: string) {
  const skillIdSchema = z.string().min(1, "ID da skill é obrigatório");
  const parsed = skillIdSchema.safeParse(skillId);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message } as const;
  }

  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const skill = await prisma.skillNode.findUnique({
    where: { skillId },
  });
  if (!skill) return { error: "Skill não encontrada" as const };

  const existing = await prisma.userSkillNode.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });
  if (existing && existing.status !== "LOCKED") {
    return { error: "Skill já desbloqueada" as const };
  }

  if (skill.prerequisites.length > 0) {
    const completed = await prisma.userSkillNode.findMany({
      where: {
        userId,
        skillId: { in: skill.prerequisites },
        status: "MASTERED",
      },
    });
    if (completed.length < skill.prerequisites.length) {
      return {
        error:
          "Pré-requisitos não atendidos: domine (80%+) os nodes anteriores",
      } as const;
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuário não encontrado" as const };
  if (Number(user.xp) < skill.xpCost) {
    return { error: "XP insuficiente" as const };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { xp: user.xp - BigInt(skill.xpCost) },
  });

  const node = await prisma.userSkillNode.upsert({
    where: { userId_skillId: { userId, skillId } },
    update: { status: "ACTIVE", progress: 0 },
    create: { userId, skillId, status: "ACTIVE", progress: 0 },
  });

  return { node };
}

export async function masterSkillNode(skillId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const node = await prisma.userSkillNode.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });
  if (!node || node.status === "LOCKED") {
    return { error: "Skill não está ativa" as const };
  }

  if (node.progress < 0.8) {
    return {
      error: "Progresso insuficiente: é preciso 80%+ de acerto consolidado" as const,
    };
  }

  const updated = await prisma.userSkillNode.update({
    where: { userId_skillId: { userId, skillId } },
    data: { status: "MASTERED", progress: 1, masteredAt: new Date() },
  });

  return { node: updated };
}

export async function recordSkillProgress(skillId: string, accuracy: number) {
  const schema = z.object({
    skillId: z.string().min(1),
    accuracy: z.number().min(0).max(1),
  });
  const parsed = schema.safeParse({ skillId, accuracy });
  if (!parsed.success) {
    return { error: "Dados inválidos" as const };
  }

  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const node = await prisma.userSkillNode.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });
  if (!node || node.status !== "ACTIVE") {
    return { error: "Skill não está ativa" as const };
  }

  const ema = Math.min(1, node.progress * 0.7 + parsed.data.accuracy * 0.3);
  const updated = await prisma.userSkillNode.update({
    where: { userId_skillId: { userId, skillId } },
    data: { progress: ema },
  });

  return { node: updated };
}
