import { StreamClient } from "@stream-io/node-sdk"

let cachedClient: StreamClient | null = null

export function streamServerClient() {
  if (cachedClient) return cachedClient

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
  const secret = process.env.STREAM_SECRET_KEY ?? process.env.STREAM_SECRET

  if (!apiKey) {
    throw new Error(
      "La variable d'environnement NEXT_PUBLIC_STREAM_API_KEY est requise pour initialiser le client Stream."
    )
  }

  if (!secret) {
    throw new Error(
      "La variable d'environnement STREAM_SECRET_KEY (ou STREAM_SECRET) est requise pour initialiser le client Stream."
    )
  }

  cachedClient = new StreamClient(apiKey, secret)
  return cachedClient
}

