"use client";
import React, { useEffect, useState, useTransition } from "react";
import Slider from "react-slick";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaCode, FaCogs, FaComments, FaLightbulb, FaChartBar, FaUserTie, FaBrain } from "react-icons/fa";
import type { Settings } from "react-slick";
import type { ReactNode, MouseEvent } from "react";
import { BookOpen, Code, Brain, User, Lightbulb, MessageCircle, UserCheck, BarChart3, CheckCircle, Loader2, CheckCircle2, X, Sparkles } from 'lucide-react';
import { startCareerTest, refuseCareerTest, submitCareerTest, getCareerProfile, type CareerTestAnswer } from "@/actions/career-profile.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const learningPaths = [
  {
    id: "google-swe",
    title: "Google SWE Path",
    logo: "/covers/google.png",
    description: "Prépare-toi pour un entretien Software Engineer chez Google avec ce parcours structuré.",
    steps: [
      { title: "Algorithmes & Structures de données", desc: "Maîtrise les bases et les patterns avancés.", icon: <Code className="w-7 h-7" /> },
      { title: "Systèmes & Design", desc: "Prépare les questions de system design et scalability.", icon: <BarChart3 className="w-7 h-7" /> },
      { title: "Coding Interviews", desc: "Entraîne-toi sur des problèmes types Google (LeetCode, etc).", icon: <Lightbulb className="w-7 h-7" /> },
      { title: "Soft Skills", desc: "Prépare les questions comportementales et la culture Google.", icon: <MessageCircle className="w-7 h-7" /> },
      { title: "Mock Interviews", desc: "Participe à des simulations d'entretien pour t'entraîner en conditions réelles.", icon: <UserCheck className="w-7 h-7" /> },
      { title: "Feedback & Amélioration", desc: "Analyse tes performances et améliore-toi grâce aux retours.", icon: <Brain className="w-7 h-7" /> },
    ],
  },
  {
    id: "amazon-sde",
    title: "Amazon SDE Path",
    logo: "/covers/amazon.png",
    description: "Le chemin idéal pour réussir les entretiens Software Development Engineer chez Amazon.",
    steps: [
      { title: "Leadership Principles", desc: "Assimile les 16 principes de leadership Amazon.", icon: <BookOpen className="w-7 h-7" /> },
      { title: "Coding & DSA", desc: "Résous des problèmes d’algorithmes typiques Amazon.", icon: <Code className="w-7 h-7" /> },
      { title: "System Design", desc: "Prépare les entretiens de design technique.", icon: <BarChart3 className="w-7 h-7" /> },
      { title: "Bar Raiser", desc: "Comprends le rôle du Bar Raiser et comment t’y préparer.", icon: <User className="w-7 h-7" /> },
      { title: "Simulation d'entretien", desc: "Passe des mock interviews avec feedback Amazon.", icon: <UserCheck className="w-7 h-7" /> },
      { title: "Optimisation & Review", desc: "Analyse tes points faibles et optimise ta préparation.", icon: <CheckCircle className="w-7 h-7" /> },
    ],
  },
  {
    id: "facebook-ds",
    title: "Meta Data Scientist Path",
    logo: "/covers/facebook.png",
    description: "Un parcours pour exceller aux entretiens Data Scientist chez Meta (Facebook).",
    steps: [
      { title: "SQL & Analyse", desc: "Maîtrise les requêtes SQL et l’analyse de données.", icon: <BarChart3 className="w-7 h-7" /> },
      { title: "Product Sense", desc: "Développe ton sens produit et ta capacité à raisonner business.", icon: <Lightbulb className="w-7 h-7" /> },
      { title: "Machine Learning", desc: "Prépare les questions ML et statistiques avancées.", icon: <Brain className="w-7 h-7" /> },
      { title: "Behavioral", desc: "Prépare les entretiens comportementaux spécifiques à Meta.", icon: <MessageCircle className="w-7 h-7" /> },
      { title: "Étude de cas", desc: "Travaille sur des études de cas réelles pour t'entraîner.", icon: <BookOpen className="w-7 h-7" /> },
      { title: "Feedback & Progression", desc: "Analyse les retours et progresse continuellement.", icon: <UserCheck className="w-7 h-7" /> },
    ],
  },
];

