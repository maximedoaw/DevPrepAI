"use server";

import prisma from "@/db/prisma"; // Assurez-vous que c'est le bon chemin
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function createUser(userData: {
  id: string;
  email: string;
  family_name: string;
  given_name: string;
}) {
  try {
    // Vérifiez que Prisma est bien initialisé
    if (!prisma) {
      throw new Error("Prisma client not initialized");
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (existingUser) return { success: false, message: "User already exists" };

    await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        firstName: userData.family_name,
        lastName: userData.given_name,
      },
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Prisma error:", error);
    return { success: false, message: "Database error occurred" };
  }
}