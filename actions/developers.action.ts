import prisma from "@/db/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export async function getDevelopers() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  return await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    where: {
      NOT: {
        id: user?.id
      }
    }
  })
} 