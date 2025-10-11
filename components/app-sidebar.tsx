"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Mic,
  Code,
  Settings,
  BookOpen,
  Trophy,
  Users,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Menu,
  Shield,
  Home,
  TrendingUp,
  Star,
  Zap,
  Briefcase,
  UsersRound,
  Moon,
  Sun,
  LogOut,
  User,
  FileText,
  BarChart,
  Award,
  ClipboardList,
  Building,
  GraduationCap,
  School,
  UserCheck,
  PlusCircle,
  Calendar,
  Network,
  Handshake,
  MapPin,
  MessageSquare,
  Lightbulb,
  Rocket,
  Heart,
  GitBranch,
  Brain,
  BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getUserRoleAndDomains } from "@/actions/user.action";

function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface SidebarOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  action: () => void;
  badge?: string;
  isNew?: boolean;
  isAdmin?: boolean;
  path?: string;
}

function InterviewSidebarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const { state } = useSidebar();
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const { theme } = useTheme();

  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await getUserRoleAndDomains(user.id);
      console.log("Le role de l'utilisateur est :", result);
      return result;
    },
  });

  if (isLoading || !isAuthenticated) return null;

  const userRole = userData?.role || "CANDIDATE";
  const isAdmin =
    userRole === "admin" ||
    userData?.role === "admin" ||
    user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  let sidebarOptions: SidebarOption[] = [];

  // Configuration pour CANDIDATE
  if (userRole === "CANDIDATE") {
    sidebarOptions = [
      {
        id: "dashboard",
        title: "Tableau de bord",
        description: "Vue d'ensemble de votre parcours",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor:
          "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
        action: () => router.push("/"),
        path: "/",
      },
      {
        id: "matching",
        title: "Portail d'emploi",
        description: "Offres correspondant à votre profil",
        icon: Network,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor:
          "bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700",
        action: () => router.push("/jobs"),
        badge: "Nouvelles offres",
        path: "/jobs",
      },
      {
        id: "interviews",
        title: "Interviews",
        description: "Simulations pour vos futurs entretiens",
        icon: BrainCircuit,
        color: "text-purple-600 dark:text-purple-400",
        bgColor:
          "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
        action: () => router.push("/interviews"),
        badge: "IA",
        //isNew: true,
        path: "/interviews",
      },
      {
        id: "skill-showcase",
        title: "Valorisation des compétences",
        description: "Mettez en lumière vos talents et expertises",
        icon: Target,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
        action: () => router.push("/skills-showcase"),
        path: "/skills-showcase",
      },
      {
        id: "guides",
        title: "Guides de progression",
        description: "Formations et conseils adaptés à vos objectifs",
        icon: BookOpen,
        color: "text-amber-600 dark:text-amber-400",
        bgColor:
          "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
        action: () => router.push("/guides"),
        path: "/guides",
      },
      {
        id: "my-interviews",
        title: "Mes entretiens",
        description: "Planification et suivi de vos entretiens",
        icon: Calendar,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor:
          "bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700",
        action: () => router.push("/my-interviews"),
        badge: "3 planifiés",
        path: "/my-interviews",
      },
    ];
  }

  // Configuration pour CAREER_CHANGER
  if (userRole === "CAREER_CHANGER") {
    sidebarOptions = [
      {
        id: "dashboard",
        title: "Mon parcours",
        description: "Vue globale de votre reconversion",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor:
          "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
        action: () => router.push("/"),
        path: "/",
      },
      {
        id: "interviews",
        title: "Interviews",
        description: "Simulations adaptées à votre nouveau métier",
        icon: Mic,
        color: "text-purple-600 dark:text-purple-400",
        bgColor:
          "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
        action: () => router.push("/interviews"),
        isNew: true,
        path: "/interviews",
      },
      {
        id: "plan",
        title: "Plan de transition",
        description: "Feuille de route personnalisée pour votre reconversion",
        icon: TrendingUp,
        color: "text-green-600 dark:text-green-400",
        bgColor:
          "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
        action: () => router.push("/plan"),
        path: "/plan",
      },
      {
        id: "skills",
        title: "Passerelles de compétences",
        description: "Valorisez vos acquis pour le nouveau domaine",
        icon: GitBranch,
        color: "text-amber-600 dark:text-amber-400",
        bgColor:
          "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
        action: () => router.push("/skills"),
        path: "/skills",
      },
      {
        id: "formations",
        title: "Formations intensives",
        description: "Programmes rapides pour accélérer votre transition",
        icon: GraduationCap,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor:
          "bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700",
        action: () => router.push("/formations"),
        path: "/formations",
      },
    ];
  }

  // Configuration pour RECRUITER
  if (userRole === "RECRUITER") {
    sidebarOptions = [
      {
        id: "dashboard",
        title: "Dashboard RH",
        description: "Vue globale de vos recrutements",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor:
          "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
        action: () => router.push("/"),
        path: "/",
      },
      {
        id: "talents",
        title: "Marketplace de talents",
        description: "Accédez à la base de candidats qualifiés",
        icon: Users,
        color: "text-purple-600 dark:text-purple-400",
        bgColor:
          "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
        action: () => router.push("/talents"),
        path: "/talents",
      },
      {
        id: "matching",
        title: "Matching candidats",
        description: "IA pour trouver les meilleurs profils",
        icon: Brain,
        color: "text-green-600 dark:text-green-400",
        bgColor:
          "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
        action: () => router.push("/matching"),
        path: "/matching",
      },
      {
        id: "interviews",
        title: "Planification d’interviews",
        description: "Organisez vos entretiens avec les candidats",
        icon: Calendar,
        color: "text-amber-600 dark:text-amber-400",
        bgColor:
          "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
        action: () => router.push("/interviews"),
        path: "/interviews",
      },
      {
        id: "rapports",
        title: "Analyse RH",
        description: "Rapports et indicateurs clés sur vos recrutements",
        icon: BarChart3,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor:
          "bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700",
        action: () => router.push("/rapports"),
        path: "/rapports",
      },
    ];
  }

  // Configuration pour ENTERPRISE
  if (userRole === "ENTERPRISE") {
    sidebarOptions = [
      {
        id: "dashboard",
        title: "Espace entreprise",
        description: "Pilotage de vos besoins en talents",
        icon: Building,
        color: "text-blue-600 dark:text-blue-400",
        bgColor:
          "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
        action: () => router.push("/enterprise"),
        path: "/enterprise",
      },
      {
        id: "interview-planning",
        title: "Planification d'entretiens",
        description: "Organisez vos entretiens en interne",
        icon: Calendar,
        color: "text-purple-600 dark:text-purple-400",
        bgColor:
          "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
        action: () => router.push("/enterprise-interviews"),
        badge: "15 cette semaine",
        path: "/enterprise-interviews",
      },
      {
        id: "talent-matching",
        title: "Matching de talents",
        description: "Trouvez les profils parfaits pour vos postes",
        icon: Network,
        color: "text-green-600 dark:text-green-400",
        bgColor:
          "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
        action: () => router.push("/talent-matching"),
        path: "/talent-matching",
      },
      {
        id: "workforce-planning",
        title: "Planification RH",
        description: "Anticipez vos besoins en compétences",
        icon: Target,
        color: "text-amber-600 dark:text-amber-400",
        bgColor:
          "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
        action: () => router.push("/workforce-planning"),
        path: "/workforce-planning",
      },
      {
        id: "bulk-hiring",
        title: "Recrutement en volume",
        description: "Solutions pour vos recrutements massifs",
        icon: UsersRound,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor:
          "bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700",
        action: () => router.push("/bulk-hiring"),
        path: "/bulk-hiring",
      },
      {
        id: "training-programs",
        title: "Programmes de formation",
        description: "Formation sur-mesure pour vos équipes",
        icon: GraduationCap,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor:
          "bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700",
        action: () => router.push("/training-programs"),
        path: "/training-programs",
      },
    ];
  }

  // Configuration pour BOOTCAMP
  if (userRole === "BOOTCAMP") {
    sidebarOptions = [
      {
        id: "dashboard",
        title: "Espace bootcamp",
        description: "Vue d'ensemble de votre cohorte",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor:
          "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
        action: () => router.push("/"),
        path: "/",
      },
      {
        id: "participants",
        title: "Gestion des apprenants",
        description: "Suivi individuel et collectif",
        icon: Users,
        color: "text-purple-600 dark:text-purple-400",
        bgColor:
          "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
        action: () => router.push("/participants"),
        path: "/participants",
      },
      {
        id: "curriculum",
        title: "Curriculum dynamique",
        description: "Programmes de formation ajustables",
        icon: BookOpen,
        color: "text-green-600 dark:text-green-400",
        bgColor:
          "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
        action: () => router.push("/curriculum"),
        path: "/curriculum",
      },
      {
        id: "placement",
        title: "Placement professionnel",
        description: "Statistiques et suivi d’insertion",
        icon: Briefcase,
        color: "text-amber-600 dark:text-amber-400",
        bgColor:
          "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
        action: () => router.push("/placement"),
        path: "/placement",
      },
      {
        id: "matching",
        title: "Matching entreprises",
        description: "Mettez en relation vos apprenants avec les recruteurs",
        icon: Handshake,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor:
          "bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700",
        action: () => router.push("/matching"),
        path: "/matching",
      },
    ];
  }

  // Configuration pour SCHOOL
  if (userRole === "SCHOOL") {
    sidebarOptions = [
      {
        id: "dashboard",
        title: "Espace école",
        description: "Vue globale de votre établissement",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor:
          "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
        action: () => router.push("/"),
        path: "/",
      },
      {
        id: "pedagogie",
        title: "Espace pédagogique",
        description: "Gestion des cours et ressources",
        icon: BookOpen,
        color: "text-purple-600 dark:text-purple-400",
        bgColor:
          "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
        action: () => router.push("/pedagogie"),
        path: "/pedagogie",
      },
      {
        id: "sessions",
        title: "Sessions de travail",
        description: "Calendrier et organisation des sessions",
        icon: Calendar,
        color: "text-green-600 dark:text-green-400",
        bgColor:
          "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
        action: () => router.push("/sessions"),
        path: "/sessions",
      },
      {
        id: "etudiants",
        title: "Suivi étudiant",
        description: "Progression et résultats des étudiants",
        icon: Users,
        color: "text-amber-600 dark:text-amber-400",
        bgColor:
          "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
        action: () => router.push("/etudiants"),
        path: "/etudiants",
      },
      {
        id: "carriere",
        title: "Services carrière",
        description: "Accompagnement à l’insertion professionnelle",
        icon: Briefcase,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor:
          "bg-gradient-to-r from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700",
        action: () => router.push("/carriere"),
        path: "/carriere",
      },
      {
        id: "visibilite",
        title: "Visibilité & partenariats",
        description: "Mettre en avant vos étudiants auprès des entreprises",
        icon: Handshake,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor:
          "bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700",
        action: () => router.push("/visibilite"),
        path: "/visibilite",
      },
    ];
  }

  // Ajouter l'option admin si nécessaire
  if (isAdmin) {
    sidebarOptions.push({
      id: "admin",
      title: "Administration",
      description: "Gestion de la plateforme",
      icon: Shield,
      color: "text-red-600 dark:text-red-400",
      bgColor:
        "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700",
      action: () => router.push("/admin"),
      badge: "Admin",
      isAdmin: true,
      path: "/admin",
    });
  }

  // Fonction pour obtenir le titre et la description du rôle
  const getRoleInfo = () => {
    switch (userRole) {
      case "CANDIDATE":
        return {
          title: "Accélérateur Carrière",
          subtitle: "Votre tremplin professionnel",
        };
      case "CAREER_CHANGER":
        return {
          title: "Reconversion Pro",
          subtitle: "Votre nouvelle carrière",
        };
      case "RECRUITER":
        return {
          title: "Espace Recruteur",
          subtitle: "Trouvez les meilleurs talents",
        };
      case "ENTERPRISE":
        return {
          title: "Solutions Entreprise",
          subtitle: "Talents à grande échelle",
        };
      case "BOOTCAMP":
        return {
          title: "Bootcamp Manager",
          subtitle: "Excellence pédagogique",
        };
      case "SCHOOL":
        return {
          title: "École & Université",
          subtitle: "Insertion professionnelle",
        };
      default:
        return {
          title: "Accélérateur Carrière",
          subtitle: "Développez votre potentiel",
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 custom-scrollbar"
      style={{
        width: state === "expanded" ? "280px" : "72px",
        minWidth: state === "expanded" ? "280px" : "72px",
        transition: "width 0.3s ease, min-width 0.3s ease",
      }}
    >
      <SidebarHeader className="border-b border-slate-100 dark:border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex-shrink-0">
            <Target className="h-6 w-6 text-white" />
          </div>
          {state === "expanded" && (
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
                {roleInfo.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {roleInfo.subtitle}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 flex-1 custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel
            className={`${
              state === "collapsed" ? "sr-only" : ""
            } text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2`}
          >
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {sidebarOptions.map((option) => {
                const isActive =
                  option.path &&
                  (pathname === option.path ||
                    (option.path !== "/" && pathname.startsWith(option.path)));
                return (
                  <SidebarMenuItem key={option.id}>
                    <SidebarMenuButton
                      onClick={option.action}
                      className={`h-auto p-3 transition-all duration-200 group relative overflow-hidden rounded-lg
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 shadow-md font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm"
                        }
                        ${
                          option.isAdmin
                            ? "border-l-4 border-red-500 dark:border-red-400"
                            : ""
                        }
                      `}
                      onMouseEnter={() => setHoveredOption(option.id)}
                      onMouseLeave={() => setHoveredOption(null)}
                      tooltip={state === "collapsed" ? option.title : undefined}
                    >
                      <div className="flex items-center gap-4 w-full relative z-10">
                        <div
                          className={`p-2.5 rounded-lg ${
                            option.bgColor
                          } shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0 ${
                            option.isAdmin
                              ? "ring-2 ring-red-200 dark:ring-red-800"
                              : ""
                          }`}
                        >
                          <option.icon className="h-5 w-5 text-white" />
                        </div>

                        {state === "expanded" && (
                          <>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3
                                  className={`font-semibold group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors truncate ${
                                    option.isAdmin
                                      ? "text-red-700 dark:text-red-300"
                                      : isActive
                                      ? "text-blue-700 dark:text-blue-300"
                                      : "text-slate-800 dark:text-slate-200"
                                  }`}
                                >
                                  {option.title}
                                </h3>
                                {option.isNew && (
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                    <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                                      Nouveau
                                    </Badge>
                                  </div>
                                )}
                                {option.isAdmin && (
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Zap className="h-3 w-3 text-red-500" />
                                    <Badge className="text-xs bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
                                      Admin
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-1">
                                {option.description}
                              </p>
                              {option.badge &&
                                !option.isNew &&
                                !option.isAdmin && (
                                  <Badge className="mt-2 text-xs bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                    {option.badge}
                                  </Badge>
                                )}
                            </div>

                            <ChevronRight
                              className={`h-4 w-4 text-slate-400 transition-all duration-200 flex-shrink-0 ${
                                hoveredOption === option.id
                                  ? "translate-x-1 text-slate-600 dark:text-slate-300"
                                  : ""
                              }`}
                            />
                          </>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section séparée pour les outils */}
        {state === "expanded" && (
          <>
            <Separator className="my-4 bg-slate-200 dark:bg-slate-800" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Outils
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => router.push("/settings")}
                      className="h-auto p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group relative overflow-hidden rounded-lg"
                      onMouseEnter={() => setHoveredOption("settings")}
                      onMouseLeave={() => setHoveredOption(null)}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                            Paramètres
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            Configuration de votre compte
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-slate-400 transition-all duration-200 flex-shrink-0 ${
                            hoveredOption === "settings"
                              ? "translate-x-1 text-slate-600 dark:text-slate-300"
                              : ""
                          }`}
                        />
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Section Communication pour certains rôles */}
                  {(userRole === "RECRUITER" ||
                    userRole === "ENTERPRISE" ||
                    userRole === "BOOTCAMP" ||
                    userRole === "SCHOOL") && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => router.push("/messages")}
                        className="h-auto p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group relative overflow-hidden rounded-lg"
                        onMouseEnter={() => setHoveredOption("messages")}
                        onMouseLeave={() => setHoveredOption(null)}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                              Messages
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                              Communications et notifications
                            </p>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 text-slate-400 transition-all duration-200 flex-shrink-0 ${
                              hoveredOption === "messages"
                                ? "translate-x-1 text-slate-600 dark:text-slate-300"
                                : ""
                            }`}
                          />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer avec informations utilisateur */}
      <SidebarFooter className="border-t border-slate-100 dark:border-slate-800 p-4">
        {state === "expanded" && user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.given_name?.[0]}
                  {user.family_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user.given_name} {user.family_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userRole === "CANDIDATE"
                    ? "Candidat"
                    : userRole === "CAREER_CHANGER"
                    ? "En reconversion"
                    : userRole === "RECRUITER"
                    ? "Recruteur"
                    : userRole === "ENTERPRISE"
                    ? "Entreprise"
                    : userRole === "BOOTCAMP"
                    ? "Bootcamp"
                    : userRole === "SCHOOL"
                    ? "École"
                    : "Utilisateur"}
                </p>
              </div>
              <ModeToggle />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9"
                onClick={() => router.push("/profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <LogoutLink>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-red-500 text-red-500 hover:bg-red-500/10"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </LogoutLink>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </SidebarFooter>

      {/* Styles pour la scrollbar personnalisée */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </Sidebar>
  );
}

export default function InterviewSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const { theme } = useTheme();

  if (isLoading || !isAuthenticated) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <InterviewSidebarContent />
        <main className="flex-1 overflow-hidden bg-white dark:bg-slate-950 transition-colors custom-scrollbar">
          {/* Header responsive */}
          <div className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors">
                  <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </SidebarTrigger>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* Contenu principal avec scroll */}
          <div className="p-6 overflow-auto h-[calc(100vh-73px)] custom-scrollbar">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
