"use client";

import {
  Rocket,
  Target,
  Award,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CreatorSection() {
  return (
    <section className="w-full py-20 md:py-28 px-4 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Header avec "Notre histoire" souligné */}
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <h2 className="text-3xl md:text-4xl font-light text-slate-500 dark:text-slate-400 tracking-wide uppercase mb-2">
              Notre histoire
            </h2>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-green-400 transform translate-y-1"></div>
            <div className="absolute bottom-0 left-1/4 w-1/2 h-px bg-emerald-300/50 transform translate-y-2"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 dark:text-white mb-6 leading-tight">
            Du chaos des opportunités
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              à la révolution des talents
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            Une plateforme née de la frustration face aux opportunités manquées, 
            pour créer un écosystème où chaque talent trouve sa place
          </p>
        </div>

        {/* Layout deux colonnes inversées */}
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Colonne gauche - Contenu principal */}
          <div className="space-y-12">
            {/* Constat */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <Target className="h-6 w-6 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    Le constat
                  </h3>
                </div>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="text-lg font-light tracking-wide">
                  Les pipelines de recrutement n'en sont pas vraiment. Les candidats
                  postulent, attendent des semaines sans réponse, reçoivent des convocations
                  à des entretiens fantômes ou des tests sans feedback.
                </p>
                <p className="font-light tracking-wide">
                  J'en ai moi-même fait l'expérience plusieurs fois durant mes études. 
                  Les entreprises improvisent leurs sélections et les recruteurs croulent 
                  sous les CV ou ne trouvent pas de candidats assez qualifiés.
                </p>
                <div className="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                  <p className="font-semibold text-red-600 dark:text-red-400 text-lg">
                    Résultat : tout le monde perd du temps et de l'énergie.
                  </p>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Rocket className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    La solution SkillWokz
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white mb-2 text-lg">
                        Pour les candidats
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light tracking-wide">
                        Se préparer avec l'IA, créer un portfolio vivant et décrocher 
                        les bons entretiens avec des feedbacks constructifs.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white mb-2 text-lg">
                        Pour les recruteurs
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light tracking-wide">
                        Automatiser les tests, gagner du temps précieux et avoir une 
                        clarté totale sur chaque profil avec des données fiables.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-light tracking-wide">
                  Les <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">entreprises</strong> y trouvent un pipeline fiable qui booste leur productivité 
                  et transparence, tandis que les <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">écoles</strong> peuvent suivre l'évolution de leurs 
                  diplômés et valoriser leurs formations.
                </p>
              </div>
            </div>

            {/* Mission finale */}
            <div className="pt-6">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">Notre Mission</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xl leading-relaxed font-light tracking-wide">
                  Dans un pays où le mérite n'est pas toujours récompensé, SkillWokz
                  redonne à chacun la possibilité d'être évalué sur ses vraies compétences.
                </p>
                <p className="mt-4 text-lg font-medium text-emerald-600 dark:text-emerald-400 tracking-wide">
                  Moins de promesses, plus de preuves, plus d'impact.
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite - Avatar et citation */}
          <div className="space-y-8 sticky top-8">
            {/* Présentation créateur */}
              <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <Avatar className="h-40 w-40">
                      <AvatarImage src="/maximedoaw.jpg" alt="Maxime Doaw" />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-3xl font-bold">
                        MD
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-full shadow-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                      Maxime Doaw
                    </h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-lg">
                      Software Engineer & Founder
                    </p>
                  </div>
                </div>
              </div>

              {/* Présentation Ayina */}
              <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <Avatar className="h-40 w-40">
                      <AvatarImage src="/ayina.jpg" alt="Ayina" />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-3xl font-bold">
                        AY
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-full shadow-lg">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                      Ayina Michel
                    </h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium text-lg">
                      Directeur Marketing
                    </p>
                  </div>
                </div>
              </div>

            {/* Citation avec style créatif */}
            <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
              <div className="relative">
                <div className="text-6xl text-emerald-200 dark:text-emerald-800/20 font-serif absolute -top-4 -left-2 leading-none">"</div>
                <blockquote className="text-slate-700 dark:text-slate-300 text-xl leading-relaxed italic relative z-10 font-light tracking-wide pl-6">
                  Au Cameroun, le talent est partout. Mais les opportunités sont rares,
                  mal filtrées et souvent biaisées. SkillWokz veut casser cette logique
                  pour redonner confiance et clarté à tout le processus.
                </blockquote>
                <div className="text-6xl text-emerald-200 dark:text-emerald-800/20 font-serif absolute -bottom-8 -right-2 leading-none">"</div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <div className="w-8 h-0.5 bg-emerald-400"></div>
                  <span className="font-medium">Founders, SkillWokz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}