function NextArrow(props: { className?: string; style?: React.CSSProperties; onClick?: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const { className, style, onClick } = props;
  return (
    <button
      aria-label="Suivant"
      className="absolute top-1/2 -right-8 z-10 transform -translate-y-1/2 border border-blue-200 bg-white/80 hover:bg-blue-50 transition rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ ...style }}
      onClick={onClick}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><path d="M10 7l7 7-7 7" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}
function PrevArrow(props: { className?: string; style?: React.CSSProperties; onClick?: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const { className, style, onClick } = props;
  return (
    <button
      aria-label="Précédent"
      className="absolute top-1/2 -left-8 z-10 transform -translate-y-1/2 border border-blue-200 bg-white/80 hover:bg-blue-50 transition rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ ...style }}
      onClick={onClick}
    >
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28"><path d="M18 7l-7 7 7 7" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}

export default function LearningPathPage() {
  const [selected, setSelected] = useState(learningPaths[0]);
  const [testStatus, setTestStatus] = useState<"idle" | "accepted" | "refused" | "done">("idle");
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const questions = [
    { id: "role", label: "Parle-moi de ton rôle actuel ou ciblé.", placeholder: "Ex: Développeur front, Product designer, Data analyst..." },
    { id: "tasks", label: "Quelles sont tes missions quotidiennes ou celles que tu souhaites faire ?", placeholder: "Ex: Intégration UI, A/B tests, dashboards data, refonte archi..." },
    { id: "stack", label: "Quelles techno / outils utilises-tu ou veux-tu pratiquer ?", placeholder: "Ex: TypeScript, React, Next.js, SQL, Python, Figma..." },
    { id: "preferences", label: "Préférences de travail (remote, rythme, taille d'équipe) ?", placeholder: "Ex: full remote, équipe 5-8, cadence sprint, produit early stage..." },
    { id: "ambition", label: "Objectifs de carrière à 12-18 mois ?", placeholder: "Ex: passer lead, renforcer data, rejoindre scale-up produit..." }
  ];

  // Charger profil existant
  useEffect(() => {
    void (async () => {
      const res = await getCareerProfile();
      if (res.success && res.data) {
        const d: any = res.data;
        setProfile(d.careerProfile || null);
        if (d.careerProfileTestStatus === "DONE") setTestStatus("done");
        if (d.careerProfileTestStatus === "REFUSED") setTestStatus("refused");
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formatted: CareerTestAnswer[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || ""
    }));
    const res = await submitCareerTest(formatted, {});
    if (res.success && res.data) {
      setProfile(res.data);
      setTestStatus("done");
    }
    setIsSubmitting(false);
    setShowModal(false);
  };
  const settings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
    appendDots: (dots: ReactNode) => (
      <div style={{ bottom: '-30px' }}>
        <ul className="flex justify-center gap-2 mt-2">{dots}</ul>
      </div>
    ),
    customPaging: (_i: number) => (
      <div className="w-3 h-3 rounded-full bg-blue-300 hover:bg-blue-500 transition" />
    ),
  };
  return (
    <main className="px-2 md:px-8 py-6 max-w-5xl mx-auto space-y-8">
      {/* Carte mini test IA - mise en avant */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 shadow-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">IA</Badge>
              <p className="text-sm uppercase font-semibold text-emerald-600">Mock interview express</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              Profil de carrière en 3 minutes
              {testStatus === "done" && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
            </h2>
            <p className="text-slate-600 md:text-lg">
              Passe un mini entretien IA (Gemini + ElevenLabs) pour cerner ton profil, tes préférences et tes ambitions. Tu peux accepter ou refuser.
            </p>
            {testStatus === "accepted" && (
              <p className="text-emerald-700 font-semibold">Test accepté : ouverture du questionnaire…</p>
            )}
            {testStatus === "refused" && (
              <p className="text-slate-500">Test refusé. Tu pourras le relancer plus tard depuis ce tableau.</p>
            )}
            {testStatus === "done" && profile && (
              <div className="mt-3 p-3 rounded-xl border border-emerald-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Sparkles className="h-4 w-4" /> Profil généré
                </div>
                <p className="text-slate-700 mt-1 text-sm">{profile.summary}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.persona?.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="border-emerald-200 text-emerald-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg hover:bg-emerald-700 transition"
              onClick={() => {
                startTransition(async () => {
                  setTestStatus("accepted");
                  setShowModal(true);
                  await startCareerTest();
                });
              }}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lancer le test"}
            </Button>
            <Button
              variant="outline"
              className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              onClick={() => {
                startTransition(async () => {
                  setTestStatus("refused");
                  await refuseCareerTest();
                });
              }}
              disabled={isPending}
            >
              Plus tard
            </Button>
          </div>
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Chemins d’apprentissage pour les entretiens de grandes entreprises</h1>
      <p className="text-center text-gray-600 mb-8">Choisis un parcours pour découvrir les étapes clés et te préparer efficacement.</p>
      <div className="mb-8 relative">
        <Slider {...settings}>
          {learningPaths.map((path) => (
            <div key={path.id} className="px-2">
              <div
                className={`group rounded-2xl shadow-xl p-6 bg-white cursor-pointer border-2 transition-all duration-200 h-full flex flex-col items-center justify-between hover:scale-105 hover:shadow-2xl ${selected.id === path.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}`}
                onClick={() => setSelected(path)}
                tabIndex={0}
                aria-label={`Sélectionner le parcours ${path.title}`}
                onKeyDown={e => { if (e.key === 'Enter') setSelected(path); }}
              >
                <div className="flex flex-col items-center mb-3">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2 border border-blue-100 shadow-sm">
                    <img src={path.logo} alt={path.title} className="w-10 h-10 object-contain" />
                  </div>
                  <span className="font-semibold text-lg text-center group-hover:text-blue-700 transition">{path.title}</span>
                </div>
                <p className="text-gray-500 text-sm text-center mb-2">{path.description}</p>
                {selected.id === path.id && <span className="mt-2 text-xs text-blue-600 font-bold">Sélectionné</span>}
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <section>
        <VerticalTimeline animate={true} lineColor="#2563eb" className="!before:!bg-blue-600 !before:!w-2 !before:!shadow-lg">
          {selected.steps.map((step, idx) => (
            <VerticalTimelineElement
              key={idx}
              contentStyle={{ background: '#f3f4f6', color: '#222', boxShadow: '0 2px 8px #0001' }}
              contentArrowStyle={{ borderRight: '7px solid #f3f4f6' }}
              iconStyle={{ background: '#fff', color: '#2563eb', border: '2.5px solid #2563eb', boxShadow: '0 2px 8px #2563eb22', width: 56, height: 56, fontSize: 32, padding: 0 }}
              icon={step.icon}
            >
              <h3 className="font-bold text-lg mb-1">{step.title}</h3>
              <p className="text-gray-700">{step.desc}</p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </section>
    </main>
    );
}

// Modal léger pour le mini test
function CareerTestModal({
  open,
  onClose,
  questions,
  answers,
  setAnswers,
  currentQuestion,
  setCurrentQuestion,
  onSubmit,
  isSubmitting
}: {
  open: boolean;
  onClose: () => void;
  questions: { id: string; label: string; placeholder?: string }[];
  answers: Record<string, string>;
  setAnswers: (v: Record<string, string>) => void;
  currentQuestion: number;
  setCurrentQuestion: (n: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}) {
  const q = questions[currentQuestion];
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase text-emerald-600 font-semibold">Mini test IA</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profil de carrière</h3>
            <p className="text-slate-500 text-sm">Réponds brièvement, l’IA s’occupe du reste.</p>
          </div>
          <button
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {currentQuestion + 1}/{questions.length} — {q.label}
          </div>
          <textarea
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[140px]"
            placeholder={q.placeholder}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Tu peux passer ou revenir en arrière à tout moment.</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Précédent
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}>
                Suivant
              </Button>
            ) : (
              <Button onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
