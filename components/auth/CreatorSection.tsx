"use client";

import {
  Rocket,
  Sparkles,
  Quote,
  Target,
  Zap,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const painPoints = [
  {
    title: "Le Décalage Académique",
    desc: "Des années en 'Grandes Écoles' pour des diplômes souvent déconnectés des réalités brutales du terrain."
  },
  {
    title: "Le Sacrifice des Parents",
    desc: "Des économies dilapidées dans des centres de formation sans âme ni qualité, promettant des reconversions miraculeuses."
  },
  {
    title: "Le Goulot des RH",
    desc: "Un recrutement opaque géré par des décideurs qui ne maîtrisent pas toujours les enjeux techniques de demain."
  }
];

export default function CreatorSection() {
  return (
    <section className="py-40 bg-white dark:bg-slate-950 overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6 relative z-20">

        <div className="max-w-5xl mx-auto">
          {/* Header Minimaliste */}
          <div className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-emerald-500/20"
            >
              <Sparkles size={12} />
              <span>La Genèse</span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter leading-[0.9]">
              Réparer un système <br />
              <span className="text-emerald-500 italic font-light">profondément brisé</span>.
            </h2>

            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl leading-relaxed">
              Au Cameroun, le talent existe en abondance, mais il est étouffé par des mentalités d'un autre âge et des formations obsolètes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

            {/* Colonne Narrative */}
            <div className="lg:col-span-7 space-y-16">
              <div className="space-y-12">
                {painPoints.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-start gap-6">
                      <div className="mt-1 w-1 h-12 bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors duration-500" />
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{point.title}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          {point.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 italic border-l-4 border-emerald-500 pl-8"
              >
                "Nous avons créé SkillWokz pour que plus aucun talent camerounais ne soit ignoré par simple manque de réseau ou par un diplôme mal aligné."
              </motion.p>
            </div>

            {/* Colonne Humaine - Épurée */}
            <div className="lg:col-span-5 space-y-12">
              {[
                { name: "Maxime Doaw", role: "Founder & Lead Engineer", img: "/maximedoaw.jpg", fallback: "MD", quote: "SkillWokz redonne au mérite sa juste place. Dans un pays où tout se joue sur les relations, la compétence doit redevenir le seul signal qui compte." },
                { name: "Ayina Michel", role: "Directeur Marketing", img: "/ayina.jpg", fallback: "AM", quote: "Réveiller les consciences techniques et humaniser la tech. Nous ne formons pas des profils, nous révélons des destins." }
              ].map((founder, i) => (
                <motion.div
                  key={founder.name}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-slate-50 dark:bg-slate-900/40 p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-900 group"
                >
                  <div className="flex items-center gap-6 mb-8">
                    <Avatar className="h-16 w-16  transition-all duration-700">
                      <AvatarImage src={founder.img} alt={founder.name} />
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-black">{founder.fallback}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{founder.name}</h5>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{founder.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                    "{founder.quote}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Polish Esthétique - Minimalisme Absolu */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
    </section>
  );
}