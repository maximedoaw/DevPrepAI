"use client"

import { useState } from "react"
import { Briefcase, FileText, Video, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useJobMutations } from "@/hooks/use-job-queries"
import { toast } from "sonner"
import { JobFormData } from "@/lib/validations/job-validation-form"
import { EnterpriseHeader } from "@/components/enterprise/enterprise-interview/enterprise-header"
import { Timeline } from "@/components/enterprise/enterprise-interview/timeline"
import { QuickStats } from "@/components/enterprise/enterprise-interview/quick-stats"
import { SearchFilters } from "@/components/enterprise/enterprise-interview/search-filter"
import { JobOffersTab } from "@/components/enterprise/enterprise-interview/job-offers-tab"
import { QuizzesTab } from "@/components/enterprise/enterprise-interview/quizzes-tab"
import { InterviewsTab } from "@/components/enterprise/enterprise-interview/interviews-tab"
import { SettingsTab } from "@/components/enterprise/enterprise-interview/settings-tab"
import { CreateJobModal } from "@/components/enterprise/enterprise-interview/create-job-modal"

// Types
interface JobOffer {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  description: string
  requirements: string[]
  postedDate: string
  applicants: number
  status: 'active' | 'paused' | 'closed'
  image?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  type: 'QCM' | 'MOCK_INTERVIEW' | 'SOFT_SKILLS' | 'TECHNICAL'
  difficulty: 'JUNIOR' | 'MID' | 'SENIOR'
  technology: string[]
  duration: number
  totalPoints: number
  company: string
  image?: string
  createdAt: string
}

export default function EnterpriseInterviewsPage() {
  const [activeTab, setActiveTab] = useState("offers")
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  
  const { createJobMutation } = useJobMutations()

  // Données mockées
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([
    {
      id: "1",
      title: "Développeur Full Stack React/Node.js",
      company: "TechCorp",
      location: "Paris, France",
      salary: "€60k-€80k",
      type: "CDI",
      description: "Nous recherchons un développeur full stack passionné pour rejoindre notre équipe produit.",
      requirements: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      postedDate: "2024-01-15",
      applicants: 24,
      status: 'active',
      image: "/api/placeholder/400/200"
    },
    {
      id: "2",
      title: "Ingénieur DevOps Senior",
      company: "CloudSolutions",
      location: "Lyon, France",
      salary: "€70k-€90k",
      type: "CDI",
      description: "Rejoignez notre équipe infrastructure pour optimiser nos processus de déploiement.",
      requirements: ["AWS", "Docker", "Kubernetes", "Terraform"],
      postedDate: "2024-01-10",
      applicants: 18,
      status: 'active',
      image: "/api/placeholder/400/200"
    }
  ])

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: "1",
      title: "Test Technique React Avancé",
      description: "Évaluez les compétences React de vos candidats avec ce quiz technique complet.",
      type: "TECHNICAL",
      difficulty: "SENIOR",
      technology: ["React", "JavaScript", "TypeScript"],
      duration: 60,
      totalPoints: 100,
      company: "Votre Entreprise",
      image: "/api/placeholder/400/200",
      createdAt: "2024-01-15"
    }
  ])

  // Filtres
  const filteredOffers = jobOffers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.technology.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateJob = async (data: JobFormData) => {
    try {
      // Simuler la création d'une offre
      const newJob: JobOffer = {
        id: Date.now().toString(),
        title: data.title,
        company: data.companyName,
        location: data.location || "Non spécifié",
        salary: data.salaryMin && data.salaryMax ? `${data.salaryMin}k-${data.salaryMax}k` : "À discuter",
        type: data.type,
        description: data.description,
        requirements: data.skills,
        postedDate: new Date().toISOString().split('T')[0],
        applicants: 0,
        status: 'active'
      }

      setJobOffers(prev => [newJob, ...prev])
      toast.success("Offre créée avec succès!")
      
      // Ici vous utiliseriez la mutation réelle :
      // await createJobMutation.mutateAsync(data)
    } catch (error) {
      toast.error("Erreur lors de la création de l'offre")
    }
  }

  const handleCreateQuiz = () => {
    toast.info("Création de test - Fonctionnalité à venir")
  }

  const handleScheduleInterview = () => {
    toast.info("Planification d'entretien - Fonctionnalité à venir")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-blue-50/30 dark:from-slate-950 dark:via-green-950/10 dark:to-blue-950/10">
      <div className="container mx-auto px-4 py-8">
        <EnterpriseHeader 
          onCreateJobClick={() => setCreateModalOpen(true)}
          onCreateQuizClick={handleCreateQuiz}
        />
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Timeline
              jobOffers={jobOffers}
              selectedOffer={selectedOffer}
              onSelectOffer={setSelectedOffer}
            />
            <QuickStats jobOffers={jobOffers} quizzes={quizzes} />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <SearchFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-600/70 backdrop-blur-lg p-1">
                <TabsTrigger 
                  value="offers" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Briefcase className="w-4 h-4" />
                  Offres d'emploi
                </TabsTrigger>
                <TabsTrigger 
                  value="quizzes" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <FileText className="w-4 h-4" />
                  Tests & Quiz
                </TabsTrigger>
                <TabsTrigger 
                  value="interviews" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Video className="w-4 h-4" />
                  Entretiens
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="offers" className="space-y-6">
                <JobOffersTab 
                  onCreateJobClick={() => setCreateModalOpen(true)}
                />
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-6">
                <QuizzesTab quizzes={filteredQuizzes} />
              </TabsContent>

              <TabsContent value="interviews">
                <InterviewsTab onScheduleInterview={handleScheduleInterview} />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <CreateJobModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </div>
    </div>
  )
}