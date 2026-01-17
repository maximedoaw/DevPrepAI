"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Briefcase, FileText, Video, Settings, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useJobInterviewMutations,
  useUserJobQuizzes,
} from "@/hooks/useJobInterview";
import { toast } from "sonner";
import { JobFormData } from "@/lib/validations/job-validation-form";
import { Timeline } from "@/components/enterprise/enterprise-interview/timeline";
import { QuickStats } from "@/components/enterprise/enterprise-interview/quick-stats";
import { SearchFilters } from "@/components/enterprise/enterprise-interview/search-filter";
import { JobOffersTab } from "@/components/enterprise/enterprise-interview/job-offers-tab";
import { QuizzesTab } from "@/components/enterprise/enterprise-interview/quizzes-tab";
import { InterviewsTab } from "@/components/enterprise/enterprise-interview/interviews-tab";
import { SettingsTab } from "@/components/enterprise/enterprise-interview/settings-tab";
import { CreateJobModal } from "@/components/enterprise/enterprise-interview/create-job-modal";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useUserJobQueries } from "@/hooks/useJobQueries";
import { ApplicationsTab } from "@/components/enterprise/enterprise-interview/applications-tabs";
import { PageBanner } from "@/components/shared/Banner"

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

  // Extraction des données depuis la réponse API avec sécurisation du typage
  type JobQuizzesByUserResponse = {
    data?: any[];
  };

  const quizzesData =
    ((quizzesResponse as JobQuizzesByUserResponse | undefined)?.data ?? []);

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

  const filteredQuizzes = useMemo(
    () =>
      quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.technology.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      ),
    [quizzes, searchTerm]
  );

  const handleCreateJob = useCallback(async (_data: JobFormData) => {
    refetchJobs();
  }, [refetchJobs]);

  const handleCreateQuiz = useCallback(
    async (quizData: any) => {
      try {
        await createJobQuiz.mutateAsync(quizData);
      } catch (error) {
        console.error("Error creating quiz:", error);
      }
    },
    [createJobQuiz]
  );

  const handleUpdateQuiz = useCallback(
    async (quizId: string, quizData: any) => {
      try {
        await updateJobQuiz.mutateAsync({ id: quizId, data: quizData });
      } catch (error) {
        console.error("Error updating quiz:", error);
      }
    },
    [updateJobQuiz]
  );

  const handleDeleteQuiz = useCallback(
    async (quizId: string) => {
      try {
        await deleteJobQuiz.mutateAsync(quizId);
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    },
    [deleteJobQuiz]
  );

  const handleScheduleInterview = useCallback(() => {
    toast.info("Planification d'entretien - Fonctionnalité à venir");
  }, []);

  // Gestion des erreurs de chargement des quizzes
  useEffect(() => {
    if (quizzesError) {
      toast.error("Erreur lors du chargement des tests");
    }
  }, [quizzesError]);

  const timelineEntries = useMemo(
    () =>
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.companyName,
        location: job.location || "Non spécifié",
        salary:
          job.salaryMin && job.salaryMax
            ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}`
            : job.salaryMin
              ? `À partir de ${job.salaryMin.toLocaleString()} ${job.currency}`
              : "À discuter",
        type: job.type,
        applicants: job.applicants,
        status: job.status,
      })),
    [jobs]
  );

  const quickStatsJobEntries = useMemo(
    () =>
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.companyName,
        location: job.location || "Non spécifié",
        salary:
          job.salaryMin && job.salaryMax
            ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency}`
            : job.salaryMin
              ? `À partir de ${job.salaryMin.toLocaleString()} ${job.currency}`
              : "À discuter",
        type: job.type,
        applicants: job.applicants,
        status: job.status,
      })),
    [jobs]
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Premium Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <PageBanner
          badge={{ text: "Espace Recruteur", icon: Briefcase }}
          title={
            <>
              Gestion des <br />
              <span className="text-emerald-100">Talents</span>
            </>
          }
          description="Pilotez vos recrutements, créez des tests techniques et suivez vos candidats en temps réel."
          stats={[
            { value: jobs.length, label: "Total Offres" },
            { value: jobs.filter(j => j.status === 'active').length, label: "Actives" },
            { value: jobs.filter(j => j.status === 'paused').length, label: "En Pause" },
            { value: jobs.filter(j => j.status === 'closed').length, label: "Clôturées" },
            { value: quizzes.length, label: "Tests Créés" }
          ]}
          actions={
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-emerald-600 hover:bg-emerald-50 font-semibold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <Briefcase className="w-4 h-4" />
                Créer une offre
              </button>
              <button
                onClick={() => toast.info("Utilisez le bouton 'Nouveau Test' dans l'onglet Tests & Quiz")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700/50 text-white hover:bg-emerald-700/70 font-semibold rounded-xl backdrop-blur-sm border border-emerald-400/30 transition-all hover:scale-105 w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                Nouveau Test
              </button>
            </div>
          }
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content (Left) - Swapped expecting sidebar on right or keeps left? Original was Sidebar Left (1/4) Content Right (3/4). Let's keep Sidebar Left but visually improved */}

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions Card if needed, or just Timeline/Stats */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  Offres Récentes
                </h3>
              </div>
              <div className="p-2">
                <Timeline
                  jobOffers={timelineEntries}
                  selectedOffer={selectedOffer}
                  onSelectOffer={setSelectedOffer}
                  loading={loadingJobs}
                />
              </div>
            </div>

            {/* Note: QuickStats was partially redundant with banner stats, but maybe keeps detailed view? kept for now */}
          </div>

          {/* Tabs Content */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-1">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-t-3xl border-b border-slate-100 dark:border-slate-800 p-2 sm:p-4 overflow-x-auto scrollbar-hide">
                  <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 h-auto p-1 gap-1 flex w-max sm:w-auto sm:inline-flex">
                    <TabsTrigger
                      value="offers"
                      className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Offres
                    </TabsTrigger>
                    <TabsTrigger
                      value="quizzes"
                      className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Tests & Quiz
                    </TabsTrigger>
                    <TabsTrigger
                      value="applications"
                      className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Candidats
                    </TabsTrigger>
                    <TabsTrigger
                      value="interviews"
                      className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Entretiens
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="px-3 py-2 sm:px-4 sm:py-2.5 text-sm rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6 min-h-[500px]">
                  <SearchFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterType={filterType}
                    onFilterTypeChange={setFilterType}
                  />

                  <div className="mt-8">
                    <TabsContent value="offers" className="space-y-6 m-0 focus-visible:ring-0 outline-none">
                      <JobOffersTab
                        onCreateJobClick={() => setCreateModalOpen(true)}
                        loading={loadingJobs}
                        jobs={jobs}
                        refetchJobs={refetchJobs}
                      />
                    </TabsContent>

                    <TabsContent value="quizzes" className="space-y-6 m-0 focus-visible:ring-0 outline-none">
                      <QuizzesTab
                        quizzes={filteredQuizzes as any}
                        onCreateQuiz={handleCreateQuiz}
                        onUpdateQuiz={handleUpdateQuiz}
                        onDeleteQuiz={handleDeleteQuiz}
                        isLoading={isLoadingQuizzes}
                        isCreating={isCreating || isUpdating || isDeleting}
                      />
                    </TabsContent>

                    <TabsContent value="interviews" className="m-0 focus-visible:ring-0 outline-none">
                      <InterviewsTab onScheduleInterview={handleScheduleInterview} />
                    </TabsContent>

                    <TabsContent value="applications" className="space-y-6 m-0 focus-visible:ring-0 outline-none">
                      <ApplicationsTab jobId={selectedOffer} />
                    </TabsContent>
                    <TabsContent value="settings" className="m-0 focus-visible:ring-0 outline-none">
                      <SettingsTab />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>
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
