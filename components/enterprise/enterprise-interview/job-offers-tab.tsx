"use client";

import { useState, useMemo, useEffect, use } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Trash2,
  Edit3,
  Eye,
  Grid3X3,
  Table,
  Search,
  Filter,
  MoreVertical,
  Building,
  Zap,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserJobQueries, useJobMutations } from "@/hooks/use-job-queries";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { DeleteJobModal } from "./delete-job-modal";
import { Pagination } from "./pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { EditJobModal } from "./edit-job-modal";
import { toast } from "sonner";

type ViewMode = "grid" | "table";
type JobStatus = "active" | "paused" | "closed";

interface JobOffer {
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
  status: JobStatus;
  experienceLevel?: string;
  workMode: string;
  isActive: boolean;
  userId: string;
  companyId?: string;
}

interface JobOffersTabProps {
  onCreateJobClick: () => void;
}

const ITEMS_PER_PAGE = 9;

const JobCardSkeleton = () => (
  <Card className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-slate-700" />
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-7 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TableRowSkeleton = () => (
  <TableRow className="border-b border-slate-100 dark:border-slate-800">
    <TableCell className="p-4">
      <Skeleton className="h-5 w-48 mb-2" />
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell className="p-4">
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell className="p-4">
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell className="p-4">
      <Skeleton className="h-6 w-16" />
    </TableCell>
    <TableCell className="p-4">
      <Skeleton className="h-6 w-14" />
    </TableCell>
    <TableCell className="p-4">
      <Skeleton className="h-4 w-8" />
    </TableCell>
    <TableCell className="p-4">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="p-4">
      <div className="flex gap-1">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </TableCell>
  </TableRow>
);

const StatsCardSkeleton = () => (
  <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-7 w-12" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </CardContent>
  </Card>
);

export function JobOffersTab({ onCreateJobClick }: JobOffersTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobOffer | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);
  const [updatingJobs, setUpdatingJobs] = useState<Set<string>>(new Set());

  const { user } = useKindeBrowserClient();
  const { jobs, loadingJobs, refetchJobs } = useUserJobQueries(user?.id);
  const { deleteJobMutation, updateJobMutation } = useJobMutations();

  const handleEditClick = (job: JobOffer) => {
    setEditingJob(job);
    setEditModalOpen(true);
  };

  const handleToggleStatus = async (job: JobOffer, newStatus: boolean) => {
    // Ajoute le job à la liste des mises à jour en cours
    setUpdatingJobs((prev) => new Set(prev).add(job.id));

    try {
      await updateJobMutation.mutateAsync({
        id: job.id,
        data: {
          isActive: newStatus,
        },
      });
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      // Toast d'erreur optionnel
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      // Retire le job de la liste des mises à jour en cours
      setUpdatingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
    }
  };

  // Fonction utilitaire pour vérifier si un job est en cours de mise à jour
  const isJobUpdating = (jobId: string) => updatingJobs.has(jobId);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "closed":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case "active":
        return "Actif";
      case "paused":
        return "En pause";
      case "closed":
        return "Clôturé";
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      FULL_TIME:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      PART_TIME:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      CONTRACT:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      INTERNSHIP:
        "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      CDI: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    };
    return (
      typeColors[type] ||
      "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
    );
  };

  const formatSalary = (
    min?: number,
    max?: number,
    currency: string = "FCFA"
  ) => {
    if (!min && !max) return "Salaire non spécifié";
    if (min && max)
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    if (min) return `À partir de ${min.toLocaleString()} ${currency}`;
    if (max) return `Jusqu'à ${max.toLocaleString()} ${currency}`;
    return "Salaire non spécifié";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteClick = (job: JobOffer) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    try {
      await deleteJobMutation.mutateAsync(jobToDelete.id);
      setDeleteModalOpen(false);
      setJobToDelete(null);
      refetchJobs();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Filtrage et pagination - Afficher TOUTES les offres sans exception
  const filteredJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];

    return jobs.filter((job) => {
      const matchesSearch =
        searchTerm === "" ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some((skill: string) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;
      const matchesType = typeFilter === "all" || job.type === typeFilter;

      // Afficher TOUTES les offres qui correspondent aux critères
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, searchTerm, statusFilter, typeFilter]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  if (loadingJobs) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-[150px]" />
                    <Skeleton className="h-10 w-[150px]" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        )}

        {viewMode === "table" && (
          <Card className="border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <UITable>
                  <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </TableHead>
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </TableHead>
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-14" />
                      </TableHead>
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead className="p-4">
                        <Skeleton className="h-4 w-8" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))}
                  </TableBody>
                </UITable>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Total
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {jobs.length}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Actives
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {jobs.filter((job) => job.status === "active").length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  En pause
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {jobs.filter((job) => job.status === "paused").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                  Clôturées
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {jobs.filter((job) => job.status === "closed").length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'actions */}
      <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par titre, entreprise, compétence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="paused">En pause</SelectItem>
                      <SelectItem value="closed">Clôturé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="FULL_TIME">Temps plein</SelectItem>
                      <SelectItem value="PART_TIME">Temps partiel</SelectItem>
                      <SelectItem value="CONTRACT">Contrat</SelectItem>
                      <SelectItem value="INTERNSHIP">Stage</SelectItem>
                      <SelectItem value="CDI">CDI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 rounded-r-none ${
                    viewMode === "grid"
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={`px-3 rounded-l-none ${
                    viewMode === "table"
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Table className="w-4 h-4" />
                </Button>
              </div>

              <Button
                className="bg-green-600 hover:bg-green-700 shadow-sm"
                onClick={onCreateJobClick}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Nouvelle offre
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Mes offres d'emploi
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {filteredJobs.length} offre(s) trouvée(s) sur {jobs.length} au total
            {filteredJobs.length > 0 && (
              <span className="ml-2">
                ({jobs.filter((job) => job.isActive).length} actives,
                {jobs.filter((job) => !job.isActive).length} inactives)
              </span>
            )}
          </p>
        </div>

        {totalPages > 1 && (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} sur {totalPages}
          </div>
        )}
      </div>

      {/* Affichage en grille */}
      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedJobs.map((job) => (
            <Card
              key={job.id}
              className="group relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-green-300 dark:hover:border-green-600"
            >
              {/* Indicateur de statut */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  getStatusColor(job.status).split(" ")[0]
                }`}
              />

              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={getTypeColor(job.type)}>
                    {job.type.replace("_", " ")}
                  </Badge>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge
                      variant="outline"
                      className={getStatusColor(job.status)}
                    >
                      {getStatusText(job.status)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          job.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-slate-500 dark:text-slate-400">
                        {job.isActive ? "Visible" : "Masquée"}
                      </span>
                    </div>
                  </div>
                </div>

                <CardTitle className="text-xl mb-2 text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                  {job.title}
                </CardTitle>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">{job.companyName}</span>
                </div>

                <CardDescription className="line-clamp-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {job.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informations principales */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {job.location || "Non spécifié"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>{job.applicants} candidat(s)</span>
                  </div>
                </div>

                {/* Compétences */}
                <div className="flex flex-wrap gap-1">
                  {job.skills
                    .slice(0, 4)
                    .map((skill: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  {job.skills.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{job.skills.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Footer avec actions */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(job.createdAt)}</span>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => handleEditClick(job)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteClick(job)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Affichage en tableau */}
      {viewMode === "table" && (
        <Card className="border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <UITable>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Poste/Entreprise
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Localisation
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Salaire
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Type
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Candidats
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Date
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Statut
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all duration-200 group"
                    >
                      <TableCell className="p-4">
                        <div className="space-y-1.5">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                            {job.title}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Building className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{job.companyName}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                          <span className="text-sm">
                            {job.location || "Non spécifié"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                          {formatSalary(
                            job.salaryMin,
                            job.salaryMax,
                            job.currency
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <Badge
                          variant="secondary"
                          className={`${getTypeColor(
                            job.type
                          )} font-medium text-xs px-2.5 py-1`}
                        >
                          {job.type.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {job.applicants}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            candidat{job.applicants > 1 ? "s" : ""}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatDate(job.createdAt)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Créé
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Switch
                              checked={job.isActive}
                              onCheckedChange={(checked) =>
                                handleToggleStatus(job, checked)
                              }
                              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600"
                              disabled={isJobUpdating(job.id)}
                            />
                          </div>
                          <div className="flex flex-col min-w-[80px]">
                            <span
                              className={`text-sm font-semibold ${
                                job.isActive
                                  ? "text-green-700 dark:text-green-400"
                                  : "text-amber-700 dark:text-amber-400"
                              }`}
                            >
                              {job.isActive ? "Actif" : "Inactif"}
                            </span>

                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-transform"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110 transition-transform"
                            onClick={() => handleEditClick(job)}
                            title="Modifier l'offre"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 transition-transform"
                            onClick={() => handleDeleteClick(job)}
                            title="Supprimer l'offre"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
            </div>
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {filteredJobs.length === 0 && (
        <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-center py-16">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              {jobs.length === 0
                ? "Aucune offre créée"
                : "Aucune offre trouvée"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {jobs.length === 0
                ? "Commencez par créer votre première offre d'emploi et attirez les meilleurs talents."
                : "Aucune offre ne correspond à vos critères de recherche. Essayez de modifier vos filtres."}
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 shadow-sm px-6"
              onClick={onCreateJobClick}
              size="lg"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Créer une offre
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="pt-6"
        />
      )}

      {/* Modal de suppression */}
      <DeleteJobModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        jobTitle={jobToDelete?.title || ""}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteJobMutation.isPending}
      />

      {/* Modal d'édition */}
      <EditJobModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        job={editingJob as any}
      />
    </div>
  );
}
