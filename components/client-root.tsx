// components/client-root.tsx
"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import InterviewSidebar from "@/components/app-sidebar";
import AuthScreen from "@/components/auth/auth-screen";
import DevLoader from "@/components/dev-loader";
import SubscribeDialog from "@/components/subscribe-dialog";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRoleAndDomains } from "@/actions/user.action";
import RoleDomainSelector from "./auth/role-domain-selector";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading, user } = useKindeBrowserClient();
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const { data: userData, isLoading: userLoading, refetch } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await getUserRoleAndDomains(user.id);
      return result;
    },
  });

  useEffect(() => {
    if (userData === null && isAuthenticated) {
      setShowRoleSelector(true);
    } else {
      setShowRoleSelector(false);
    }
  }, [userData, isAuthenticated]);

  const handleComplete = () => {
    setShowRoleSelector(false);
    // Recharger les données utilisateur
    refetch();
  };

  if (authLoading || userLoading) return <DevLoader />;
  
  return (
    <>
      <SubscribeDialog />
      {isAuthenticated ? (
        showRoleSelector ? (
          <RoleDomainSelector onComplete={handleComplete} />
        ) : (
          <InterviewSidebar>{children}</InterviewSidebar>
        )
      ) : (
        <AuthScreen />
      )}
    </>
  );
}