"use client"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import InterviewSidebar from "@/components/interviews/interview-sidebar"
import AuthScreen from "@/components/auth/auth-screen"
import DevLoader from "@/components/dev-loader"
import SubscribeDialog from "@/components/subscribe-dialog"

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useKindeBrowserClient()
  if (isLoading) return <DevLoader />
  return <>
    <SubscribeDialog />
    {isAuthenticated ? <InterviewSidebar>{children}</InterviewSidebar> : <AuthScreen />}
  </>
} 