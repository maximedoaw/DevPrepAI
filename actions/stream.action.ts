"use server"

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { StreamClient } from "@stream-io/node-sdk"

export async function streamTokenProvider(forceRefresh?: boolean) {
  const { getUser } = getKindeServerSession()

  const user = await getUser()
  if (!user?.id) {
    throw new Error("User not found")
  }

  const streamClient = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_SECRET_KEY!
  )

  const token = streamClient.generateUserToken({ user_id: user.id })
  return token
}