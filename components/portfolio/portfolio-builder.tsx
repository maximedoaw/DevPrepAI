"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Sparkles, User, Palette, Layout, Eye, Download } from "lucide-react";
import AISuggestions from "./ai-suggestions";
import ManualInput from "./manual-input";
import TemplateGallery from "./template-gallery";
import ThemePicker from "./theme-picker";
import PortfolioPreview from "./portfolio-preview";
import SectionBuilder from "./section-builder";
import ExportPanel from "./export-panel";

const initialPortfolioData = {
  headline: "",
  bio: "",
  projects: [],
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  interests: [],
  template: "MODERN",
  theme: "blue",
  isPublic: true,
  sections: ["projects", "experiences", "skills"]
};

export default function PortfolioBuilder() {
  const [portfolioData, setPortfolioData] = useState(initialPortfolioData);
  const [activeTab, setActiveTab] = useState("content");

  const tabs = [
    { id: "content", label: "Contenu", icon: User },
    { id: "design", label: "Design", icon: Palette },
    { id: "layout", label: "Sections", icon: Layout },
    { id: "preview", label: "Aperçu", icon: Eye },
    { id: "export", label: "Export", icon: Download }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Créateur de Portfolio
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Créez un portfolio professionnel unique. Utilisez l'IA pour générer du contenu ou personnalisez tout manuellement.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
<div className="xl:col-span-1">
  <Card className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-600" />
        Configuration
      </CardTitle>
      <CardDescription>
        Étape {tabs.findIndex(tab => tab.id === activeTab) + 1} sur {tabs.length}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const stepNumber = tabs.findIndex(t => t.id === tab.id) + 1;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveTab(tab.id)}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                isActive 
                  ? "bg-white text-blue-600" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {stepNumber}
              </div>
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </CardContent>
  </Card>
</div>

        {/* Contenu principal */}
        <div className="xl:col-span-3">
          <Card className="min-h-[600px]">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Étape 1: Contenu */}
                <TabsContent value="content" className="space-y-6 m-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AISuggestions 
                      portfolioData={portfolioData}
                      setPortfolioData={setPortfolioData}
                    />
                    <ManualInput 
                      portfolioData={portfolioData}
                      setPortfolioData={setPortfolioData}
                    />
                  </div>
                </TabsContent>

                {/* Étape 2: Design */}
                <TabsContent value="design" className="space-y-6 m-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TemplateGallery 
                      portfolioData={portfolioData}
                      setPortfolioData={setPortfolioData}
                    />
                    <ThemePicker 
                      portfolioData={portfolioData}
                      setPortfolioData={setPortfolioData}
                    />
                  </div>
                </TabsContent>

                {/* Étape 3: Sections */}
                <TabsContent value="layout" className="m-0">
                  <SectionBuilder 
                    portfolioData={portfolioData}
                    setPortfolioData={setPortfolioData}
                  />
                </TabsContent>

                {/* Étape 4: Aperçu */}
                <TabsContent value="preview" className="m-0">
                  <PortfolioPreview portfolioData={portfolioData} />
                </TabsContent>

                {/* Étape 5: Export */}
                <TabsContent value="export" className="m-0">
                  <ExportPanel 
                    portfolioData={portfolioData}
                    onExport={() => setActiveTab("preview")}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}