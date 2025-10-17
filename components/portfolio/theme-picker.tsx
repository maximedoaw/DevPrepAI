"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const themes = [
  { id: "blue", name: "Bleu Professionnel", color: "from-blue-500 to-blue-600" },
  { id: "purple", name: "Violet Créatif", color: "from-purple-500 to-purple-600" },
  { id: "emerald", name: "Émeraude Naturel", color: "from-emerald-500 to-emerald-600" },
  { id: "rose", name: "Rose Énergique", color: "from-rose-500 to-rose-600" },
  { id: "amber", name: "Ambre Chaud", color: "from-amber-500 to-amber-600" },
  { id: "indigo", name: "Indigo Techno", color: "from-indigo-500 to-indigo-600" }
];

interface ThemePickerProps {
  portfolioData: any;
  setPortfolioData: (data: any) => void;
}

export default function ThemePicker({ portfolioData, setPortfolioData }: ThemePickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Palette de Couleurs</CardTitle>
        <CardDescription>
          Choisissez votre palette de couleurs principale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="text-center cursor-pointer group"
              onClick={() => setPortfolioData({...portfolioData, theme: theme.id})}
            >
              <div
                className={`relative w-full h-20 rounded-xl bg-gradient-to-r ${theme.color} mb-3 shadow-lg group-hover:scale-105 transition-transform ${
                  portfolioData.theme === theme.id ? "ring-4 ring-offset-2 ring-blue-500" : ""
                }`}
              >
                {portfolioData.theme === theme.id && (
                  <div className="absolute top-2 right-2 bg-white text-blue-600 p-1 rounded-full shadow-lg">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {theme.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}