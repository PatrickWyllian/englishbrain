"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[randomInt(chars.length)];
  }
  return code;
}

export async function createParty(name: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const existing = await prisma.partyMember.findUnique({
    where: { userId },
  });
  if (existing) return { error: "Você já está em uma party" as const };

  let code = generateInviteCode();
  let attempts = 0;
  while (attempts < 10) {
    const exists = await prisma.party.findUnique({ where: { code } });
    if (!exists) break;
    code = generateInviteCode();
    attempts++;
  }

  const party = await prisma.party.create({
    data: {
      name,
      code,
      members: {
        create: { userId },
      },
    },
    include: { members: { include: { user: true } } },
  });

  return { party };
}

export async function joinParty(code: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const existingMember = await prisma.partyMember.findUnique({
    where: { userId },
  });
  if (existingMember) return { error: "Você já está em uma party" as const };

  const party = await prisma.party.findUnique({
    where: { code },
    include: { members: true },
  });
  if (!party) return { error: "Código de party inválido" as const };

  if (party.members.length >= 4) {
    return { error: "Party está cheia (máx. 4 membros)" as const };
  }

  const member = await prisma.partyMember.create({
    data: { userId, partyId: party.id },
    include: { party: { include: { members: { include: { user: true } } } } },
  });

  return { member };
}

export async function getPartyByUser(userId?: string) {
  const id = userId ?? (await auth())?.user?.id;
  if (!id) return null;

  const membership = await prisma.partyMember.findUnique({
    where: { userId: id },
    include: {
      party: {
        include: {
          members: {
            include: { user: true },
          },
        },
      },
    },
  });

  return membership?.party ?? null;
}

export async function getPartyMembers(partyId: string) {
  return prisma.partyMember.findMany({
    where: { partyId },
    include: { user: true },
    orderBy: { joinedAt: "asc" },
  });
}

export async function leaveParty() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const membership = await prisma.partyMember.findUnique({
    where: { userId },
  });
  if (!membership) return { error: "Você não está em uma party" as const };

  await prisma.partyMember.delete({ where: { userId } });

  const remaining = await prisma.partyMember.count({
    where: { partyId: membership.partyId },
  });

  if (remaining === 0) {
    await prisma.party.delete({ where: { id: membership.partyId } });
  }

  return { success: true };
}
