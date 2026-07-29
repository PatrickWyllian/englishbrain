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

export async function syncGameStateToDb(state: SyncGameStateInput) {
  const user = await getOrCreateUser();
  if (!user) return null;

  const data: Record<string, unknown> = {};

  if (state.level !== undefined) data.level = state.level;
  if (state.xp !== undefined) data.xp = BigInt(state.xp);
  if (state.totalXp !== undefined) data.totalXp = BigInt(state.totalXp);
  if (state.streak !== undefined) data.streak = state.streak;
  if (state.longestStreak !== undefined) data.longestStreak = state.longestStreak;
  if (state.mana !== undefined) data.mana = state.mana;
  if (state.maxMana !== undefined) data.maxMana = state.maxMana;
  if (state.class !== undefined) data.class = state.class;
  if (state.interests !== undefined) data.interests = state.interests;

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