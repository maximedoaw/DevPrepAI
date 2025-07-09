"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Plus,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Mail,
  CreditCard,
  FileText,
  Filter,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  getAdminStats, 
  getUsers, 
  getQuizzes, 
  getSubscriptions, 
  getQuizResults,
  updateSubscription,
  createQuiz,
  deleteQuiz,
  deleteQuizResult,
  getMonthlySubscriptionRevenue
} from '@/actions/admin.action'

// Import des composants
import { AdminHeader } from '@/components/admin/admin-header'
import DevLoader from '@/components/dev-loader'
import StatsCards from './components/stats-cards'
import { OverviewTab } from '@/components/admin/overview-tab'
import { DuolingoCard } from '@/components/admin/duolingo-card'
import { DuolingoBadge } from '@/components/admin/duolingo-badge'

// Types et interfaces
interface AdminStats {
  totalUsers: number
  totalQuizzes: number
  totalQuizResults: number
  totalSubscriptions: number
  recentUsers: any[]
  recentQuizResults: any[]
  subscriptionStats: any[]
  quizTypeStats: any[]
  monthlyRevenue?: any // <-- optionnel
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  credits: number
  subscription?: {
    id: string
    tier: string
    isActive: boolean
  }
  _count: {
    quizResults: number
    skillAnalyses: number
  }
}

interface Quiz {
  id: string
  title: string
  type: string
  difficulty: string
  company: string
  technology: string[]
  duration: number
  totalPoints: number
  _count: {
    results: number
  }
}

