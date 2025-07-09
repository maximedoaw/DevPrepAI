"use client"

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Calendar,
  CreditCard,
  Users,
  Filter
} from 'lucide-react'
import { updateSubscription } from '@/actions/admin.action'
import { toast } from 'sonner'

interface UsersManagementProps {
  usersData: {
    users: any[]
    total: number
    pages: number
    currentPage: number
  }
}

export default function UsersManagement({ usersData }: UsersManagementProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedFilter !== 'all') params.set('filter', selectedFilter)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleUpdateSubscription = async (userId: string, tier: string, isActive: boolean) => {
    setIsUpdating(true)
    try {
      await updateSubscription(userId, { tier, isActive })
      toast.success('Abonnement mis à jour avec succès')
      router.refresh()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    const colors = {
      FREE: 'bg-gray-100 text-gray-700',
      PREMIUM: 'bg-blue-100 text-blue-700',
      EXPERT: 'bg-purple-100 text-purple-700'
    }
    return <Badge className={colors[tier as keyof typeof colors] || colors.FREE}>{tier}</Badge>
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredUsers = usersData.users.filter(user => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'premium' && user.subscription?.tier === 'PREMIUM') return true
    if (selectedFilter === 'expert' && user.subscription?.tier === 'EXPERT') return true
    if (selectedFilter === 'free' && (!user.subscription || user.subscription?.tier === 'FREE')) return true
    return false
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            {usersData.total} utilisateurs au total • Page {usersData.currentPage} sur {usersData.pages}
          </p>
        </div>

      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Crédits</TableHead>
                  <TableHead>Quiz complétés</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <div className="flex items-center gap-2">
                          {getSubscriptionBadge(user.subscription.tier)}
                          {user.subscription.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              Inactif
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Aucun</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        {user.credits.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {user._count.quizResults}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Détails de l'utilisateur</DialogTitle>
                              <DialogDescription>
                                Informations complètes sur {user.firstName} {user.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Nom complet</label>
                                  <p className="text-sm text-gray-600">
                                    {user.firstName} {user.lastName}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Crédits</label>
                                  <p className="text-sm text-gray-600">{user.credits}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Quiz complétés</label>
                                  <p className="text-sm text-gray-600">{user._count.quizResults}</p>
                                </div>
                              </div>
                              
                              {user.subscription && (
                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-2">Abonnement</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Type</label>
                                      <Select 
                                        value={user.subscription.tier} 
                                        onValueChange={(value) => handleUpdateSubscription(user.subscription.id, value, user.subscription.isActive)}
                                        disabled={isUpdating}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="FREE">Gratuit</SelectItem>
                                          <SelectItem value="PREMIUM">Premium</SelectItem>
                                          <SelectItem value="EXPERT">Expert</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Statut</label>
                                      <Select 
                                        value={user.subscription.isActive ? 'active' : 'inactive'} 
                                        onValueChange={(value) => handleUpdateSubscription(user.subscription.id, user.subscription.tier, value === 'active')}
                                        disabled={isUpdating}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Actif</SelectItem>
                                          <SelectItem value="inactive">Inactif</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Fermer</Button>
                              <Button>Modifier</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {usersData.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Affichage de {((usersData.currentPage - 1) * 20) + 1} à {Math.min(usersData.currentPage * 20, usersData.total)} sur {usersData.total} utilisateurs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(usersData.currentPage - 1)}
                  disabled={usersData.currentPage === 1}
                >
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, usersData.pages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={page === usersData.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(usersData.currentPage + 1)}
                  disabled={usersData.currentPage === usersData.pages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 