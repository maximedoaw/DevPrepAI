"use client"

import { CheckCircle2, XCircle, Users, GraduationCap, Briefcase, Building2, User, Target, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"

const WhySkillWokz = () => {
  const withoutPoints = [
    "Perte de temps sur plusieurs plateformes différentes sans coordination",
    "Recherche d'emploi non intelligente sans matching personnalisé",
    "Les données candidats-entreprises ne sont pas matchées efficacement",
    "Les recruteurs ne voient pas votre véritable potentiel (CV statique uniquement)",
    "Aucun suivi de progression unifié entre formation et emploi",
    "Données éparpillées sans analyse intelligente",
    "Recommandations basiques sans matching personnalisé",
    "Candidatures manuelles longues sur chaque plateforme",
    "Isolement entre étudiants, formateurs et entreprises",
    "Aucune preuve concrète des compétences techniques et soft skills",
    "LinkedIn : réseau social professionnel mais pas d'évaluation réelle des compétences",
    "LinkedIn : pas de préparation aux entretiens intégrée",
    "LinkedIn : matching basique basé sur le profil, pas sur les compétences réelles"
  ]

  const withPoints = [
    {
      title: "Suivi intelligent de carrière 📊",
      text: "Contrairement aux plateformes dispersées, un tableau de bord unifié pour tous vos progrès.",
    },
    {
      title: "Entretiens simulés avec IA 🤖",
      text: "Plus complet que LinkedIn : techniques, QCM et soft skills notés automatiquement.",
    },
    {
      title: "Portfolio dynamique 3D 🌐",
      text: "Contrairement aux CV statiques LinkedIn, une présentation interactive qui vous démarque.",
    },
    {
      title: "Matching intelligent 💼",
      text: "Plus précis que LinkedIn : scores IA basés sur tests réels et compatibilité.",
    },
    {
      title: "Reconversion guidée 🧭",
      text: "Accompagnement intégré avec portfolio et entretiens, absent sur LinkedIn.",
    },
    {
      title: "Collaboration Écoles/Entreprises 🎓",
      text: "Contrairement aux plateformes traditionnelles, un vrai pont entre formation et monde professionnel.",
    },
    {
      title: "Recrutement automatisé ⚙️",
      text: "Plus efficace que les plateformes classiques : pré-sélection IA et profils déjà validés.",
    },
    {
      title: "Recommandations intelligentes 🧠",
      text: "Plus personnalisé que LinkedIn : suggestions basées sur votre progression réelle.",
    },
    {
      title: "Visibilité instantanée 🚀",
      text: "Contrairement aux candidatures traditionnelles, profil visible directement par les recruteurs.",
    },
    {
      title: "Écosystème intégré 🌍",
      text: "Contrairement aux solutions isolées, un seul espace pour tout votre parcours.",
    },
    {
      title: "Évaluation réelle des compétences 🎯",
      text: "LinkedIn montre vos diplômes, nous prouvons vos compétences via des tests pratiques.",
    },
    {
      title: "Préparation intégrée aux entretiens 💬",
      text: "Contrairement à LinkedIn, préparation complète avec feedback IA immédiat.",
    },
    {
      title: "Matching basé sur les performances réelles 📈",
      text: "LinkedIn se base sur votre profil, nous sur vos résultats aux tests et simulations.",
    }
  ]

  const targets = [
    {
      icon: GraduationCap,
      title: "Étudiants & Jeunes diplômés",
      problem: "Difficile de se démarquer sans expérience sur les plateformes classiques",
      solution: "Portfolio 3D + entretiens simulés + matching IA avec entreprises"
    },
    {
      icon: User,
      title: "Personnes en reconversion",
      problem: "Accompagnement limité sans preuves concrètes pour les recruteurs",
      solution: "Tests validants + portfolio + recommandations intelligentes vers nouveaux domaines"
    },
    {
      icon: Users,
      title: "Écoles & Formations",
      problem: "Pas de suivi post-formation sur les plateformes traditionnelles",
      solution: "Dashboard de réussite + statistiques d'insertion + partenariats entreprises"
    },
    {
      icon: Building2,
      title: "Entreprises",
      problem: "Trop de candidatures non qualifiées sur les plateformes classiques",
      solution: "Profils pré-qualifiés IA + scores de compatibilité + entretiens automatisés"
    },
    {
      icon: Briefcase,
      title: "Recruteurs",
      problem: "Processus long sur les plateformes traditionnelles",
      solution: "Matching intelligent + historique complet des tests + décision rapide"
    }
  ]

  return (
    <section className="w-full py-20 px-4 bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
          Sans <span className="text-red-500">SkillWokz</span> vs Avec{" "}
          <span className="text-blue-500">SkillWokz 🚀</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Voici comment nous surpassons les plateformes traditionnelles avec une approche intelligente et intégrée
        </p>
      </div>

      {/* Comparatif principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
        {/* Colonne gauche - Sans SkillWokz */}
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
              Plateformes Traditionnelles
            </h3>
            <div className="w-20 h-1 bg-red-500 mx-auto rounded-full"></div>
          </div>
          
          {withoutPoints.map((item, index) => (
            <Card
              key={index}
              className="flex items-start gap-4 bg-white/80 dark:bg-slate-900/80 border border-red-200/80 dark:border-red-900/50 p-5 rounded-2xl shadow-lg hover:shadow-red-200/50 dark:hover:shadow-red-900/30 transition-all duration-300 hover:-translate-y-1"
            >
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {item}
              </p>
            </Card>
          ))}
        </div>

        {/* Colonne droite - Avec SkillWokz */}
        <div className="space-y-5">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              SkillWokz
            </h3>
            <div className="w-20 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>

          {withPoints.map((point, index) => (
            <div
              key={index}
              className={`transform origin-center ${
                index % 2 === 0 ? 
                "md:-rotate-1 hover:rotate-0" : 
                "md:rotate-1 hover:rotate-0"
              } transition-transform duration-300`}
            >
              <Card className="bg-white/90 dark:bg-slate-900/90 shadow-xl border border-green-200/60 dark:border-green-900/40 backdrop-blur-sm p-6 rounded-2xl hover:shadow-green-200/50 dark:hover:shadow-green-900/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-green-500 mt-0.5" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight">
                      {point.title}
                    </h4>
                    <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                      {point.text}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Section : À qui s'adresse SkillWokz */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-800 dark:text-white">
          À qui s'adresse <span className="text-blue-500">SkillWokz</span> ?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Notre plateforme révolutionne l'expérience de chaque acteur du marché professionnel
        </p>
      </div>

      {/* Cartes cibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {targets.map((target, idx) => (
          <Card
            key={idx}
            className="p-5 border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group min-h-[200px] flex flex-col"
          >
            <div className="flex flex-col items-center text-center space-y-3 flex-grow">
              {/* Icône */}
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <target.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              
              {/* Titre */}
              <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {target.title}
              </h3>
              
              {/* Contenu */}
              <div className="space-y-2 w-full flex-grow flex flex-col">
                {/* Problème */}
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/50 flex-grow">
                  <p className="text-xs text-red-700 dark:text-red-300 font-semibold leading-relaxed">
                    {target.problem}
                  </p>
                </div>
                
                {/* Solution */}
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800/50 flex-grow">
                  <p className="text-xs text-green-700 dark:text-green-300 font-semibold leading-relaxed">
                    {target.solution}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default WhySkillWokz