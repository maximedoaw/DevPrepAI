// app/actions/user-actions.ts
"use server";

import prisma from "@/db/prisma";
import { Role, Domain } from "@prisma/client";

export async function getUserRoleAndDomains(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, domains: true }
    });
    
    return user ? { 
      role: user.role as string, 
      domains: user.domains as string[] 
    } : null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

export async function createOrUpdateUserWithRole(
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  domains: string[]
) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          role: role as Role,
          domains: {
            set: domains as Domain[]
          }
        },
        select: {
          id: true,
          role: true,
          domains: true
        }
      });
      
      return { 
        success: true, 
        user: {
          ...updatedUser,
          role: updatedUser.role as string,
          domains: updatedUser.domains as string[]
        } 
      };
    } else {
      // Créer un nouvel utilisateur
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: role as Role,
          domains: {
            set: domains as Domain[]
          }
        },
        select: {
          id: true,
          role: true,
          domains: true
        }
      });

      return { 
        success: true, 
        user: {
          ...newUser,
          role: newUser.role as string,
          domains: newUser.domains as string[]
        } 
      };
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return { success: false, error: "Failed to create/update user" };
  }
}