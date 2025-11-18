"use client"

import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { streamTokenProvider } from "@/actions/stream.action";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import DevLoader from "../dev-loader";

const StreamClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [streamVideoClient, setStreamVideoClient] = useState<StreamVideoClient | null>(null);
  const { user, isLoading } = useKindeBrowserClient();

  useEffect(() => {
    // Attendre que le chargement soit terminé ET que l'utilisateur existe
    if (isLoading || !user) return;

    const displayName =
      (user.given_name || "") + (user.given_name && user.family_name ? " " : "") + (user.family_name || "") ||
      user.email ||
      user.id;

    const streamClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      user: {
        id: user.id,
        name: displayName,
        image: user.picture || undefined,
      },
      tokenProvider: streamTokenProvider,
    });

    setStreamVideoClient(streamClient);

    // Cleanup function
    return () => {
      streamClient.disconnectUser().catch(() => {
        // Ignore cleanup errors
      });
    };
  }, [isLoading, user]);

  if (isLoading || !streamVideoClient) {
    return <DevLoader />;
  }

  return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
};

export default StreamClientProvider;