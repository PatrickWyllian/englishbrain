import { prisma } from "@/lib/prisma";

interface Requirement {
  type: string;
  count?: number;
  tags?: string[];
}

interface RequirementResult {
  current: number;
  target: number;
}

export async function checkRequirement(
  userId: string,
  requirement: Requirement,
): Promise<RequirementResult> {
  const target = requirement.count ?? 0;

  switch (requirement.type) {
    case "LESSONS_COMPLETED": {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const current = user ? user.level - 1 : 0;
      return { current: Math.min(current, target), target };
    }

    case "XP_EARNED": {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const current = user ? Number(user.totalXp) : 0;
      return { current: Math.min(current, target), target };
    }

    case "STREAK_DAYS": {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const current = user?.streak ?? 0;
      return { current: Math.min(current, target), target };
    }

    case "TAG_LESSONS": {
      const tags = requirement.tags ?? [];
      const current = await prisma.lesson.count({
        where: {
          contextTags: { hasSome: tags },
          isActive: true,
        },
      });
      return { current: Math.min(current, target), target };
    }

    case "SRS_REVIEWS": {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const current = await prisma.srsCard.count({
        where: {
          userId,
          lastReviewed: { gte: today },
        },
      });
      return { current: Math.min(current, target), target };
    }

    case "SPEAKING_CHALLENGES": {
      const current = await prisma.lessonStep.count({
        where: { type: "SPEAKING" },
      });
      return { current: Math.min(current, target), target };
    }

    case "LISTENING_CHALLENGES": {
      const current = await prisma.lessonStep.count({
        where: { type: "LISTENING" },
      });
      return { current: Math.min(current, target), target };
    }

    case "LEVEL_REACHED": {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const current = user?.level ?? 1;
      return { current: Math.min(current, target), target };
    }

    case "SKILLS_UNLOCKED": {
      const current = await prisma.userSkillNode.count({
        where: {
          userId,
          status: { in: ["ACTIVE", "MASTERED"] },
        },
      });
      return { current: Math.min(current, target), target };
    }

    default:
      return { current: 0, target };
  }
}
