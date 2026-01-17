"use client";

import { usePortfolioBuilder } from "@/hooks/usePortfolioBuilder";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Mail,
  MapPin,
  Star,
  FileText,
  Briefcase,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  MessageSquare,
  Loader,
  ChevronLeft,
  X // Added X icon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserJobQueries } from "@/hooks/useJobQueries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobApplications } from "@/actions/job.action";
import { updateApplication } from "@/actions/application.action";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
type ApplicationStatus = "pending" | "accepted" | "rejected";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  avatar?: string;
  skills: string[];
}

interface MotivationAnalysis {
  rating: number; // 1-5
  feedback: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface Application {
  id: string;
  candidate: Candidate;
  status: ApplicationStatus;
  coverLetter?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  appliedAt: string;
  lastUpdated: string;
  score?: number | null;
  motivationAnalysis?: MotivationAnalysis;
}

const mapStatusToUI = (status: string): ApplicationStatus => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "HIRED":
    case "ACCEPTED":
      return "accepted";
    case "REJECTED":
      return "rejected";
    default:
      return "pending";
  }
};

// --- Application Details View (Right Panel) ---
// Add import at the top (I will add it in a separate block or assume it is handled if I could edit top, but I can't easily here without strict lines. I will use a separate block for import).
// Actually, I will make the edit to the component first, assuming import will be added.

