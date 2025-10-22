"use client";
import React, { useState } from "react";
import Slider from "react-slick";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaCode, FaCogs, FaComments, FaLightbulb, FaChartBar, FaUserTie, FaBrain } from "react-icons/fa";
import type { Settings } from "react-slick";
import type { ReactNode, MouseEvent } from "react";
import { BookOpen, Code, Brain, User, Lightbulb, MessageCircle, UserCheck, BarChart3, CheckCircle } from 'lucide-react';

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
    <main className="px-2 md:px-8 py-6 max-w-5xl mx-auto">
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
