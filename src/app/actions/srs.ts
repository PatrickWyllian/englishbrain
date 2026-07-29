"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ContentType } from "@/generated/prisma/enums";

export async function getUserSrsCards() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.srsCard.findMany({
    where: { userId: session.user.id },
    orderBy: { dueDate: "asc" },
  });
}

export async function getDueCards() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.srsCard.findMany({
    where: {
      userId: session.user.id,
      dueDate: { lte: new Date() },
    },
    orderBy: { dueDate: "asc" },
  });
}

function sm2(quality: number, repetitions: number, easeFactor: number, interval: number) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEF);
    }
  }

  return {
    easeFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
  };
}

export async function upsertSrsCard(
  contentId: string,
  contentType: ContentType,
  grade: number
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  const existing = await prisma.srsCard.findFirst({
    where: { userId, contentId },
  });

  if (existing) {
    const result = sm2(
      grade,
      existing.repetitions,
      existing.easeFactor,
      existing.interval
    );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + result.interval);

    const updated = await prisma.srsCard.update({
      where: { id: existing.id },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        dueDate,
        lastReviewed: new Date(),
        lapseCount: grade < 3 ? existing.lapseCount + 1 : existing.lapseCount,
      },
    });

    return { card: updated };
  }

  const result = sm2(grade, 0, 2.5, 0);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + result.interval);

  const created = await prisma.srsCard.create({
    data: {
      userId,
      contentId,
      contentType,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      dueDate,
      lastReviewed: new Date(),
    },
  });

  return { card: created };
}
