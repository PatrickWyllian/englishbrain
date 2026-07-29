"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addFriend(friendEmail: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  if (friendEmail === session.user.email) {
    return { error: "Você não pode adicionar a si mesmo" as const };
  }

  const friend = await prisma.user.findUnique({
    where: { email: friendEmail },
  });
  if (!friend) return { error: "Usuário não encontrado" as const };

  const existing = await prisma.friend.findUnique({
    where: { userId_friendId: { userId, friendId: friend.id } },
  });
  if (existing) return { error: "Já são amigos" as const };

  const friendship = await prisma.friend.create({
    data: { userId, friendId: friend.id },
  });

  const reverseExists = await prisma.friend.findUnique({
    where: { userId_friendId: { userId: friend.id, friendId: userId } },
  });
  if (!reverseExists) {
    await prisma.friend.create({
      data: { userId: friend.id, friendId: userId },
    });
  }

  return { friendship };
}

export async function getFriends(userId?: string) {
  const id = userId ?? (await auth())?.user?.id;
  if (!id) return [];

  const friendships = await prisma.friend.findMany({
    where: { userId: id },
  });

  const friendIds = friendships.map((f) => f.friendId);
  if (friendIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      image: true,
      level: true,
      totalXp: true,
      class: true,
    },
    orderBy: { totalXp: "desc" },
  });

  return users.map((u) => ({
    ...u,
    totalXp: u.totalXp.toString(),
  }));
}

export async function removeFriend(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" as const };

  const userId = session.user.id;

  await prisma.friend.deleteMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });

  return { success: true };
}