// Composant pour l'affichage mobile des utilisateurs
function MobileUserCard({ user }: { user: any }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-green-300">
          <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</h3>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">{user.credits.toLocaleString()} crédits</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{user._count.quizResults} quiz</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {user.subscription ? (
          <DuolingoBadge 
            variant={user.subscription.tier === 'EXPERT' ? 'premium' : user.subscription.tier === 'PREMIUM' ? 'success' : 'default'}
          >
            {user.subscription.tier}
          </DuolingoBadge>
        ) : (
          <DuolingoBadge variant="default">Aucun abonnement</DuolingoBadge>
        )}
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Composant pour l'affichage mobile des quiz
function MobileQuizCard({ quiz }: { quiz: any }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{quiz.title}</h3>
          <p className="text-sm text-gray-600">{quiz.company}</p>
          <p className="text-xs text-gray-500 truncate">{quiz.technology.join(', ')}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DuolingoBadge variant="premium">{quiz.type}</DuolingoBadge>
          <span className="text-sm text-gray-600">{quiz.duration} min</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-purple-600">{quiz._count.results} résultats</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Composant principal
export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [statsData, usersData, quizzesData, resultsData, monthlyRevenue] = await Promise.all([
          getAdminStats(),
          getUsers(1, 20),
          getQuizzes(1, 20),
          getQuizResults(1, 20),
          getMonthlySubscriptionRevenue(),
        ])
        const statsWithRevenue = { ...statsData, monthlyRevenue };
        setStats(statsWithRevenue)
        setUsers(usersData.users)
        setQuizzes(quizzesData.quizzes)
        setResults(resultsData.results)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        toast.error('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Fonction pour mettre à jour un abonnement
  const handleUpdateSubscription = async (subscriptionId: string, tier: string, isActive: boolean) => {
    setIsUpdating(true)
    try {
      await updateSubscription(subscriptionId, { tier, isActive })
      toast.success('Abonnement mis à jour avec succès')
      // Recharger les données
      const [statsData, usersData] = await Promise.all([
        getAdminStats(),
        getUsers(1, 20)
      ])
      setStats(statsData)
      setUsers(usersData.users)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) return <DevLoader/>

  if (!stats) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600">Erreur de chargement</h1>
          <p className="text-gray-600">Impossible de charger les données d'administration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <AdminHeader />
        
        <StatsCards stats={stats as AdminStats} />

        {/* Navigation par onglets responsive */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-xl min-w-[600px] sm:min-w-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger 
                value="quizzes"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Quiz
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Abonnements
              </TabsTrigger>
              <TabsTrigger 
                value="results"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Résultats
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <OverviewTab stats={stats} />
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <DuolingoCard gradient="from-green-500 to-blue-500">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    Gestion des utilisateurs
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {/* Filtres et recherche */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-2 focus:border-green-500"
                      />
                    </div>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-full sm:w-48 border-2 focus:border-green-500">
                        <SelectValue placeholder="Filtrer par type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="free">Gratuit</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Affichage desktop */}
                  <div className="hidden lg:block">
                    <div className="rounded-xl border-2 border-green-200 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                          <TableRow>
                            <TableHead className="font-bold text-gray-800">Utilisateur</TableHead>
                            <TableHead className="font-bold text-gray-800">Email</TableHead>
                            <TableHead className="font-bold text-gray-800">Abonnement</TableHead>
                            <TableHead className="font-bold text-gray-800">Crédits</TableHead>
                            <TableHead className="font-bold text-gray-800">Quiz complétés</TableHead>
                            <TableHead className="font-bold text-gray-800">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-300">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border-2 border-green-300">
                                    <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold">
                                      {user.firstName?.[0]}{user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-bold text-gray-800">{user.firstName} {user.lastName}</div>
                                    <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">{user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {user.subscription ? (
                                  <DuolingoBadge 
                                    variant={user.subscription.tier === 'EXPERT' ? 'premium' : user.subscription.tier === 'PREMIUM' ? 'success' : 'default'}
                                  >
                                    {user.subscription.tier}
                                  </DuolingoBadge>
                                ) : (
                                  <DuolingoBadge variant="default">Aucun</DuolingoBadge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-green-500" />
                                  <span className="font-bold">{user.credits.toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <DuolingoBadge variant="warning">{user._count.quizResults}</DuolingoBadge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="hover:bg-green-100">
                                    <Eye className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="hover:bg-blue-100">
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="hover:bg-red-100">
                                    <MoreHorizontal className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Affichage mobile */}
                  <div className="lg:hidden space-y-3">
                    {users.map((user) => (
                      <MobileUserCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              </div>
            </DuolingoCard>
          </TabsContent>

          {/* Onglet Quiz */}
          <TabsContent value="quizzes" className="space-y-4 sm:space-y-6">
            <DuolingoCard gradient="from-purple-500 to-pink-500">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    Gestion des quiz
                  </h2>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un quiz
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Affichage desktop */}
                  <div className="hidden lg:block">
                    {quizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{quiz.title}</p>
                            <p className="text-sm text-gray-600">{quiz.company}</p>
                            <p className="text-xs text-gray-500">{quiz.technology.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <DuolingoBadge variant="premium">{quiz.type}</DuolingoBadge>
                          <div className="text-right">
                            <p className="text-sm font-bold text-purple-600">{quiz._count.results} résultats</p>
                            <p className="text-xs text-gray-500">{quiz.duration} min</p>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-100">
                            <MoreHorizontal className="h-4 w-4 text-purple-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Affichage mobile */}
                  <div className="lg:hidden space-y-3">
                    {quizzes.map((quiz) => (
                      <MobileQuizCard key={quiz.id} quiz={quiz} />
                    ))}
                  </div>
                </div>
              </div>
            </DuolingoCard>
          </TabsContent>

          {/* Autres onglets */}
          <TabsContent value="subscriptions" className="space-y-4 sm:space-y-6">
            <DuolingoCard gradient="from-yellow-500 to-orange-500">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Gestion des abonnements</h2>
                <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
              </div>
            </DuolingoCard>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 sm:space-y-6">
            <DuolingoCard gradient="from-red-500 to-pink-500">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Résultats des quiz</h2>
                <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
              </div>
            </DuolingoCard>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <DuolingoCard gradient="from-indigo-500 to-purple-500">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Analytics</h2>
                <p className="text-gray-600">Fonctionnalité en cours de développement...</p>
              </div>
            </DuolingoCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 