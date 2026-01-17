"use client";

import { useState, useMemo, useEffect } from "react";
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
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
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
import { useJobMutations } from "@/hooks/useJobQueries";
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
  loading: boolean;
  jobs: JobOffer[];
  refetchJobs: () => void;
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

export function JobOffersTab({ onCreateJobClick, jobs, loading, refetchJobs }: JobOffersTabProps) {
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

  const { deleteJobMutation, updateJobMutation } = useJobMutations();

  const handleEditClick = (job: JobOffer) => {
    setEditingJob(job);
    setEditModalOpen(true);
  };

  const handleToggleStatus = async (job: JobOffer, newStatus: boolean) => {
    setUpdatingJobs((prev) => new Set(prev).add(job.id));
    try {
      await updateJobMutation.mutateAsync({
        id: job.id,
        data: {
          isActive: newStatus,
        },
      });
      refetchJobs();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
    }
  };

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
      FULL_TIME: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      PART_TIME: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      CONTRACT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      INTERNSHIP: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      CDI: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    };
    return typeColors[type] || "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300";
  };

  const formatSalary = (min?: number, max?: number, currency: string = "FCFA") => {
    if (!min && !max) return "Salaire non spécifié";
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
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

      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      const matchesType = typeFilter === "all" || job.type === typeFilter;
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

  if (loading) {
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
                  <div className="flex-1 text-slate-400">
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
                      <TableHead className="p-4"><Skeleton className="h-4 w-32" /></TableHead>
                      <TableHead className="p-4"><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead className="p-4"><Skeleton className="h-4 w-32" /></TableHead>
                      <TableHead className="p-4"><Skeleton className="h-4 w-16" /></TableHead>
                      <TableHead className="p-4"><Skeleton className="h-4 w-14" /></TableHead>
                      <TableHead className="p-4"><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead className="p-4"><Skeleton className="h-4 w-20" /></TableHead>
                      <TableHead className="p-4"><Skeleton className="h-4 w-8" /></TableHead>
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
      {/* Barre d'actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par titre, entreprise, compétence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
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
                <SelectTrigger className="w-[150px] border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
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
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-slate-100 dark:bg-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`px-3 rounded-md transition-all ${viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={`px-3 rounded-md transition-all ${viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            onClick={onCreateJobClick}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Nouvelle offre
          </Button>
        </div>
      </div>

      {/* Résultats info */}
      <div className="flex items-center justify-between px-1">
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''}
          <span className="text-slate-400 ml-2 font-normal">
            sur {jobs.length} total
          </span>
        </p>

        {totalPages > 1 && (
          <div className="text-sm text-slate-500">
            Page {currentPage} / {totalPages}
          </div>
        )}
      </div>

      {/* Affichage en Grille */}
      {viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`absolute top-6 right-6 w-2.5 h-2.5 rounded-full ${job.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div className="mb-4">
                <Badge variant="outline" className={`mb-3 ${getTypeColor(job.type)} border-0`}>
                  {job.type.replace("_", " ")}
                </Badge>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  {job.companyName}
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">
                {job.description}
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-500/70" />
                  <span className="truncate">{job.location || "Remote"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <DollarSign className="w-4 h-4 text-emerald-500/70" />
                  <span className="truncate">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4 text-emerald-500/70" />
                  <span>{job.applicants} candidats</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <span className="text-xs text-slate-400 font-medium">{formatDate(job.createdAt)}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleEditClick(job)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDeleteClick(job)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Affichage en Liste */}
      {viewMode === "table" && (
        <div className="space-y-3">
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(job.status)}`}>
                    {getStatusText(job.status)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {job.companyName}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || "Remote"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(job.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 md:px-4 md:border-l md:border-r border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <span className="block text-lg font-bold text-slate-900 dark:text-white">{job.applicants}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Candidats</span>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {job.type.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 md:pl-2">
                <div className="flex items-center gap-3 mr-4">
                  <Switch
                    checked={job.isActive}
                    onCheckedChange={(checked) => handleToggleStatus(job, checked)}
                    className="data-[state=checked]:bg-emerald-600 h-5 w-9"
                    disabled={isJobUpdating(job.id)}
                  />
                </div>
                <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600">
                  <Eye className="w-4 h-4" /> Détails
                </Button>
                <Button onClick={() => handleEditClick(job)} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleDeleteClick(job)} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* État vide */}
      {filteredJobs.length === 0 && (
        <Card className="border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-center py-16">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              {jobs.length === 0 ? "Aucune offre créée" : "Aucune offre trouvée"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {jobs.length === 0
                ? "Commencez par créer votre première offre d'emploi et attirez les meilleurs talents."
                : "Aucune offre ne correspond à vos critères de recherche. Essayez de modifier vos filtres."}
            </p>
            <Button className="bg-green-600 hover:bg-green-700 shadow-sm px-6" onClick={onCreateJobClick} size="lg">
              <Briefcase className="w-4 h-4 mr-2" /> Créer une offre
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals & Pagination */}
      <DeleteJobModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        jobTitle={jobToDelete?.title || ""}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteJobMutation.isPending}
      />

      {editingJob && (
        <EditJobModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          job={editingJob as any}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
