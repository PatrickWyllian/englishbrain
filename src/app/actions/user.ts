"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function getOrCreateUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "Adventurer",
      },
    });
  }

  return user;
}

export async function addUserXp(xpAmount: number) {
  const schema = z.number().int().positive();
  const parsed = schema.safeParse(xpAmount);
  if (!parsed.success) {
    return { error: "Quantidade de XP inválida" as const };
  }

  const user = await getOrCreateUser();
  if (!user) return null;

  const bigIntXp = BigInt(parsed.data);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      totalXp: user.totalXp + bigIntXp,
      xp: user.xp + bigIntXp,
    },
  });

  return updated;
}

export async function updateUserLevel(level: number) {
  const user = await getOrCreateUser();
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: { level },
  });
}

export async function updateUserStreak() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = user.lastActiveAt
    ? new Date(user.lastActiveAt)
    : null;

  let newStreak = 1;
  if (lastActive) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastActiveDate = new Date(
      lastActive.getFullYear(),
      lastActive.getMonth(),
      lastActive.getDate(),
    );

    if (lastActiveDate.getTime() === today.getTime()) {
      newStreak = user.streak; // Already updated today
    } else if (lastActiveDate.getTime() === yesterday.getTime()) {
      newStreak = user.streak + 1;
    }
    // else: streak reset to 1
  }

  const longestStreak = Math.max(user.longestStreak, newStreak);

  return prisma.user.update({
    where: { id: user.id },
    data: {
      streak: newStreak,
      longestStreak,
      lastActiveAt: now,
    },
  });
}

export async function consumeMana(amount: number) {
  const user = await getOrCreateUser();
  if (!user) return null;

  const newMana = Math.max(0, user.mana - amount);

  return prisma.user.update({
    where: { id: user.id },
    data: { mana: newMana },
  });
}

export async function updateUserInterests(interests: string[]) {
  const user = await getOrCreateUser();
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: { interests },
  });
}

export async function updateUserClass(
  playerClass: string,
) {
  const user = await getOrCreateUser();
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: { class: playerClass as "WARRIOR" | "MAGE" | "ROGUE" | "CLERIC" },
  });
}

export async function getUserStats() {
  const user = await getOrCreateUser();
  if (!user) return null;

  return {
    level: user.level,
    xp: Number(user.xp),
    totalXp: Number(user.totalXp),
    streak: user.streak,
    longestStreak: user.longestStreak,
    mana: user.mana,
    maxMana: user.maxMana,
    class: user.class,
    interests: user.interests ?? [],
    lastActiveAt: user.lastActiveAt,
  };
}

interface SyncGameStateInput {
  level?: number;
  xp?: string;
  totalXp?: string;
  streak?: number;
  longestStreak?: number;
  mana?: number;
  maxMana?: number;
  class?: string;
  interests?: string[];
}

const syncGameStateSchema = z.object({
  level: z.number().int().min(1).max(100).optional(),
  xp: z.string().regex(/^\d+$/).optional(),
  totalXp: z.string().regex(/^\d+$/).optional(),
  streak: z.number().int().min(0).max(365).optional(),
  longestStreak: z.number().int().min(0).max(365).optional(),
  mana: z.number().int().min(0).max(1000).optional(),
  maxMana: z.number().int().min(1).max(1000).optional(),
  class: z.enum(["WARRIOR", "MAGE", "ROGUE", "CLERIC"]).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
});

export async function syncGameStateToDb(state: SyncGameStateInput) {
  const parsed = syncGameStateSchema.safeParse(state);
  if (!parsed.success) {
    return { error: "Dados inválidos" as const };
  }

  const user = await getOrCreateUser();
  if (!user) return null;

  const data: Record<string, unknown> = {};
  const s = parsed.data;

  if (s.level !== undefined) data.level = s.level;
  if (s.xp !== undefined) data.xp = BigInt(s.xp);
  if (s.totalXp !== undefined) data.totalXp = BigInt(s.totalXp);
  if (s.streak !== undefined) data.streak = s.streak;
  if (s.longestStreak !== undefined) data.longestStreak = s.longestStreak;
  if (s.mana !== undefined) data.mana = s.mana;
  if (s.maxMana !== undefined) data.maxMana = s.maxMana;
  if (s.class !== undefined) data.class = s.class;
  if (s.interests !== undefined) data.interests = s.interests;

  return prisma.user.update({ where: { id: user.id }, data });
}

export async function loadGameStateFromDb() {
  const user = await getOrCreateUser();
  if (!user) return null;

  return {
    level: user.level,
    xp: user.xp.toString(),
    totalXp: user.totalXp.toString(),
    streak: user.streak,
    longestStreak: user.longestStreak,
    mana: user.mana,
    maxMana: user.maxMana,
    class: user.class,
    interests: user.interests ?? [],
    lastActiveAt: user.lastActiveAt,
  };
}