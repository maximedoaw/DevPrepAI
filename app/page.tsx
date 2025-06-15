'use client';

import AuthScreen from "@/components/auth/auth-screen";
import DevLoader from "@/components/dev-loader";
import HomeScreen from "@/components/home/home-screen";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createUser } from "@/actions/user.action";

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const { mutate } = useMutation({
    mutationKey: ['createUser'],
    mutationFn: async () => {
      if (!user) throw new Error("No user data");
      return await createUser({
        id: user.id,
        email: user.email as string,
        family_name: user.family_name as string,
        given_name: user.given_name as string,
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.warning(data.message);
      }
    },
    onError: (error) => {
      toast.error('Une erreur est survenue: ' + error.message);
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        mutate();
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    }
  }, [isAuthenticated, isLoading, user, mutate]);

  if (authState === 'loading') {
    return <DevLoader />;
  }

  return authState === 'authenticated' ? <HomeScreen /> : <AuthScreen />;
}