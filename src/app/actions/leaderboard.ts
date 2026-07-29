"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LeaderboardType = "global" | "friends" | "guild" | "weekly";

function formatUsers(users: { id: string; name: string | null; avatarUrl: string | null; image: string | null; level: number; totalXp: bigint; class: string }[]) {
  return users.map((u) => ({
    ...u,
    totalXp: u.totalXp.toString(),
  }));
}

export async function getLeaderboard(type: LeaderboardType = "global") {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const select = {
    id: true,
    name: true,
    avatarUrl: true,
    image: true,
    level: true,
    totalXp: true,
    class: true,
  } as const;

  switch (type) {
    case "friends": {
      if (!currentUserId) return [];
      const friendships = await prisma.friend.findMany({
        where: { userId: currentUserId },
      });
      const friendIds = friendships.map((f) => f.friendId);
      const allIds = [currentUserId, ...friendIds];

      const users = await prisma.user.findMany({
        where: { id: { in: allIds } },
        select,
        orderBy: { totalXp: "desc" },
        take: 50,
      });
      return formatUsers(users);
    }

    case "guild": {
      if (!currentUserId) return [];
      const user = await prisma.user.findUnique({ where: { id: currentUserId } });
      if (!user?.guildId) return [];

      const users = await prisma.user.findMany({
        where: { guildId: user.guildId },
        select,
        orderBy: { totalXp: "desc" },
        take: 50,
      });
      return formatUsers(users);
    }

    case "weekly": {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const users = await prisma.user.findMany({
        where: { lastActiveAt: { gte: weekAgo } },
        select,
        orderBy: { totalXp: "desc" },
        take: 50,
      });
      return formatUsers(users);
    }

    default: {
      const users = await prisma.user.findMany({
        select,
        orderBy: { totalXp: "desc" },
        take: 50,
      });
      return formatUsers(users);
    }
  }
}
