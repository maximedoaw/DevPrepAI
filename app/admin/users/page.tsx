import { redirect } from "next/navigation"
import { isAdmin, getUsers } from "@/actions/admin.action"
import UsersManagement from "./users-management"

interface UsersPageProps {
  searchParams: {
    page?: string
    search?: string
  }
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  // Vérifier l'accès administrateur
  const adminAccess = await isAdmin()
  
  if (!adminAccess) {
    redirect('/')
  }

  const page = parseInt(searchParams.page || '1')
  const search = searchParams.search || ''

  // Récupérer les utilisateurs
  const usersData = await getUsers(page, 20, search)

  return <UsersManagement usersData={usersData} />
} 