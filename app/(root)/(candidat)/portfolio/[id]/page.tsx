"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPortfolioById } from "@/actions/portfolio.action";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Languages, 
  Heart,
  ExternalLink,
  Calendar,
  MapPin,
  Mail,
  Globe,
  Github,
  Linkedin,
  Twitter
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClassicTemplate from "@/components/portfolio/templates/classic-template";
import ModernTemplate from "@/components/portfolio/templates/modern-template";
import MinimalTemplate from "@/components/portfolio/templates/minimal-template";
import { PortfolioTemplate } from "@prisma/client";
import { useParams } from "next/navigation";

function PortfolioContent() {
  const params = useParams();
  const portfolioId = params.id as string;
  
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ["portfolio", portfolioId],
    queryFn: async () => {
      if (!portfolioId) return null;
      return await getPortfolioById(portfolioId);
    },
    enabled: !!portfolioId,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Portfolio non trouvé
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Ce portfolio n'existe pas ou n'est pas publié.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Préparer les données pour les templates
  const portfolioData = {
    name: portfolio.title,
    headline: portfolio.headline,
    bio: portfolio.bio,
    profileImage: portfolio.avatarUrl,
    template: portfolio.template,
    theme: portfolio.themeColor || "blue",
    isPublic: true,
    skills: portfolio.skills,
    languages: portfolio.languages,
    interests: portfolio.interests,
    projects: portfolio.projects,
    experiences: portfolio.experiences,
    education: portfolio.education,
    certifications: portfolio.certifications,
    sections: portfolio.sections,
    socialLinks: portfolio.socialLinks,
    achievements: portfolio.achievements
  };

  // Sélectionner le template approprié
  const renderTemplate = () => {
    switch (portfolio.template) {
      case PortfolioTemplate.MODERN:
        return <ModernTemplate portfolioData={portfolioData} />;
      case PortfolioTemplate.MINIMAL:
        return <MinimalTemplate portfolioData={portfolioData} />;
      case PortfolioTemplate.CLASSIC:
      default:
        return <ClassicTemplate portfolioData={portfolioData} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {renderTemplate()}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    }>
      <PortfolioContent />
    </Suspense>
  );
}

