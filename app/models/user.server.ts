import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export type UserSession = Pick<User, 'id' | 'email'>
export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { password: true },
  })

  if (!user || !user.password) return null

  const isValid = await bcrypt.compare(
    password,
    user.password.hash
  )


  return isValid ? { id: user.id, email: user.email } : null
}
