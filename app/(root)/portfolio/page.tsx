"use client";


import PortfolioBuilder from "@/components/portfolio/portfolio-builder";
export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
      <PortfolioBuilder />
    </div>
  );
}