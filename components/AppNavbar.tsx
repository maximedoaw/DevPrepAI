"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getUserRoleAndDomains } from "@/actions/user.action";
import { getReceivedInvitations } from "@/actions/bootcamp.action";

// Logo personnalisé 
import Logo from "@/components/logo";

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
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Settings,
  Palette,
  Sun,
  Moon,
  ChartNetwork,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Composant ModeToggle amélioré
function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group relative"
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5">
        <Sun className="absolute inset-0 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400 dark:text-slate-200" />
      </div>
    </button>
  );
}

// Composant pour le bouton d'invitations avec badge
function NotificationsButton({ router }: { router: any }) {
  const { data: notificationsData } = useQuery({
    queryKey: ["received-notifications"],
    queryFn: async () => {
      const result = await getReceivedInvitations();
      return result.success ? result.data : [];
    },
    refetchInterval: 1000 * 60 * 2,
  });

  const pendingCount = notificationsData?.filter((inv: any) => inv.status === 'PENDING').length || 0;

  return (
    <button
      onClick={() => router.push("/notifications")}
      className="relative p-2 rounded-xl hover:bg-amber-50/80 dark:hover:bg-amber-900/20 transition-all duration-300 group"
    >
      <div className="relative h-6 w-6 flex items-center justify-center">
        <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:scale-110" />
        {pendingCount > 0 && (
          <>
            <span className="animate-ping absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400 opacity-75" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-white dark:ring-slate-900 shadow-sm">
              <span className="absolute inset-0 rounded-full animate-pulse bg-amber-400/30" />
            </span>
          </>
        )}
      </div>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-4 transition-all duration-300 rounded-full" />
    </button>
  );
}

// Composant MessageButton amélioré
function MessageButton({ router }: { router: any }) {
  return (
    <button
      onClick={() => router.push("/messages")}
      className="relative p-2 rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all duration-300 group"
    >
      <div className="relative h-6 w-6 flex items-center justify-center">
        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:w-4 transition-all duration-300 rounded-full" />
    </button>
  );
}



