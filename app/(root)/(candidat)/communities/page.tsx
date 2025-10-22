'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  BookOpen, 
  Code, 
  Users, 
  Plus, 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Tag,
  User,
  Calendar,
  ThumbsUp,
  Eye
} from 'lucide-react'

// Types pour les données de la communauté
interface CommunityPost {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar?: string
    reputation: number
  }
  tags: string[]
  type: 'problem' | 'solution' | 'discussion'
  exerciseId?: string
  createdAt: string
  likes: number
  comments: number
  views: number
  isResolved?: boolean
}

interface Exercise {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'discussion' as const,
    tags: [] as string[],
    exerciseId: ''
  })

  // Données d'exemple
  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      title: 'Comment optimiser un algorithme de tri pour de gros datasets ?',
      content: 'Je travaille sur un exercice de tri et j\'ai des problèmes de performance avec des arrays de plus de 100k éléments...',
      author: {
        name: 'Marie Dubois',
        avatar: '/avatars/marie.jpg',
        reputation: 1250
      },
      tags: ['algorithmes', 'performance', 'tri'],
      type: 'problem',
      exerciseId: 'ex-001',
      createdAt: '2024-01-15T10:30:00Z',
      likes: 12,
      comments: 8,
      views: 156,
      isResolved: false
    },
    {
      id: '2',
      title: 'Solution élégante pour le problème Two Sum',
      content: 'Voici une approche avec HashMap qui résout le problème en O(n) au lieu de O(n²)...',
      author: {
        name: 'Thomas Martin',
        avatar: '/avatars/thomas.jpg',
        reputation: 2100
      },
      tags: ['leetcode', 'hashmap', 'optimisation'],
      type: 'solution',
      exerciseId: 'ex-002',
      createdAt: '2024-01-14T15:45:00Z',
      likes: 25,
      comments: 12,
      views: 234
    },
    {
      id: '3',
      title: 'Retour d\'expérience : entretien technique chez Google',
      content: 'Je viens de passer un entretien technique chez Google et je voulais partager mon expérience...',
      author: {
        name: 'Sophie Laurent',
        avatar: '/avatars/sophie.jpg',
        reputation: 890
      },
      tags: ['entretien', 'google', 'experience'],
      type: 'discussion',
      createdAt: '2024-01-13T09:20:00Z',
      likes: 18,
      comments: 15,
      views: 312
    }
  ]

  const mockExercises: Exercise[] = [
    { id: 'ex-001', title: 'Algorithmes de tri avancés', difficulty: 'hard', category: 'Algorithmes' },
    { id: 'ex-002', title: 'Two Sum Problem', difficulty: 'easy', category: 'Arrays' },
    { id: 'ex-003', title: 'Binary Tree Traversal', difficulty: 'medium', category: 'Arbres' }
  ]

  const allTags = ['algorithmes', 'performance', 'tri', 'leetcode', 'hashmap', 'optimisation', 'entretien', 'google', 'experience', 'arrays', 'arbres']

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => post.tags.includes(tag))
    const matchesTab = activeTab === 'all' || post.type === activeTab
    return matchesSearch && matchesTags && matchesTab
  })

  const handleCreatePost = () => {
    // Ici on ajouterait la logique pour créer un nouveau post
    console.log('Nouveau post:', newPost)
    setIsCreatePostOpen(false)
    setNewPost({ title: '', content: '', type: 'discussion', tags: [], exerciseId: '' })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'problem': return <AlertCircle className="h-4 w-4" />
      case 'solution': return <CheckCircle className="h-4 w-4" />
      case 'discussion': return <MessageCircle className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'problem': return 'text-red-600'
      case 'solution': return 'text-green-600'
      case 'discussion': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-800 mb-2">Communauté DevPrepAI</h1>
        <p className="text-gray-600">Partagez vos problèmes, solutions et expériences avec la communauté</p>
      </div>

      {/* Actions et filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau post</DialogTitle>
                  <DialogDescription>
                    Partagez un problème, une solution ou démarrez une discussion
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="post-title">Titre</Label>
                    <Input
                      id="post-title"
                      placeholder="Titre de votre post..."
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="post-type">Type de post</Label>
                    <Select value={newPost.type} onValueChange={(value: any) => setNewPost(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="problem">🚨 Problème</SelectItem>
                        <SelectItem value="solution">✅ Solution</SelectItem>
                        <SelectItem value="discussion">💬 Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="post-exercise">Exercice lié (optionnel)</Label>
                    <Select value={newPost.exerciseId} onValueChange={(value) => setNewPost(prev => ({ ...prev, exerciseId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un exercice..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockExercises.map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.title} ({exercise.difficulty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="post-content">Contenu</Label>
                    <Textarea
                      id="post-content"
                      placeholder="Décrivez votre problème, solution ou démarrez une discussion..."
                      className="min-h-[120px]"
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={newPost.tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            setNewPost(prev => ({
                              ...prev,
                              tags: prev.tags.includes(tag)
                                ? prev.tags.filter(t => t !== tag)
                                : [...prev.tags, tag]
                            }))
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreatePost} className="bg-cyan-600 hover:bg-cyan-700">
                      Publier
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans la communauté..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtres par tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            Filtrer par tags:
          </span>
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:bg-cyan-100"
              onClick={() => toggleTag(tag)}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTags([])}
              className="text-xs"
            >
              Effacer filtres
            </Button>
          )}
        </div>
      </div>

      {/* Tabs pour filtrer par type */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="problem">Problèmes</TabsTrigger>
          <TabsTrigger value="solution">Solutions</TabsTrigger>
          <TabsTrigger value="discussion">Discussions</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Liste des posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun post trouvé</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres ou créez le premier post !</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.author.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {post.author.reputation} pts
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${getTypeColor(post.type)}`}>
                      {getTypeIcon(post.type)}
                      <span className="text-xs font-medium capitalize">{post.type}</span>
                    </div>
                    {post.isResolved !== undefined && (
                      <Badge variant={post.isResolved ? "default" : "destructive"} className="text-xs">
                        {post.isResolved ? "Résolu" : "Non résolu"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2 text-cyan-800">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Exercice lié */}
                {post.exerciseId && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>Exercice lié:</span>
                      <Badge className={getDifficultyColor(mockExercises.find(ex => ex.id === post.exerciseId)?.difficulty || 'medium')}>
                        {mockExercises.find(ex => ex.id === post.exerciseId)?.title}
                      </Badge>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-cyan-600">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-cyan-600">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-cyan-600">
                      <Share2 className="h-4 w-4 mr-1" />
                      Partager
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Eye className="h-4 w-4" />
                    {post.views}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default CommunityPage