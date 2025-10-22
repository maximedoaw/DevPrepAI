"use client";

import {
  Rocket,
  Target,
  Award,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CreatorSection() {
  return (
    <section className="w-full py-16 md:py-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Notre histoire
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Du chaos du recrutement à la{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              révolution du talent
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Une plateforme née du ras-le-bol des jeunes talents face à un système
            de recrutement lent, opaque et décourageant.
          </p>
        </div>

        {/* Bloc principal unifié */}
        <Card className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl shadow-xl p-8 md:p-12">
          {/* Présentation créateur */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-800 shadow-xl">
                <AvatarImage src="/maximedoaw.jpg" alt="Maxime Doaw" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-xl font-bold">
                  MD
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 p-1.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
                <Award className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                Maxime Doaw
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                Software Engineer & Founder
              </p>
            </div>
          </div>

          {/* Citation */}
          <blockquote className="text-slate-600 dark:text-slate-400 italic text-lg leading-relaxed mb-10 text-center border-l-4 border-blue-500 pl-6 py-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg">
            "Au Cameroun, le talent est partout. Mais les opportunités sont rares,
            mal filtrées et souvent biaisées. TurboIntMax veut casser cette logique
            pour redonner confiance et clarté à tout le processus."
          </blockquote>

          {/* Contenu principal */}
          <div className="space-y-8">
            {/* Constat */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                  Le constat brutal
                </h4>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  Ici, les pipelines de recrutement n'en sont pas vraiment. Les candidats
                  postulent, attendent des semaines sans réponse, reçoivent des convocations
                  à des entretiens fantômes ou des tests sans feedback (j'en ai moi-même fait 
                  l'expérience plusieurs fois durant mes études). Les entreprises improvisent 
                  leurs sélections et les recruteurs croulent sous les CV ou ne trouve juste pas de candidats assez qualifiés.
                </p>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  Résultat : tout le monde perd du temps et de l'énergie.
                </p>
              </div>
            </div>

            {/* Solution */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Rocket className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                  La promesse TurboIntMax
                </h4>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-medium">
                  TurboIntMax remet de l'ordre, de la transparence et de la crédibilité
                  dans le recrutement. Un espace unique où chaque acteur retrouve du
                  contrôle et du sens.
                </p>
                <p>
                  Pour les <strong>candidats</strong>, c'est la possibilité de se préparer avec l'IA, 
                  créer un portfolio vivant et décrocher les bons entretiens. Pour les <strong>recruteurs</strong>, 
                  c'est l'automatisation des tests, un gain de temps précieux et une clarté 
                  totale sur chaque profil.
                </p>
                <p>
                  Les <strong>entreprises</strong> y trouvent un pipeline fiable qui booste leur productivité 
                  et transparence, tandis que les <strong>écoles</strong> peuvent suivre l'évolution de leurs 
                  diplômés et valoriser leurs formations.
                </p>
              </div>
            </div>

            {/* Message final */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Notre mission</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Dans un pays où le mérite n'est pas toujours récompensé, TurboIntMax
                redonne à chacun la possibilité d'être évalué sur ses vraies compétences.
                Moins de promesses, plus de preuves, plus d'impact.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}