export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Routes où la navigation doit être cachée
  const hideSidebarRoutes = ['/jobs/apply'];
  const shouldHideSidebar = hideSidebarRoutes.some(route => pathname?.includes(route));

  // Fermer la sidebar mobile lors du changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await getUserRoleAndDomains(user.id);
      return result;
    },
  });

  const loadingOrUnauth = isLoading || !isAuthenticated;
  const userRole = userData?.role || (userDataLoading ? undefined : "CANDIDATE");
  const isAdmin = userRole === "admin" || userData?.role === "admin" || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // Configuration des options par rôle avec des descriptions plus humaines
  const sidebarConfig = {
    CANDIDATE: [
      { id: "dashboard", title: "Tableau de bord", description: "Votre espace personnel", icon: Home, color: "from-emerald-400 to-teal-500", path: "/" },
      { id: "matching", title: "Portail d'emploi", description: "Trouvez votre voie", icon: Network, color: "from-green-400 to-emerald-500", path: "/jobs", badge: "New" },
      { id: "interviews", title: "Interviews IA", description: "Préparez-vous sereinement", icon: BrainCircuit, color: "from-teal-400 to-cyan-500", path: "/interviews", badge: "IA" },
      { id: "portfolio", title: "Portfolio & CV", description: "Montrez votre talent", icon: Target, color: "from-lime-400 to-emerald-500", path: "/portfolio" },
      { id: "guides", title: "Guides", description: "Apprenez et grandissez", icon: BookOpen, color: "from-amber-400 to-orange-500", path: "/guides" },
      { id: "meetings", title: "Mes entretiens", description: "Vos rendez-vous", icon: Calendar, color: "from-cyan-400 to-blue-500", path: "/meetings" },
    ],
    CAREER_CHANGER: [
      { id: "dashboard", title: "Mon parcours", description: "Votre transformation", icon: Home, color: "from-emerald-400 to-teal-500", path: "/" },
      { id: "interviews", title: "Interviews", description: "Simulations bienveillantes", icon: BrainCircuit, color: "from-teal-400 to-cyan-500", path: "/interviews" },
      { id: "plan", title: "Plan de transition", description: "Votre feuille de route", icon: TrendingUp, color: "from-green-400 to-emerald-500", path: "/plan" },
      { id: "skills", title: "Passerelles", description: "Vos compétences transférables", icon: GitBranch, color: "from-lime-400 to-emerald-500", path: "/skills" },
      { id: "formations", title: "Formations", description: "Développez votre potentiel", icon: GraduationCap, color: "from-emerald-400 to-teal-500", path: "/formations" },
    ],
    RECRUITER: [
      { id: "dashboard", title: "Dashboard RH", description: "Vue d'ensemble", icon: Home, color: "from-emerald-400 to-teal-500", path: "/" },
      { id: "talents", title: "Marketplace", description: "Découvrez les talents", icon: Users, color: "from-teal-400 to-cyan-500", path: "/talents" },
      { id: "matching", title: "Matching", description: "L'intelligence au service du recrutement", icon: Brain, color: "from-green-400 to-emerald-500", path: "/matching" },
      { id: "interviews", title: "Planification", description: "Organisez vos entretiens", icon: Calendar, color: "from-lime-400 to-emerald-500", path: "/interviews" },
      { id: "rapports", title: "Analyse RH", description: "Data & Insights", icon: BarChart3, color: "from-cyan-400 to-blue-500", path: "/rapports" },
    ],
    ENTERPRISE: [
      { id: "dashboard", title: "Espace entreprise", description: "Votre hub RH", icon: Building, color: "from-emerald-400 to-teal-500", path: "/" },
      { id: "interview-planning", title: "Planification", description: "Gestion des entretiens", icon: Calendar, color: "from-teal-400 to-cyan-500", path: "/enterprise-interviews" },
      { id: "talent-matching", title: "Matching", description: "Trouvez vos futurs talents", icon: Network, color: "from-green-400 to-emerald-500", path: "/talent-matching" },
      { id: "workforce-planning", title: "Planification RH", description: "Anticipez l'avenir", icon: Target, color: "from-lime-400 to-emerald-500", path: "/workforce-planning" },
      { id: "bulk-hiring", title: "Recrutement masse", description: "Scalez votre équipe", icon: UsersRound, color: "from-emerald-400 to-teal-500", path: "/bulk-hiring" },
      { id: "training-programs", title: "Programmes", description: "Formez vos équipes", icon: GraduationCap, color: "from-cyan-400 to-blue-500", path: "/training-programs" },
    ],
    BOOTCAMP: [
      { id: "dashboard", title: "Espace bootcamp", description: "Votre centre de formation", icon: Home, color: "from-emerald-400 to-teal-500", path: "/" },
      { id: "learning-lab", title: "Learning Lab", description: "Apprentissage actif", icon: BookOpen, color: "from-green-400 to-emerald-500", path: "/learning-lab" },
      { id: "placement", title: "Placement", description: "Votre réussite professionnelle", icon: Briefcase, color: "from-lime-400 to-emerald-500", path: "/placement" },
      { id: "matching", title: "Matching", description: "Connectez-vous aux entreprises", icon: Handshake, color: "from-cyan-400 to-blue-500", path: "/matching" },
    ],
    SCHOOL: [
      { id: "dashboard", title: "Espace école", description: "Votre écosystème éducatif", icon: Home, color: "from-emerald-400 to-teal-500", path: "/" },
      { id: "pedagogie", title: "Espace pédagogique", description: "Ressources éducatives", icon: BookOpen, color: "from-teal-400 to-cyan-500", path: "/pedagogie" },
      { id: "etudiants", title: "Suivi étudiant", description: "Accompagnez vos étudiants", icon: Users, color: "from-lime-400 to-emerald-500", path: "/etudiants" },
      { id: "carriere", title: "Services carrière", description: "Orientation professionnelle", icon: Briefcase, color: "from-cyan-400 to-blue-500", path: "/carriere" },
      { id: "visibilite", title: "Visibilité", description: "Développez votre réseau", icon: ChartNetwork, color: "from-emerald-400 to-teal-500", path: "/visibilite" },
    ],
  };

  let sidebarOptions = userRole ? sidebarConfig[userRole as keyof typeof sidebarConfig] || [] : [];

  if (isAdmin && userRole !== "admin") {
    sidebarOptions.push({
      id: "admin",
      title: "Administration",
      description: "Gestion de la plateforme",
      icon: Shield,
      color: "from-red-400 to-rose-500",
      path: "/admin",
      badge: "Admin",
    });
  }

  // Logique de redirection et vérification des routes
  const [hasCheckedRoutes, setHasCheckedRoutes] = useState(false);
  const commonAccessibleRoutes = useMemo(
    () => ["/", "/profile", "/settings", "/messages", "/notifications", "/help", "/support"],
    []
  );

  const allowedRoutePrefixes = useMemo(() => {
    const routes = new Set<string>();
    commonAccessibleRoutes.forEach((route) => routes.add(route));
    sidebarOptions.forEach((option) => {
      if (option.path) routes.add(option.path);
    });
    return Array.from(routes);
  }, [sidebarOptions, commonAccessibleRoutes]);

  useEffect(() => {
    if (userDataLoading || loadingOrUnauth || sidebarOptions.length === 0 || !userRole || isAdmin) {
      setHasCheckedRoutes(true);
      return;
    }

    const normalizedPath = pathname?.split("?")[0] || "/";
    const isAllowed = allowedRoutePrefixes.some((route) => {
      if (!route) return false;
      if (route === "/") return normalizedPath === "/";
      return normalizedPath === route || normalizedPath.startsWith(`${route}/`);
    });

    if (!isAllowed && !hasCheckedRoutes) {
      const fallbackRoute = sidebarOptions.find((option) => option.path)?.path || "/";
      router.replace(fallbackRoute);
    }

    setHasCheckedRoutes(true);
  }, [pathname, allowedRoutePrefixes, sidebarOptions, router, isAdmin, loadingOrUnauth, userDataLoading, userRole, hasCheckedRoutes]);

  if (loadingOrUnauth) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col font-sans antialiased">
      {/* Navbar élégante */}
      {!shouldHideSidebar && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 mb-10 z-50 px-4 md:px-6 flex items-center justify-between transition-all duration-300">

          {/* Logo & Menu Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>

            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="scale-75 origin-left">
                <Logo />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent hidden sm:block">
                SkillWokz
              </span>
            </Link>
          </div>

          {/* Navigation Desktop - Icônes avec tooltips personnalisés */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {sidebarOptions.map((option) => {
              const isActive = pathname === option.path || (option.path !== "/" && pathname?.startsWith(option.path || ""));
              return (
                <Link
                  key={option.id}
                  href={option.path || "#"}
                  className={cn(
                    "relative p-2.5 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  <option.icon className="h-5 w-5" />

                  {/* Tooltip personnalisé avec animation */}
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg z-50">
                    {option.title}
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-white" />
                  </span>

                  {/* Badge indicateur */}
                  {(option as any).badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions Utilisateur */}
          <div className="flex items-center gap-2 md:gap-3">
            <ModeToggle />
            <div className="hidden sm:flex items-center gap-2">
              <MessageButton router={router} />
              <NotificationsButton router={router} />
            </div>

            {/* Avatar avec menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-3 sm:border-l border-slate-200 dark:border-slate-800 outline-none">
                  <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-900 shadow-sm">
                    <AvatarImage src={userData?.imageUrl || user?.picture || undefined} />
                    <AvatarFallback className="bg-emerald-600 text-white font-medium text-sm">
                      {(user?.given_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 rounded-xl border-slate-200 dark:border-slate-800 shadow-lg"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {user?.given_name || "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="rounded-lg cursor-pointer p-2 gap-2"
                >
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Mon Profil</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="rounded-lg cursor-pointer p-2 gap-2"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Paramètres</span>
                </DropdownMenuItem>

                <div className="sm:hidden border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  <DropdownMenuItem onClick={() => router.push("/notifications")} className="rounded-lg cursor-pointer p-2 gap-2">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/messages")} className="rounded-lg cursor-pointer p-2 gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    <span>Messages</span>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <LogoutLink>
                  <DropdownMenuItem className="rounded-lg cursor-pointer p-2 gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </LogoutLink>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      {/* Sidebar Mobile - Design épuré */}
      {!shouldHideSidebar && (
        <>
          <div
            className={cn(
              "fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300",
              sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            )}
            onClick={() => setSidebarOpen(false)}
          />

          <div className={cn(
            "fixed inset-y-0 left-0 w-[80%] max-w-xs bg-white dark:bg-slate-900 shadow-2xl z-50 md:hidden transform transition-transform duration-300 flex flex-col",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            {/* En-tête */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="scale-75 origin-left">
                  <Logo />
                </div>
                <span className="font-semibold text-lg text-slate-800 dark:text-white">SkillWokz</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userData?.imageUrl || user?.picture || undefined} />
                  <AvatarFallback className="bg-emerald-600 text-white font-medium">
                    {(user?.given_name?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {userData?.username || user?.given_name || "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userData?.email || user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {sidebarOptions.map((option) => {
                  const isActive = pathname === option.path || (option.path !== "/" && pathname?.startsWith(option.path || ""));
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        router.push(option.path || "#");
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-emerald-500 text-white"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <option.icon className="h-5 w-5" />
                      <span className="font-medium">{option.title}</span>
                      {(option as any).badge && (
                        <span className={cn(
                          "ml-auto text-xs px-1.5 py-0.5 rounded-full",
                          isActive ? "bg-white/20" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}>
                          {(option as any).badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

              {/* Actions secondaires */}
              <div className="space-y-1">
                <button
                  onClick={() => { router.push('/profile'); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="h-5 w-5" />
                  <span>Mon Profil</span>
                </button>
                <button
                  onClick={() => { router.push('/settings'); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="h-5 w-5" />
                  <span>Paramètres</span>
                </button>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5" />
                    <span>Thème</span>
                  </div>
                  <ModeToggle />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <LogoutLink>
                <Button variant="outline" className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-slate-300 dark:border-slate-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </LogoutLink>
            </div>
          </div>
        </>
      )}

      {/* Contenu Principal */}
      <main className={cn(
        "flex-1 transition-all duration-500",
        !shouldHideSidebar && "pt-16"
      )}>
        {children}
      </main>
    </div>
  );
}