const ApplicationDetailView = ({ application, jobId }: { application: Application; jobId: string | null }) => {
  const { portfolio: candidatePortfolio, isLoading: loadingPortfolio } = usePortfolioBuilder({
    userId: application.candidate.id,
    enabled: !!application.candidate.id
  });
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateApplication(application.id, { status: newStatus.toUpperCase() });
      // The action returns the updated application object directly in some versions, or a result object.
      // Based on action code: return result (the prisma object).
      toast.success(`Candidature ${newStatus === 'accepted' ? 'acceptée' : 'refusée'} !`);

      // Invalidate specific query to re-fetch from DB
      await queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      await queryClient.refetchQueries({ queryKey: ['job-applications', jobId] }); // Force refetch

    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du statut.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 bg-white dark:bg-slate-950">

      {/* Header Profile */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-slate-100 dark:border-slate-800">
            <AvatarImage src={application.candidate.avatar || candidatePortfolio?.avatarUrl} />
            <AvatarFallback className="text-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {application.candidate.firstName?.[0] || "C"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {application.candidate.firstName} {application.candidate.lastName}
            </h2>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{application.candidate.email}</span>
              {application.candidate.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{application.candidate.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center justify-end">
          <Select
            value={application.status}
            onValueChange={(val) => handleStatusUpdate(val as ApplicationStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger
              className={cn(
                "w-auto h-9 px-3 rounded-full border-0 font-medium transition-all shadow-sm ring-1 ring-inset text-xs sm:text-sm",
                application.status === 'accepted' && "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800",
                application.status === 'rejected' && "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800",
                application.status === 'pending' && "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800"
              )}
            >
              <div className="flex items-center gap-1.5">
                {isUpdating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : (
                  <>
                    {application.status === 'accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {application.status === 'rejected' && <X className="w-3.5 h-3.5" />}
                    {application.status === 'pending' && <Sparkles className="w-3.5 h-3.5" />}
                  </>
                )}
                <span className="capitalize font-semibold">
                  {application.status === 'accepted' ? 'Accepté' : application.status === 'rejected' ? 'Refusé' : 'En attente'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="w-[200px]">
              <SelectItem value="accepted" className="text-emerald-700 dark:text-emerald-400 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Accepter le candidat
                </div>
              </SelectItem>
              <SelectItem value="rejected" className="text-red-700 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4" /> Refuser le candidat
                </div>
              </SelectItem>
              <SelectItem value="pending" className="text-amber-700 dark:text-amber-400 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-900/20 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Mettre en attente
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Analysis Card - Stars Only */}
      {application.motivationAnalysis && (
        <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-100 dark:border-indigo-800/50 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-indigo-900 dark:text-indigo-100 text-sm">Motivation</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= (application.motivationAnalysis?.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 dark:fill-slate-800 text-slate-200 dark:text-slate-800"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Content: CV, Letter, Portfolio */}
      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 mb-6 rounded-lg h-auto">
          <TabsTrigger value="resume" className="gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 shadow-sm"><FileText className="w-4 h-4" /> CV</TabsTrigger>
          <TabsTrigger value="coverLetter" className="gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 shadow-sm"><MessageSquare className="w-4 h-4" /> Lettre</TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 shadow-sm"><Briefcase className="w-4 h-4" /> Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="min-h-[500px]">
          {application.resumeUrl ? (
            <iframe src={application.resumeUrl} className="w-full h-[600px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50" />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">Aucun CV disponible</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="coverLetter">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
            <CardContent className="p-8 font-serif leading-loose text-lg text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {application.coverLetter || "Aucune lettre de motivation fournie."}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          {candidatePortfolio ? (
            <div className="space-y-6">
              <Card className="overflow-hidden border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="h-48 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                  {/* bannerUrl might not exist on type, using safe access or fallback */}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white drop-shadow-md">{candidatePortfolio.title}</h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-slate-600 dark:text-slate-300 mb-6 line-clamp-3">{candidatePortfolio.bio || "Aucune bio."}</p>
                  <Button variant="outline" className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50" asChild>
                    <a href={`/portfolio/${candidatePortfolio.id}`} target="_blank" rel="noopener noreferrer">
                      Voir le portfolio complet <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Skills */}
              {candidatePortfolio.skills && candidatePortfolio.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Compétences du Portfolio</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidatePortfolio.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <Briefcase className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">Aucun portfolio disponible</p>
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};


// --- Main Split Layout Component ---
export function ApplicationsTab({ jobId }: { jobId: string | null }) {
  // const { selectedJob } = useUserJobQueries(); // Removed incorrect usage
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [analyzingLetters, setAnalyzingLetters] = useState(false);
  const queryClient = useQueryClient();

  // Data fetching logic
  const { data: applications = [], refetch: refetchApplications, error, isLoading } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      console.log("Fetching applications for jobId:", jobId);
      if (!jobId) return [];
      try {
        const apps = await getJobApplications(jobId);
        console.log("Fetched apps:", apps);
        return apps;
      } catch (e) {
        console.error("Error fetching apps:", e);
        throw e;
      }
    },
    enabled: !!jobId
  });

  // Auto-select first application on load if none selected
  useEffect(() => {
    if (applications.length > 0 && !selectedApplicationId) {
      setSelectedApplicationId(applications[0].id);
    }
  }, [applications, selectedApplicationId]);

  // Filtering & Sorting
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== "all") {
      result = result.filter(app => mapStatusToUI(app.status) === statusFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(app =>
        app.user.firstName?.toLowerCase().includes(lowerTerm) ||
        app.user.lastName?.toLowerCase().includes(lowerTerm) ||
        app.user.email?.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort by Motivation Rating (Desc) then Date (Desc)
    result.sort((a, b) => {
      const ratingA = (a.motivationAnalysis as any)?.rating || 0;
      const ratingB = (b.motivationAnalysis as any)?.rating || 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [applications, statusFilter, searchTerm]);

  const selectedApplication = useMemo(() =>
    applications.find(app => app.id === selectedApplicationId),
    [applications, selectedApplicationId]);

  // Empty State if no job selected
  if (!jobId) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center bg-white dark:bg-slate-950 border rounded-xl shadow-sm p-8 text-center text-slate-500">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Aucune offre sélectionnée
        </h3>
        <p className="max-w-sm">
          Veuillez sélectionner une offre à gauche pour voir les candidatures.
        </p>
      </div>
    );
  }


  if (error) return <div className="p-10 text-center text-red-500 bg-red-50 rounded-xl m-4">Erreur: {(error as Error).message}</div>;


  // AI Analysis Handler
  const analyzeMotivationLetters = async () => {
    setAnalyzingLetters(true);
    const appsToAnalyze = applications.filter(app =>
      app.coverLetter && app.coverLetter.length > 50 && (!app.motivationAnalysis)
    );

    if (appsToAnalyze.length === 0) {
      toast.info("Toutes les lettres éligibles ont déjà été analysées.");
      setAnalyzingLetters(false);
      return;
    }

    try {
      const payload = appsToAnalyze.map(app => ({
        applicationId: app.id,
        motivationLetter: app.coverLetter,
        candidateName: `${app.user.firstName} ${app.user.lastName}`
      }));

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "evaluate-motivation-letters",
          applications: payload
        })
      });

      if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

      const result = await response.json();

      if (!result.success || !result.data?.evaluations) {
        throw new Error("Format de réponse invalide de l'IA");
      }

      toast.success(`${result.data.evaluations.length} lettres analysées !`);
      // Invalidate query to re-fetch from DB (persistence check)
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });

    } catch (error) {
      console.error("AI Analysis Error Detail:", error);
      toast.error(`Erreur: ${(error as Error).message}`);
    } finally {
      setAnalyzingLetters(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] overflow-hidden bg-white dark:bg-slate-950 border rounded-xl shadow-sm relative">

      {/* --- Left Panel: Candidate List --- */}
      {/* Hidden on mobile if application selected (Detail view active) */}
      <div className={cn(
        "w-full md:w-1/3 lg:w-[380px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/10 transition-all absolute md:relative z-10 h-full",
        selectedApplicationId ? "hidden md:flex" : "flex"
      )}>

        {/* Search & Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-950">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un candidat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 bg-white dark:bg-slate-950 h-9 text-sm"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={analyzeMotivationLetters}
              disabled={analyzingLetters}
              title="Analyser les lettres (IA)"
              className={cn("h-9 w-9", analyzingLetters && "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20")}
            >
              {analyzingLetters ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">

          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
              <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          )}

          {!isLoading && filteredApplications.map((app) => {
            const analysis: any = app.motivationAnalysis;
            const isSelected = app.id === selectedApplicationId;

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApplicationId(app.id)}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border group relative",
                  isSelected
                    ? "bg-white dark:bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500 z-10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {app.user.firstName} {app.user.lastName}
                    {app.status === 'accepted' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 h-5">
                    {/* Rating Stars Mini */}
                    {analysis?.rating ? (
                      <div className="flex text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-1.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30">
                        {[...Array(analysis.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                    ) : (
                      <span className="italic text-slate-400 text-[10px] flex items-center gap-1 opacity-70">
                        <Sparkles className="w-3 h-3" /> IA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!isLoading && filteredApplications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm">Aucun candidat pour le moment.</p>
            </div>
          )}
        </div>
      </div>


      {/* --- Right Panel: Details (Rest) --- */}
      {/* Full width on mobile when selected, hidden when not selected */}
      <div className={cn(
        "flex-1 bg-white dark:bg-slate-950 relative h-full w-full md:w-auto overflow-hidden",
        !selectedApplicationId ? "hidden md:block" : "block"
      )}>
        {/* Mobile Back Button */}
        <div className="md:hidden border-b border-slate-100 dark:border-slate-800 p-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedApplicationId(null)} className="h-8 gap-1 pl-2 text-slate-500">
            <ChevronLeft className="w-4 h-4" /> Retour à la liste
          </Button>
        </div>

        {selectedApplication ? (
          <ApplicationDetailView
            jobId={jobId} // Pass the jobId
            application={{
              id: selectedApplication.id,
              status: mapStatusToUI(selectedApplication.status),
              appliedAt: selectedApplication.createdAt.toString(),
              lastUpdated: selectedApplication.updatedAt.toString(),
              coverLetter: selectedApplication.coverLetter || undefined,
              resumeUrl: selectedApplication.resumeUrl || undefined,
              portfolioUrl: selectedApplication.portfolioUrl || undefined,
              score: selectedApplication.score,
              candidate: {
                id: selectedApplication.user.id,
                firstName: selectedApplication.user.firstName || "",
                lastName: selectedApplication.user.lastName || "",
                email: selectedApplication.user.email,
                avatar: selectedApplication.user.imageUrl || undefined,
                skills: selectedApplication.user.skills || []
              },
              motivationAnalysis: selectedApplication.motivationAnalysis as any
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-medium text-lg text-slate-600 dark:text-slate-400">Sélectionnez une candidature</p>
            <p className="text-sm text-slate-400 mt-2">Détails, CV et lettre de motivation</p>
          </div>
        )}
      </div>

    </div>
  );
};