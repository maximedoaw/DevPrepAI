"use client";

import { useState, useMemo } from "react";
import { Briefcase, FileText, Video, Settings, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useJobInterviewMutations,
  useUserJobQuizzes,
} from "@/hooks/use-job-interview";
import { toast } from "sonner";
import { JobFormData } from "@/lib/validations/job-validation-form";
import { EnterpriseHeader } from "@/components/enterprise/enterprise-interview/enterprise-header";
import { Timeline } from "@/components/enterprise/enterprise-interview/timeline";
import { QuickStats } from "@/components/enterprise/enterprise-interview/quick-stats";
import { SearchFilters } from "@/components/enterprise/enterprise-interview/search-filter";
import { JobOffersTab } from "@/components/enterprise/enterprise-interview/job-offers-tab";
import { QuizzesTab } from "@/components/enterprise/enterprise-interview/quizzes-tab";
import { InterviewsTab } from "@/components/enterprise/enterprise-interview/interviews-tab";
import { SettingsTab } from "@/components/enterprise/enterprise-interview/settings-tab";
import { CreateJobModal } from "@/components/enterprise/enterprise-interview/create-job-modal";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useUserJobQueries } from "@/hooks/use-job-queries";
import { ApplicationsTab } from "@/components/enterprise/enterprise-interview/applications-tabs";

// Types - Aligné avec JobOffersTab
type JobOffer = {
  id: string;
  title: string;
  companyName: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  type: string;
  description: string;
  domains: string[];
  skills: string[];
  createdAt: string;
  updatedAt: string;
  applicants: number;
  status: "active" | "paused" | "closed";
  experienceLevel?: string;
  workMode: string;
  isActive: boolean;
  userId: string;
  companyId?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: "QCM" | "MOCK_INTERVIEW" | "SOFT_SKILLS" | "TECHNICAL";
  difficulty: "JUNIOR" | "MID" | "SENIOR";
  technology: string[];
  duration: number;
  totalPoints: number;
  company: string;
  image?: string;
  createdAt: string;
}

