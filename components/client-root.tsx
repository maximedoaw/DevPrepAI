"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import AuthScreen from "@/components/auth/AuthScreen";
import DevLoader from "@/components/dev-loader";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRoleAndDomains } from "@/actions/user.action";
import AppSidebar from "./AppNavbar";
import { usePathname, useRouter } from "next/navigation";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading, user } = useKindeBrowserClient();
  const pathname = usePathname();
  const router = useRouter();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await getUserRoleAndDomains(user.id);
      return result;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!isAuthenticated || userLoading) return;

    if (userData === null) {
      // User needs onboarding
      if (pathname === '/onboarding') {
        // User is where they should be, mark as onboarding active
        sessionStorage.setItem('onboarding_active', 'true');
      } else {
        // User is NOT on onboarding page
        const wasOnboarding = sessionStorage.getItem('onboarding_active');

        if (wasOnboarding === 'true') {
          // User tried to leave onboarding without finishing -> Sign Out
          sessionStorage.removeItem('onboarding_active');
          router.push('/api/auth/logout');
        } else {
          // User just logged in or arrived -> Redirect to onboarding
          router.push('/onboarding');
        }
      }
    } else {
      // User is onboarded, clean up flag
      sessionStorage.removeItem('onboarding_active');
    }
  }, [isAuthenticated, userLoading, userData, pathname, router]);

  if (authLoading || (isAuthenticated && userLoading)) return <DevLoader />;

  if (!isAuthenticated) return <AuthScreen />;

  // If we are on onboarding page, render children (which is the onboarding page content)
  // We don't show the sidebar on the onboarding page
  if (pathname === '/onboarding') {
    return <>{children}</>;
  }

  // If we are on the portfolio preview page, don't show sidebar
  if (pathname?.startsWith('/portfolio/')) {
    return <>{children}</>;
  }

  // If user data is missing and we are not on onboarding (redirecting...), show loader
  if (userData === null) return <DevLoader />;

  return (
    <AppSidebar>{children}</AppSidebar>
  );
}