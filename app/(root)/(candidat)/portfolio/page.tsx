"use client";

import PortfolioBuilder from "@/components/portfolio/portfolio-builder";
import { Sparkles, Eye } from "lucide-react";
import { usePortfolioBuilder } from "@/hooks/usePortfolioBuilder";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  const { user } = useKindeBrowserClient();
  const { portfolio } = usePortfolioBuilder({ userId: user?.id, enabled: !!user?.id });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden">
      {/* Background Gradients & Shapes (matching Dashboard) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[100px] -ml-20 -mb-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8 relative overflow-hidden rounded-3xl border border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/10 shadow-lg group p-6 md:p-10">
          {/* Decorative Elements inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-emerald-400/20 transition-all duration-700"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Construisez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Portfolio</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Créez une vitrine professionnelle unique pour mettre en valeur vos compétences et vos projets.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {portfolio?.id && (
                <Link href={`/portfolio/${portfolio.id}`} target="_blank">
                  <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualiser en Pleine Page
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Builder Content */}
        <div className="relative z-10">
          <PortfolioBuilder />
        </div>
      </div>
    </div>
  );
}