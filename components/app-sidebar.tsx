"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getUserRoleAndDomains } from "@/actions/user.action";

// Logo personnalisé 
import Logo from "./logo";

// Icônes
import {
  Home,
  Network,
  BrainCircuit,
  Target,
  BookOpen,
  Calendar,
  TrendingUp,
  GitBranch,
  GraduationCap,
  Users,
  Brain,
  BarChart3,
  Building,
  UsersRound,
  Handshake,
  Briefcase,
  Shield,
  Settings,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Star,
  Zap,
  Rocket,
  Leaf,
} from "lucide-react";

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

function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors border border-emerald-200 dark:border-emerald-800"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 text-emerald-700 dark:text-emerald-300 block dark:hidden" />
      <Moon className="h-4 w-4 text-emerald-300 hidden dark:block" />
    </button>
  );
}

function SidebarContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const { theme } = useTheme();

  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await getUserRoleAndDomains(user.id);
      return result;
    },
  });

  // Ouvrir la sidebar sur desktop au chargement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/",
      },
      {
        id: "matching",
        title: "Portail d'emploi",
        description: "Offres correspondant à votre profil",
        icon: Network,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500 dark:bg-green-600",
        action: () => { 
          router.push("/jobs"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        badge: "Nouvelles offres",
        path: "/jobs",
      },
      {
        id: "interviews",
        title: "Interviews IA",
        description: "Simulations pour vos futurs entretiens",
        icon: BrainCircuit,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500 dark:bg-teal-600",
        action: () => { 
          router.push("/interviews"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        badge: "IA",
        isNew: true,
        path: "/interviews",
      },
      {
        id: "portfolio",
        title: "Portfolio & CV",
        description: "Mettez en lumière vos talents",
        icon: Target,
        color: "text-lime-600 dark:text-lime-400",
        bgColor: "bg-lime-500 dark:bg-lime-600",
        action: () => { 
          router.push("/portfolio"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/portfolio",
      },
      {
        id: "guides",
        title: "Guides de progression",
        description: "Formations et conseils personnalisés",
        icon: BookOpen,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500 dark:bg-amber-600",
        action: () => { 
          router.push("/guides"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/guides",
      },
      {
        id: "my-interviews",
        title: "Mes entretiens",
        description: "Planification et suivi",
        icon: Calendar,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-500 dark:bg-cyan-600",
        action: () => { 
          router.push("/my-interviews"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
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
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/",
      },
      {
        id: "interviews",
        title: "Interviews",
        description: "Simulations adaptées à votre nouveau métier",
        icon: BrainCircuit,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500 dark:bg-teal-600",
        action: () => { 
          router.push("/interviews"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        isNew: true,
        path: "/interviews",
      },
      {
        id: "plan",
        title: "Plan de transition",
        description: "Feuille de route personnalisée",
        icon: TrendingUp,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500 dark:bg-green-600",
        action: () => { 
          router.push("/plan"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/plan",
      },
      {
        id: "skills",
        title: "Passerelles de compétences",
        description: "Valorisez vos acquis",
        icon: GitBranch,
        color: "text-lime-600 dark:text-lime-400",
        bgColor: "bg-lime-500 dark:bg-lime-600",
        action: () => { 
          router.push("/skills"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/skills",
      },
      {
        id: "formations",
        title: "Formations intensives",
        description: "Programmes rapides pour votre transition",
        icon: GraduationCap,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/formations"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
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
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/",
      },
      {
        id: "talents",
        title: "Marketplace de talents",
        description: "Accédez à la base de candidats qualifiés",
        icon: Users,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500 dark:bg-teal-600",
        action: () => { 
          router.push("/talents"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/talents",
      },
      {
        id: "matching",
        title: "Matching candidats",
        description: "IA pour trouver les meilleurs profils",
        icon: Brain,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500 dark:bg-green-600",
        action: () => { 
          router.push("/matching"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/matching",
      },
      {
        id: "interviews",
        title: "Planification d'interviews",
        description: "Organisez vos entretiens",
        icon: Calendar,
        color: "text-lime-600 dark:text-lime-400",
        bgColor: "bg-lime-500 dark:bg-lime-600",
        action: () => { 
          router.push("/interviews"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/interviews",
      },
      {
        id: "rapports",
        title: "Analyse RH",
        description: "Rapports et indicateurs clés",
        icon: BarChart3,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-500 dark:bg-cyan-600",
        action: () => { 
          router.push("/rapports"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
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
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/",
      },
      {
        id: "interview-planning",
        title: "Planification d'entretiens",
        description: "Organisez vos entretiens en interne",
        icon: Calendar,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500 dark:bg-teal-600",
        action: () => { 
          router.push("/enterprise-interviews"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        badge: "15 cette semaine",
        path: "/enterprise-interviews",
      },
      {
        id: "talent-matching",
        title: "Matching de talents",
        description: "Trouvez les profils parfaits",
        icon: Network,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500 dark:bg-green-600",
        action: () => { 
          router.push("/talent-matching"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/talent-matching",
      },
      {
        id: "workforce-planning",
        title: "Planification RH",
        description: "Anticipez vos besoins en compétences",
        icon: Target,
        color: "text-lime-600 dark:text-lime-400",
        bgColor: "bg-lime-500 dark:bg-lime-600",
        action: () => { 
          router.push("/workforce-planning"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/workforce-planning",
      },
      {
        id: "bulk-hiring",
        title: "Recrutement en volume",
        description: "Solutions pour recrutements massifs",
        icon: UsersRound,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/bulk-hiring"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/bulk-hiring",
      },
      {
        id: "training-programs",
        title: "Programmes de formation",
        description: "Formation sur-mesure pour vos équipes",
        icon: GraduationCap,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-500 dark:bg-cyan-600",
        action: () => { 
          router.push("/training-programs"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
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
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/",
      },
      {
        id: "participants",
        title: "Gestion des apprenants",
        description: "Suivi individuel et collectif",
        icon: Users,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500 dark:bg-teal-600",
        action: () => { 
          router.push("/participants"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/participants",
      },
      {
        id: "curriculum",
        title: "Curriculum dynamique",
        description: "Programmes de formation ajustables",
        icon: BookOpen,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500 dark:bg-green-600",
        action: () => { 
          router.push("/curriculum"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/curriculum",
      },
      {
        id: "placement",
        title: "Placement professionnel",
        description: "Statistiques et suivi d'insertion",
        icon: Briefcase,
        color: "text-lime-600 dark:text-lime-400",
        bgColor: "bg-lime-500 dark:bg-lime-600",
        action: () => { 
          router.push("/placement"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/placement",
      },
      {
        id: "matching",
        title: "Matching entreprises",
        description: "Reliez vos apprenants aux recruteurs",
        icon: Handshake,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-500 dark:bg-cyan-600",
        action: () => { 
          router.push("/matching"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
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
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/",
      },
      {
        id: "pedagogie",
        title: "Espace pédagogique",
        description: "Gestion des cours et ressources",
        icon: BookOpen,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500 dark:bg-teal-600",
        action: () => { 
          router.push("/pedagogie"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/pedagogie",
      },
      {
        id: "sessions",
        title: "Sessions de travail",
        description: "Calendrier et organisation",
        icon: Calendar,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500 dark:bg-green-600",
        action: () => { 
          router.push("/sessions"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/sessions",
      },
      {
        id: "etudiants",
        title: "Suivi étudiant",
        description: "Progression et résultats",
        icon: Users,
        color: "text-lime-600 dark:text-lime-400",
        bgColor: "bg-lime-500 dark:bg-lime-600",
        action: () => { 
          router.push("/etudiants"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/etudiants",
      },
      {
        id: "carriere",
        title: "Services carrière",
        description: "Accompagnement professionnel",
        icon: Briefcase,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-500 dark:bg-cyan-600",
        action: () => { 
          router.push("/carriere"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
        path: "/carriere",
      },
      {
        id: "visibilite",
        title: "Visibilité & partenariats",
        description: "Mettez en avant vos étudiants",
        icon: Handshake,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500 dark:bg-emerald-600",
        action: () => { 
          router.push("/visibilite"); 
          if (window.innerWidth < 768) setSidebarOpen(false); 
        },
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
      bgColor: "bg-red-500 dark:bg-red-600",
      action: () => { 
        router.push("/admin"); 
        if (window.innerWidth < 768) setSidebarOpen(false); 
      },
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

  // Composant pour le logo compact (sidebar fermée)
  const CompactLogo = () => (
    <div className="flex items-center justify-center p-2">
      <div className="relative">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-full p-2 shadow-lg">
          <Leaf className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-emerald-100 dark:border-emerald-900/50 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "w-80 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-100 dark:border-emerald-900/50">
          {sidebarOpen ? (
            <Link href="/" className="flex items-center gap-3 min-w-0 flex-1">
              <Logo />
            </Link>
          ) : (
            <Link href="/" className="flex justify-center w-full">
              <CompactLogo />
            </Link>
          )}
          
          {/* Bouton menu pour ouvrir/fermer */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Menu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <div className="px-3 space-y-1">
            {sidebarOptions.map((option) => {
              const isActive =
                option.path &&
                (pathname === option.path ||
                  (option.path !== "/" && pathname.startsWith(option.path)));
              
              return (
                <div key={option.id} className="relative group">
                  <button
                    onClick={option.action}
                    onMouseEnter={() => setHoveredOption(option.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 shadow-sm"
                        : "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:shadow-md"
                    } ${option.isAdmin ? "border-l-4 border-red-500" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${option.bgColor} flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          option.isAdmin ? "ring-2 ring-red-200 dark:ring-red-800" : ""
                        }`}
                      >
                        <option.icon className="h-5 w-5 text-white" />
                      </div>

                      {sidebarOpen && (
                        <div className="flex-1 min-w-0 z-10 relative">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`font-semibold truncate bg-gradient-to-r bg-clip-text text-transparent ${
                                option.isAdmin
                                  ? "from-red-600 to-red-800 dark:from-red-400 dark:to-red-600"
                                  : isActive
                                  ? "from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400"
                                  : "from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100"
                              }`}
                            >
                              {option.title}
                            </span>
                            {option.isNew && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700 z-20 relative">
                                <Sparkles className="h-3 w-3" />
                                Nouveau
                              </span>
                            )}
                            {option.badge && !option.isNew && !option.isAdmin && (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 z-20 relative">
                                {option.badge}
                              </span>
                            )}
                            {option.isAdmin && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300 border border-red-200 dark:border-red-700 z-20 relative">
                                <Shield className="h-3 w-3" />
                                Admin
                              </span>
                            )}
                          </div>
                          {sidebarOpen && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate z-10 relative">
                              {option.description}
                            </p>
                          )}
                        </div>
                      )}

                      {sidebarOpen && (
                        <ChevronRight
                          className={`h-4 w-4 text-emerald-400 transition-transform duration-200 flex-shrink-0 ${
                            hoveredOption === option.id ? "translate-x-1" : ""
                          }`}
                        />
                      )}
                    </div>
                  </button>

                  {/* Tooltip pour les icônes lorsque la sidebar est fermée */}
                  {!sidebarOpen && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-emerald-900 dark:bg-emerald-100 text-white dark:text-emerald-900 text-sm font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                      <div className="font-semibold">{option.title}</div>
                      <div className="text-xs text-emerald-300 dark:text-emerald-600 mt-1">
                        {option.description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section Outils */}
          {sidebarOpen && (
            <div className="mt-6 px-3">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 px-3">
                Outils
              </div>
              <div className="space-y-1">
                  <button
                    onClick={() => { 
                      router.push("/messages"); 
                      if (window.innerWidth < 768) setSidebarOpen(false); 
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0 z-10 relative">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text">
                          Messages
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Communications
                        </div>
                      </div>
                    </div>
                  </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-emerald-100 dark:border-emerald-900/50 p-4">
          {sidebarOpen && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-medium">
                    {user.given_name?.[0]}
                    {user.family_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0 z-10 relative">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {user.given_name} {user.family_name}
                  </div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 truncate">
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
                  </div>
                </div>
                <ModeToggle />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { 
                    router.push("/profile"); 
                    if (window.innerWidth < 768) setSidebarOpen(false); 
                  }}
                  className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors shadow-sm hover:shadow-md text-emerald-700 dark:text-emerald-300"
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Profil</span>
                </button>
                <LogoutLink>
                  <button
                    className="p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm hover:shadow-md"
                    title="Déconnexion"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </LogoutLink>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Bouton menu pour mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
        >
          <Menu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </button>
      )}

      {/* Main content */}
      <div
        className={`min-h-screen bg-white dark:bg-slate-950 transition-all duration-300 ${
          sidebarOpen ? "md:ml-80" : "md:ml-20"
        }`}
      >
        {/* Page content */}
        <main className="p-4 md:p-6 pt-16 md:pt-6 overflow-auto">
          {children}
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </>
  );
}

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();

  if (isLoading || !isAuthenticated) return null;

  return <SidebarContent>{children}</SidebarContent>;
}