export default function EnterpriseInterviewsPage() {
  
  const [activeTab, setActiveTab] = useState("offers");
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { user } = useKindeBrowserClient();
  const { jobs: rawJobs, loadingJobs, refetchJobs } = useUserJobQueries(user?.id);
  
  // Transformer les jobs de la base de données vers le format JobOffer attendu par JobOffersTab
  const jobs = useMemo(() => {
    if (!rawJobs || !Array.isArray(rawJobs)) return [];
    
    return rawJobs.map((job: any) => ({
      id: job.id,
      title: job.title || "",
      companyName: job.companyName || "",
      location: job.location || undefined,
      salaryMin: job.salaryMin || undefined,
      salaryMax: job.salaryMax || undefined,
      currency: job.currency || "FCFA",
      type: job.type || "CDI",
      description: job.description || "",
      domains: Array.isArray(job.domains) ? job.domains : [],
      skills: Array.isArray(job.skills) ? job.skills : [],
      createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : new Date().toISOString(),
      applicants: job.applicants || 0,
      status: job.status || (job.isActive ? "active" : "paused"),
      experienceLevel: job.experienceLevel || undefined,
      workMode: job.workMode || "REMOTE",
      isActive: job.isActive !== undefined ? job.isActive : true,
      userId: job.userId || user?.id || "",
      companyId: job.companyId || undefined,
    })) as JobOffer[];
  }, [rawJobs, user?.id]);
  // Utilisation directe des hooks pour les quizzes
  const {
    createJobQuiz,
    updateJobQuiz,
    deleteJobQuiz,
    isCreating,
    isUpdating,
    isDeleting,
  } = useJobInterviewMutations();

  // Récupération des quizzes depuis l'API (remplace les données mockées)
  // Note: Vous devrez peut-être adapter le userId selon votre système d'authentification
  const userId = user?.id; // À remplacer par l'ID utilisateur réel
  const {
    data: quizzesResponse,
    isLoading: isLoadingQuizzes,
    error: quizzesError,
  } = useUserJobQuizzes(userId as string);

  // Extraction des données depuis la réponse API
  const quizzesData = quizzesResponse?.data || [];

  // Conversion des données API vers le format Quiz attendu par le composant
  const quizzes: Quiz[] = quizzesData.map((apiQuiz: any) => ({
    id: apiQuiz.id,
    title: apiQuiz.title,
    description: apiQuiz.description,
    type: apiQuiz.type as
      | "QCM"
      | "MOCK_INTERVIEW"
      | "SOFT_SKILLS"
      | "TECHNICAL",
    difficulty: apiQuiz.difficulty as "JUNIOR" | "MID" | "SENIOR",
    technology: apiQuiz.technology || [],
    duration: apiQuiz.duration,
    totalPoints: apiQuiz.totalPoints,
    company: apiQuiz.company,
    image: apiQuiz.image,
    createdAt: apiQuiz.createdAt,
  }));

  // Les jobs sont maintenant récupérés depuis useUserJobQueries et transformés dans le useMemo ci-dessus
  // Le filtrage est géré directement dans JobOffersTab

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.technology.some((tech) =>
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleCreateJob = async (data: JobFormData) => {
    // La création d'offre est gérée par CreateJobModal
    // Après création, refetchJobs() sera appelé pour rafraîchir la liste
    refetchJobs();
  };

  const handleCreateQuiz = async (quizData: any) => {
    try {
      // Utilisation directe de la mutation pour créer un quiz
      await createJobQuiz.mutateAsync(quizData);
      // Le toast est géré dans le hook useJobInterviewMutations
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
      console.error("Error creating quiz:", error);
    }
  };

  const handleUpdateQuiz = async (quizId: string, quizData: any) => {
    try {
      await updateJobQuiz.mutateAsync({ id: quizId, data: quizData });
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteJobQuiz.mutateAsync(quizId);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const handleScheduleInterview = () => {
    toast.info("Planification d'entretien - Fonctionnalité à venir");
  };

  // Gestion des erreurs de chargement des quizzes
  if (quizzesError) {
    toast.error("Erreur lors du chargement des tests");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-blue-50/30 dark:from-slate-950 dark:via-green-950/10 dark:to-blue-950/10">
      <div className="container mx-auto px-4 py-8">
        <EnterpriseHeader
          onCreateJobClick={() => setCreateModalOpen(true)}
          onCreateQuizClick={() =>
            toast.info(
              "Utilisez le bouton 'Nouveau Test' dans l'onglet Tests & Quiz"
            )
          }
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Timeline
              jobOffers={jobs.map(job => ({
                id: job.id,
                title: job.title,
                company: job.companyName,
                location: job.location || "Non spécifié",
                salary: job.salaryMin && job.salaryMax 
                  ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}`
                  : job.salaryMin 
                  ? `À partir de ${job.salaryMin.toLocaleString()} ${job.currency}`
                  : "À discuter",
                type: job.type,
                applicants: job.applicants,
                status: job.status,
              }))}
              selectedOffer={selectedOffer}
              onSelectOffer={setSelectedOffer}
              loading={loadingJobs}
            />
            <QuickStats 
              jobOffers={jobs.map(job => ({
                id: job.id,
                title: job.title,
                company: job.companyName,
                location: job.location || "Non spécifié",
                salary: job.salaryMin && job.salaryMax 
                  ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}`
                  : job.salaryMin 
                  ? `À partir de ${job.salaryMin.toLocaleString()} ${job.currency}`
                  : "À discuter",
                type: job.type,
                applicants: job.applicants,
                status: job.status,
              }))} 
              quizzes={quizzes} 
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <SearchFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
            />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
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
                  {isLoadingQuizzes && (
                    <span className="animate-pulse">...</span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  <User className="w-4 h-4" />
                  Candidatures
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
                  loading={loadingJobs}
                  jobs={jobs}
                  refetchJobs={refetchJobs}
                />
              </TabsContent>


              <TabsContent value="quizzes" className="space-y-6">
                <QuizzesTab
                  quizzes={filteredQuizzes as any}
                  onCreateQuiz={handleCreateQuiz}
                  onUpdateQuiz={handleUpdateQuiz}
                  onDeleteQuiz={handleDeleteQuiz}
                  isLoading={isLoadingQuizzes}
                  isCreating={isCreating || isUpdating || isDeleting}
                />
              </TabsContent>

              <TabsContent value="interviews">
                <InterviewsTab onScheduleInterview={handleScheduleInterview} />
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <ApplicationsTab
                />
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
  );
}
