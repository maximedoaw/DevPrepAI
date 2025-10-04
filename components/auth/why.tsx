"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Star,
  GraduationCap,
  Briefcase,
  User,
  Building2,
  Users,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- 🧩 Comparatif concurrentiel ---
const competitors = [
  {
    name: "LinkedIn",
    points: [
      { text: "Réseau professionnel global", hasIt: false },
      { text: "Préparation immersive aux entretiens techniques", hasIt: true },
      { text: "Simulation IA multi-domaines", hasIt: true },
      { text: "Accompagnement carrière personnalisé", hasIt: false },
      { text: "Suivi des étudiants pour écoles / bootcamps", hasIt: false },
      { text: "Analyse des soft skills", hasIt: false },
      { text: "Matching candidat ↔ entreprise intelligent", hasIt: true },
      { text: "Coaching CV & profil automatisé", hasIt: true },
      { text: "Portfolios dynamiques hébergés", hasIt: false },
      { text: "Statistiques de progression / insertion", hasIt: false },
    ],
  },
  {
    name: "LeetCode",
    points: [
      { text: "Exercices de code pour développeurs", hasIt: true },
      { text: "Simulation d'entretien complet (QCM + oral)", hasIt: false },
      { text: "Métiers non-techniques (finance, business...)", hasIt: false },
      { text: "Suivi personnalisé de progression", hasIt: false },
      { text: "Outils pour écoles / encadreurs", hasIt: false },
      { text: "Soft skills & communication évaluées", hasIt: false },
      { text: "Matching IA avec recruteurs", hasIt: false },
      { text: "CV auto-générés", hasIt: false },
      { text: "Portfolio projet automatisé", hasIt: false },
      { text: "Coaching employabilité global", hasIt: false },
    ],
  },
  {
    name: "InterviewBuddy",
    points: [
      { text: "Entretiens simulés avec humains", hasIt: true },
      { text: "Intégration IA pour feedback instantané", hasIt: false },
      { text: "Évolutif à grande échelle (mass market)", hasIt: false },
      { text: "Outils pédagogiques pour écoles", hasIt: false },
      { text: "Tableaux de bord entreprise / RH", hasIt: false },
      { text: "Suivi multi-domaines professionnels", hasIt: false },
      { text: "Matching automatique candidats / postes", hasIt: false },
      { text: "Coaching CV & profil LinkedIn", hasIt: false },
      { text: "Gamification apprentissage / badges", hasIt: false },
      { text: "Personnalisation selon niveau & secteur", hasIt: false },
    ],
  },
];

// --- 🚀 Ton SaaS ---
const turboIntMax = {
  name: "🚀 TurboIntMax",
  points: [
    { text: "Simulation IA réaliste multi-métiers", hasIt: true },
    { text: "Matching intelligent candidats ↔ recruteurs", hasIt: true },
    { text: "Suivi de progression individuel & collectif", hasIt: true },
    { text: "Dashboard écoles / entreprises / bootcamps", hasIt: true },
    { text: "Analyse IA des soft skills et hard skills", hasIt: true },
    { text: "CV, rapports et portfolios auto-générés", hasIt: true },
    { text: "Gamification apprentissage (badges & scores)", hasIt: true },
    { text: "Recommandations de carrière personnalisées", hasIt: true },
    { text: "Intégration LinkedIn & export multi-plateformes", hasIt: true },
    { text: "Coaching vocal & émotionnel (Hume AI)", hasIt: true },
  ],
};

// --- 🎯 Public cible ---
const targetAudiences = [
  {
    icon: User,
    title: "Étudiants & Bootcamps",
    desc: "Préparez-vous efficacement pour votre entrée sur le marché du travail",
    keyBenefits: [
      "Simulations d'entretiens réalistes",
      "Feedback instantané par IA",
      "Portfolio auto-généré",
      "Suivi de progression détaillé",
    ],
  },
  {
    icon: Briefcase,
    title: "Professionnels en reconversion",
    desc: "Changez de carrière en toute confiance avec un accompagnement sur mesure",
    keyBenefits: [
      "Évaluation des compétences transférables",
      "Préparation aux entretiens sectoriels",
      "Matching avec les entreprises",
      "Coaching personnalisé",
    ],
  },
  {
    icon: Building2,
    title: "Recruteurs & RH",
    desc: "Trouvez les talents parfaits grâce à notre matching intelligent",
    keyBenefits: [
      "Accès à des candidats pré-qualifiés",
      "Analyses détaillées des compétences",
      "Gain de temps sur le screening",
      "Meilleure rétention des talents",
    ],
  },
  {
    icon: GraduationCap,
    title: "Écoles & Formations",
    desc: "Améliorez l'insertion professionnelle de vos étudiants",
    keyBenefits: [
      "Dashboard de suivi collectif",
      "Rapports d'insertion détaillés",
      "Outils pédagogiques intégrés",
      "Partenaire de carrière innovant",
    ],
  },
  {
    icon: Users,
    title: "Entreprises & Startups",
    desc: "Optimisez votre processus de recrutement et développement des talents",
    keyBenefits: [
      "Évaluation technique et comportementale",
      "Benchmarking des compétences",
      "Formation continue des équipes",
      "Réduction du turnover",
    ],
  },
];

