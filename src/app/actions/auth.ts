"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." };
  }

  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Este email já está cadastrado." };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      hashedPassword,
    },
  });

  return { success: true, userId: user.id };
}
