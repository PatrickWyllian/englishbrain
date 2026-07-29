"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createGuild(
  name: string,
  tag: string,
  description: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (existingUser?.guildId) return { error: "Você já está em uma guild" as const };

  const existingTag = await prisma.guild.findUnique({ where: { tag } });
  if (existingTag) return { error: "Tag já utilizada" as const };

  const guild = await prisma.guild.create({
    data: {
      name,
      tag,
      description,
      members: {
        connect: { id: userId },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { guildId: guild.id },
  });

  return { guild };
}

export async function joinGuild(guildId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (existingUser?.guildId) return { error: "Você já está em uma guild" as const };

  const guild = await prisma.guild.findUnique({ where: { id: guildId } });
  if (!guild) return { error: "Guild não encontrada" as const };

  const memberCount = await prisma.user.count({ where: { guildId } });
  if (memberCount >= 20) return { error: "Guild está cheia" as const };

  await prisma.user.update({
    where: { id: userId },
    data: { guildId },
  });

  return { guild };
}

export async function getGuildInfo(guildId: string) {
  return prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          image: true,
          level: true,
          totalXp: true,
        },
        orderBy: { totalXp: "desc" },
      },
    },
  });
}

export async function getGuildByUser(userId?: string) {
  const id = userId ?? (await auth())?.user?.id;
  if (!id) return null;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user?.guildId) return null;

  return getGuildInfo(user.guildId);
}

export async function leaveGuild() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.guildId) return { error: "Você não está em uma guild" as const };

  await prisma.user.update({
    where: { id: userId },
    data: { guildId: null },
  });

  return { success: true };
}