export default function WhyTurboIntMax() {
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const elements = cardsRef.current.querySelectorAll(".compare-card");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.2,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
        }
      );
    }

    if (targetRef.current) {
      const targets = targetRef.current.querySelectorAll(".audience-card");
      gsap.fromTo(
        targets,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: targetRef.current, start: "top 85%" },
        }
      );
    }

    if (tableRef.current) {
      const rows = tableRef.current.querySelectorAll(".feature-row");
      gsap.fromTo(
        rows,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: tableRef.current, start: "top 80%" },
        }
      );
    }
  }, []);

  return (
    <>
      {/* 🔹 Tableau Comparatif Élégant */}
      <section className="relative py-16 bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Comparatif{" "}
              <span className="text-blue-600 dark:text-blue-400">
                TurboIntMax
              </span>{" "}
              vs Concurrents
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Découvrez pourquoi TurboIntMax surpasse toutes les solutions
              existantes
            </p>
          </div>

          {/* Tableau Desktop */}
          <div ref={tableRef} className="hidden lg:block">
            <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardContent className="p-0">
                {/* En-tête du tableau */}
                <div className="grid grid-cols-[2fr_repeat(4,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 p-4">
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Fonctionnalités
                    </h3>
                  </div>
                  {[...competitors, turboIntMax].map((comp, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-center gap-2 ${
                        comp.name.includes("TurboIntMax")
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-slate-700 dark:text-slate-200 font-medium"
                      }`}
                    >
                      {comp.name.includes("TurboIntMax") && (
                        <Star className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="truncate text-sm text-center">
                        {comp.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Corps du tableau */}
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {turboIntMax.points.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="grid grid-cols-[2fr_repeat(4,1fr)] hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Colonne des fonctionnalités */}
                      <div className="flex items-center px-4 py-3 border-r border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {feature.text}
                        </p>
                      </div>

                      {/* Colonnes des plateformes */}
                      {[...competitors, turboIntMax].map((comp, compIndex) => (
                        <div
                          key={compIndex}
                          className="flex items-center justify-center px-4 py-3"
                        >
                          {comp.points[featureIndex]?.hasIt ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Version Mobile - Cards */}
          <div ref={cardsRef} className="lg:hidden space-y-6">
            {[...competitors, turboIntMax].map((comp, idx) => (
              <Card
                key={idx}
                className={`compare-card rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg
                  ${
                    comp.name.includes("TurboIntMax")
                      ? "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                  }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className={`text-lg font-bold ${
                        comp.name.includes("TurboIntMax")
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {comp.name}
                    </CardTitle>
                    {comp.name.includes("TurboIntMax") && (
                      <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {comp.points.map((point, pointIndex) => (
                    <div
                      key={pointIndex}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        point.hasIt
                          ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      {point.hasIt ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          point.hasIt
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {point.text}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 Public cible */}
      <section className="relative py-16 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              À qui s'adresse{" "}
              <span className="text-blue-600 dark:text-blue-400">
                TurboIntMax
              </span>{" "}
              ?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Une solution adaptée à tous les acteurs de l'écosystème
              emploi-formation
            </p>
          </div>

          <div
            ref={targetRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          >
            {targetAudiences.map((aud, idx) => (
              <Card
                key={idx}
                className="audience-card group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="flex flex-col items-center space-y-4 pb-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                    <aud.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-center text-slate-800 dark:text-slate-200">
                    {aud.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                    {aud.desc}
                  </p>
                  <div className="space-y-2">
                    {aud.keyBenefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                      >
                        <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
