'use client';

import AuthScreen from "@/components/auth/auth-screen";
import DevLoader from "@/components/dev-loader";
import HomeScreen from "@/components/home/home-screen";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from "react";

export default function HomePage({ initialUser }: { initialUser: any }) {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const [authState, setAuthState] = useState<'loading'|'authenticated'|'unauthenticated'>(
    initialUser ? 'authenticated' : 'loading'
  );

  useEffect(() => {
    if (!isLoading) {
      setAuthState(isAuthenticated ? 'authenticated' : 'unauthenticated');
    }
  }, [isAuthenticated, isLoading]);

  if (authState === 'loading') {
    return <DevLoader />;
  }

  return authState === 'authenticated' ? <HomeScreen /> : <AuthScreen />;
}